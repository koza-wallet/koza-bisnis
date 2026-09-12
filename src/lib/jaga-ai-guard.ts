// ==============================================================================
// KOZA BISNIS — JAGA AI PROMPT-INJECTION GUARD (Lapis 2 & Lapis 3)
// Pertahanan murah (regex, tanpa panggilan LLM tambahan) di dua titik:
// 1. Sebelum pesan pembeli sampai ke LLM (cegat upaya override instruksi/keluar topik)
// 2. Sebelum balasan LLM dikirim ke pembeli (cegat kebocoran kalau Lapis 1 kebobolan)
// ==============================================================================

const INJECTION_INPUT_PATTERNS: RegExp[] = [
  /abaikan (semua )?instruksi/i,
  /lupakan (semua )?(instruksi|perintah|aturan)/i,
  /ignore (all |your |previous )?instructions/i,
  /forget (all |your |previous )?instructions/i,
  /kamu (sekarang )?(adalah|jadi|menjadi) (ai|asisten|chatbot)? ?(umum|baru|lain)/i,
  /you are now (a|an)/i,
  /act as (a|an)/i,
  /berperan(lah)? sebagai/i,
  /berpura-?pura(lah)? (jadi|menjadi)/i,
  /pretend (you are|to be)/i,
  /system prompt/i,
  /prompt sistem/i,
  /instruksi (asli|sistem|internal)mu/i,
  /developer mode/i,
  /mode (pengembang|developer)/i,
  /jailbreak/i,
  /keluar dari (peran|karaktermu)/i,
  /(tulis|tuliskan|buat|buatkan|bikin|bikinkan)\s+(kode|program|script)\s+(program|pemrograman|python|javascript|java|html|css|sql)/i,
  /\bprogram(kan)?\s+(python|javascript|java|html|css|sql)\b/i,
  /\b(python|javascript|coding|pemrograman)\b.*\b(buatkan|tulis|bikin|bantu)\b/i,
  /\b(buatkan|tulis|bikin|bantu)\b.*\b(python|javascript|coding|pemrograman)\b/i,
];

export const INJECTION_REFUSAL_REPLY =
  "Maaf kak, saya di sini cuma bisa bantu soal produk & pemesanan di toko ini ya 😊 Ada yang mau ditanyakan soal produk kami?";

/**
 * Lapis 2: deteksi cepat upaya prompt-injection pada pesan pembeli SEBELUM
 * dikirim ke LLM. Kalau kena, hemat 1 panggilan LLM sekaligus mencegah payload
 * jahat pernah sampai ke model.
 */
export function detectPromptInjectionAttempt(message: string): boolean {
  if (!message) return false;
  return INJECTION_INPUT_PATTERNS.some((pattern) => pattern.test(message));
}

const UNSAFE_OUTPUT_PATTERNS: RegExp[] = [
  /```/, // code fence
  /\b(def |function\s*\(|<html|import\s+\w+|console\.log|SELECT\s+\*\s+FROM)\b/i,
  /system prompt|instruksi sistem saya/i,
  /sebagai (ai|asisten) bahasa|language model/i,
];

/**
 * Lapis 3: cegat balasan LLM yang lolos ke luar topik CS (mis. berisi kode,
 * membocorkan system prompt) sebelum dikirim ke WhatsApp pembeli.
 */
export function looksLikeUnsafeOutput(reply: string): boolean {
  if (!reply) return false;
  return UNSAFE_OUTPUT_PATTERNS.some((pattern) => pattern.test(reply));
}
