import { BotChatStatus, CostGuardEvaluation } from "@/types";

// ==============================================================================
// KOZA BISNIS — AI COST GUARD & HUMAN TAKEOVER ENGINE
// Melindungi pengeluaran LLM dari loop pesan, spam, token bombing, & error storms.
// Memfasilitasi ambil alih manual oleh seller (Human Handoff).
// ==============================================================================

// In-memory rate limiting map: Phone -> { timestamps: number[], mutedUntil?: number }
interface RateLimitRecord {
  timestamps: number[];
  mutedUntil?: number;
}
const rateLimitStore = new Map<string, RateLimitRecord>();

// In-memory circuit breaker state
let consecutiveFailures = 0;
let circuitOpenUntil = 0;
const MAX_CONSECUTIVE_FAILURES = 3;
const CIRCUIT_RESET_TIMEOUT_MS = 5 * 60 * 1000; // 5 Menit

// In-memory daily quota tracker: StoreId_Date -> count
const dailyUsageStore = new Map<string, number>();
const DEFAULT_DAILY_STORE_QUOTA = 150; // Maksimal 150 chat AI per hari per toko

// Kata kunci pemicu eskalasi otomatis ke manusia
const SENSITIVE_KEYWORDS = [
  "komplain",
  "retur",
  "rusak",
  "batal",
  "cacat",
  "penipuan",
  "uang kembali",
  "refund",
  "owner",
  "manusia",
  "orang asli",
  "admin asli",
  "bicara dengan orang",
  "hubungi owner",
  "nego harga",
  "diskon khusus",
  "custom ukuran",
  "telepon saya",
  "marah",
  "kecewa",
];

export interface IncomingMessagePayload {
  storeId: string;
  senderPhone: string;
  messageText: string;
  isFromMe?: boolean;      // True jika dikirim dari HP seller sendiri
  isGroup?: boolean;       // True jika pesan berasal dari grup WhatsApp
  currentBotStatus?: BotChatStatus;
  pausedUntil?: string | null;
  currentTurnCount?: number;
}

/**
 * Memeriksa apakah provider AI sedang mengalami Circuit Breaker Open
 */
export function isCircuitBreakerOpen(): boolean {
  if (Date.now() < circuitOpenUntil) {
    return true;
  }
  if (circuitOpenUntil > 0 && Date.now() >= circuitOpenUntil) {
    // Reset circuit breaker
    consecutiveFailures = 0;
    circuitOpenUntil = 0;
  }
  return false;
}

/**
 * Mencatat kegagalan pemanggilan LLM untuk mengaktifkan Circuit Breaker jika perlu
 */
export function recordLLMFailure(): void {
  consecutiveFailures += 1;
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    circuitOpenUntil = Date.now() + CIRCUIT_RESET_TIMEOUT_MS;
    console.warn(`[COST-GUARD] Circuit Breaker OPEN: LLM gagal ${consecutiveFailures}x berturut-turut. Mute 5 menit.`);
  }
}

/**
 * Mencatat keberhasilan pemanggilan LLM untuk mereset kegagalan
 */
export function recordLLMSuccess(storeId: string): void {
  consecutiveFailures = 0;
  const todayKey = `${storeId}_${new Date().toISOString().slice(0, 10)}`;
  const current = dailyUsageStore.get(todayKey) || 0;
  dailyUsageStore.set(todayKey, current + 1);
}

/**
 * Evaluasi menyeluruh terhadap pesan masuk sebelum dikirimkan ke LLM.
 * Mencegah kebocoran biaya dan memfasilitasi human handoff.
 */
export function evaluateIncomingMessage(input: IncomingMessagePayload): CostGuardEvaluation {
  const {
    storeId,
    senderPhone,
    messageText,
    isFromMe = false,
    isGroup = false,
    currentBotStatus = "ACTIVE",
    pausedUntil,
    currentTurnCount = 0,
  } = input;

  const rawText = (messageText || "").trim();

  // ----------------------------------------------------------------------------
  // 1. BLOKIR PESAN GRUP & STATUS
  // ----------------------------------------------------------------------------
  if (isGroup) {
    return {
      shouldProcessLLM: false,
      botStatus: currentBotStatus,
      sanitizedMessage: "",
      rejectionReason: "GROUP_IGNORED",
    };
  }

  // ----------------------------------------------------------------------------
  // 2. DETEKSI AMBIL ALIH ALAMI OLEH SELLER (fromMe === true)
  // ----------------------------------------------------------------------------
  if (isFromMe) {
    const lower = rawText.toLowerCase();

    // Magic Command: Seller ketik !start / !resume
    if (lower === "!start" || lower === "!resume" || lower === "!aktifkan") {
      return {
        shouldProcessLLM: false,
        botStatus: "ACTIVE",
        sanitizedMessage: rawText,
        rejectionReason: "MAGIC_COMMAND",
        immediateReply: "🤖 Bot Jaga AI telah diaktifkan kembali untuk nomor ini.",
      };
    }

    // Magic Command: Seller ketik !pause / !stop
    if (lower === "!pause" || lower === "!stop" || lower === "!mute") {
      return {
        shouldProcessLLM: false,
        botStatus: "PAUSED",
        sanitizedMessage: rawText,
        rejectionReason: "MAGIC_COMMAND",
        immediateReply: "⏸️ Bot Jaga AI dijeda selama 2 jam. Percakapan diambil alih manual.",
      };
    }

    // Seller membalas chat secara manual dari HP miliknya
    // Otomatis PAUSE bot selama 60 menit agar bot tidak menyela obrolan seller
    return {
      shouldProcessLLM: false,
      botStatus: "PAUSED",
      sanitizedMessage: rawText,
      rejectionReason: "BOT_PAUSED",
    };
  }

  // ----------------------------------------------------------------------------
  // 3. PERIKSA STATUS PAUSE SAAT INI (Human Handoff Active)
  // ----------------------------------------------------------------------------
  if (currentBotStatus === "PAUSED" || currentBotStatus === "ESCALATED_TO_HUMAN") {
    if (pausedUntil && new Date(pausedUntil).getTime() > Date.now()) {
      return {
        shouldProcessLLM: false,
        botStatus: currentBotStatus,
        sanitizedMessage: rawText,
        rejectionReason: "BOT_PAUSED",
      };
    }
    // Jika masa jeda telah lewat, bot dapat aktif kembali
  }

  // ----------------------------------------------------------------------------
  // 4. RATE LIMITING PER NOMOR PENGIRIM (Maksimal 5 pesan per 60 detik)
  // ----------------------------------------------------------------------------
  const now = Date.now();
  let senderRecord = rateLimitStore.get(senderPhone);
  if (!senderRecord) {
    senderRecord = { timestamps: [] };
    rateLimitStore.set(senderPhone, senderRecord);
  }

  if (senderRecord.mutedUntil && senderRecord.mutedUntil > now) {
    return {
      shouldProcessLLM: false,
      botStatus: currentBotStatus,
      sanitizedMessage: rawText,
      rejectionReason: "RATE_LIMITED",
    };
  }

  // Filter timestamps dalam 60 detik terakhir
  senderRecord.timestamps = senderRecord.timestamps.filter((t) => now - t < 60000);
  senderRecord.timestamps.push(now);

  if (senderRecord.timestamps.length > 5) {
    senderRecord.mutedUntil = now + 120000; // Mute 2 menit
    return {
      shouldProcessLLM: false,
      botStatus: currentBotStatus,
      sanitizedMessage: rawText,
      rejectionReason: "RATE_LIMITED",
      immediateReply: "Mohon tunggu sebentar ya kak, sistem sedang memproses pesan sebelumnya 🙏",
    };
  }

  // ----------------------------------------------------------------------------
  // 5. ANTI-TOKEN BOMBING: HARD CAP 500 KARAKTER
  // ----------------------------------------------------------------------------
  const sanitizedText = rawText.slice(0, 500);

  // ----------------------------------------------------------------------------
  // 6. DETEKSI KATA KUNCI KOMPLAIN / ESKALASI OTOMATIS KE MANUSIA
  // ----------------------------------------------------------------------------
  const lowerMsg = sanitizedText.toLowerCase();
  const isSensitive = SENSITIVE_KEYWORDS.some((kw) => lowerMsg.includes(kw));

  // Atau jika buyer sudah berputar-putar lebih dari 4 kali tanya jawab
  const isTurnLimitHit = currentTurnCount >= 4;

  if (isSensitive || isTurnLimitHit) {
    return {
      shouldProcessLLM: false,
      botStatus: "ESCALATED_TO_HUMAN",
      sanitizedMessage: sanitizedText,
      shouldEscalateToHuman: true,
      immediateReply:
        "Baik Kak! Pertanyaan kakak sudah kami catat dan teruskan langsung ke Admin Penjual kami ya. Mohon ditunggu sebentar, Admin kami akan segera membalas chat ini secara langsung. Terima kasih banyak atas kesabarannya 🙏",
    };
  }

  // ----------------------------------------------------------------------------
  // 7. CIRCUIT BREAKER CHECK (Mencegah Retry Storm saat Provider Down)
  // ----------------------------------------------------------------------------
  if (isCircuitBreakerOpen()) {
    return {
      shouldProcessLLM: false,
      botStatus: currentBotStatus,
      sanitizedMessage: sanitizedText,
      rejectionReason: "CIRCUIT_BREAKER_OPEN",
      immediateReply:
        "Halo kak! Pesan kakak sudah diterima, saat ini admin kami sedang mempersiapkan pesanan dan akan membalas chat ini segera ya kak 🙏",
    };
  }

  // ----------------------------------------------------------------------------
  // 8. KUOTA HARIAN PER TOKO (Hard Budget Cap)
  // ----------------------------------------------------------------------------
  const todayKey = `${storeId}_${new Date().toISOString().slice(0, 10)}`;
  const currentUsage = dailyUsageStore.get(todayKey) || 0;
  if (currentUsage >= DEFAULT_DAILY_STORE_QUOTA) {
    return {
      shouldProcessLLM: false,
      botStatus: "PAUSED",
      sanitizedMessage: sanitizedText,
      rejectionReason: "DAILY_QUOTA_EXCEEDED",
      immediateReply:
        "Halo kak! Terima kasih sudah menghubungi toko kami. Pesan kakak telah tersimpan dan admin kami akan membalas segera ya kak 🙏",
    };
  }

  // ----------------------------------------------------------------------------
  // LOLOS SEMUA PROTEKSI: AMAN DIPROSES KE LLM
  // ----------------------------------------------------------------------------
  return {
    shouldProcessLLM: true,
    botStatus: "ACTIVE",
    sanitizedMessage: sanitizedText,
  };
}
