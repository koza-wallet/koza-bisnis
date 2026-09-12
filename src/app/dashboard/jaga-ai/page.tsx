"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { 
  Bot, 
  Crown, 
  Lock, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  MessageSquare, 
  HelpCircle, 
  RefreshCw, 
  Loader2, 
  QrCode, 
  Smartphone, 
  Unlink, 
  Copy, 
  WifiOff, 
  Sliders, 
  ShoppingBag, 
  Bell, 
  Truck,
  ExternalLink,
  Sparkles,
  AlertCircle,
  X
} from "lucide-react";
import { WhatsAppBotSettings } from "@/types";

interface ChatSessionItem {
  id: string;
  buyer_phone: string;
  bot_status: "ACTIVE" | "PAUSED" | "ESCALATED_TO_HUMAN";
  turn_count: number;
  last_buyer_message?: string;
  last_bot_reply?: string;
  updated_at: string;
}

export default function JagaAIPage() {
  const { store, updateStore } = useStore();

  const isStorePro = Boolean(
    store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL"
  );

  // AI Bot / WhatsApp Gateway State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCopiedWebhook, setIsCopiedWebhook] = useState(false);
  const [qrSecondsRemaining, setQrSecondsRemaining] = useState(60);

  // Chat Sessions & Daily Quota State
  const [chatSessions, setChatSessions] = useState<ChatSessionItem[]>([]);
  const [quotaUsage, setQuotaUsage] = useState<{ usedToday: number; dailyLimit: number; percentage: number }>({
    usedToday: 0,
    dailyLimit: 150,
    percentage: 0,
  });
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [resumingPhone, setResumingPhone] = useState<string | null>(null);

  const botSettings = useMemo(() => {
    return store.whatsappBotSettings || {
      provider: 'fonnte' as const,
      status: 'DISCONNECTED' as const,
      isActive: false,
    };
  }, [store.whatsappBotSettings]);

  const handleOpenQrModal = async () => {
    setIsQrModalOpen(true);
    setQrLoading(true);
    setQrError(null);
    setQrSecondsRemaining(60);

    try {
      const res = await fetch("/api/whatsapp/device/qr");
      const data = await res.json();
      if (data.success && data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        setQrError(data.message || "Gagal membuat QR Code.");
      }
    } catch {
      setQrError("Gagal menghubungi server pembuatan QR Code.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleDisconnectWa = async () => {
    if (!confirm("Apakah Anda yakin ingin memutuskan koneksi WhatsApp toko ini?")) return;
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/whatsapp/device/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        updateStore({
          whatsappBotSettings: {
            provider: "fonnte",
            status: "DISCONNECTED",
            isActive: false,
          },
        });
      }
    } catch {
      alert("Gagal memutuskan koneksi WhatsApp.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleToggleBotActive = () => {
    const currentActive = Boolean(botSettings.isActive);
    updateStore({
      whatsappBotSettings: {
        ...botSettings,
        isActive: !currentActive,
      },
    });
  };

  const handleToggleBotFeature = (key: keyof WhatsAppBotSettings) => {
    const currentValue = botSettings[key] !== false; // default true (opt-out)
    updateStore({
      whatsappBotSettings: {
        ...botSettings,
        [key]: !currentValue,
      },
    });
  };

  const handleCopyWebhook = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.kozabisnis.com";
    const secretParam = botSettings.webhookSecret ? `&secret=${botSettings.webhookSecret}` : "";
    const webhookUrl = `${origin}/api/webhooks/whatsapp?store_id=${store.id}${secretParam}`;
    navigator.clipboard.writeText(webhookUrl);
    setIsCopiedWebhook(true);
    setTimeout(() => setIsCopiedWebhook(false), 3000);
  };

  const fetchChatSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/whatsapp/chat-sessions");
      const data = await res.json();
      if (data.success) {
        setChatSessions(data.sessions || []);
        if (data.quotaUsage) {
          setQuotaUsage(data.quotaUsage);
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil data chat_sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const handleResumeSession = async (buyerPhone: string) => {
    setResumingPhone(buyerPhone);
    try {
      const res = await fetch("/api/whatsapp/chat-sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerPhone, botStatus: "ACTIVE" }),
      });
      const data = await res.json();
      if (data.success) {
        setChatSessions((prev) =>
          prev.map((s) => (s.buyer_phone === buyerPhone ? { ...s, bot_status: "ACTIVE" } : s))
        );
      }
    } catch (err) {
      console.warn("Gagal mengaktifkan kembali bot:", err);
    } finally {
      setResumingPhone(null);
    }
  };

  useEffect(() => {
    if (!isQrModalOpen) return;

    const timer = setInterval(() => {
      setQrSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/whatsapp/device/status");
        const data = await res.json();
        if (data.success && data.connected) {
          updateStore({
            whatsappBotSettings: {
              ...botSettings,
              status: "CONNECTED",
              isActive: true,
              connectedNumber: data.connectedNumber,
            },
          });
          setIsQrModalOpen(false);
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [isQrModalOpen, botSettings, updateStore]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Bot className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Jaga AI CS WhatsApp 24/7</span>
              <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-xs">
                AI ⚡
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pusat kendali asisten bot cerdas, saklar otomasi transaksional, dan sistem pengalihan chat manual (Human Takeover).
          </p>
        </div>

        {isStorePro && (
          <div className="flex items-center gap-2">
            {botSettings.status === 'CONNECTED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Online ({botSettings.connectedNumber || store.whatsappNumber})
              </span>
            ) : (
              <button
                type="button"
                onClick={handleOpenQrModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Tautkan WhatsApp (Scan QR)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!isStorePro ? (
        /* LOCKED CARD FOR NON-PRO USERS */
        <div className="relative overflow-hidden rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Crown className="h-3 w-3" /> Fitur Eksklusif PRO Member
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                  Asisten Bot AI WhatsApp & Human Takeover
                </h2>
              </div>
            </div>

            <Link
              href="/dashboard/topup?pkg=PRO_MONTHLY"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:brightness-105 text-white font-black text-xs shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upgrade ke PRO (Rp 99rb/bln)</span>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Asisten cerdas 24/7 yang otomatis membalas chat calon pembeli di WhatsApp bisnis Anda, menjawab spesifikasi produk, mengirim notifikasi resi dan rincian order, serta langsung mengalihkan obrolan saat Anda mengetik manual dari HP.
          </p>

          {/* Benefit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-2 shadow-xs">
              <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Zap className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Balas Otomatis 24 Jam</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Pembeli tidak perlu menunggu saat Anda tidur atau sibuk packing pesanan.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-2 shadow-xs">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ambil Alih Otomatis</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Ketik balasan dari HP WhatsApp Anda, bot langsung jeda 60 menit secara alami.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-2 shadow-xs">
              <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Shield className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Anti-Bocor Biaya</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Dilengkapi Circuit Breaker dan Hard-Cap 500 karakter pencegah token bombing.
              </p>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="rounded-2xl border border-amber-300 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-700 dark:text-slate-300 text-center sm:text-left">
              Toko Anda saat ini menggunakan paket <span className="font-bold text-amber-800 dark:text-amber-300">NON-PRO</span>. Upgrade sekarang untuk mengaktifkan seluruh otomasi AI.
            </div>
            <Link
              href="/dashboard/topup?pkg=PRO_MONTHLY"
              className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 underline underline-offset-4 shrink-0"
            >
              <span>Buka Akses Fitur PRO Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* UNLOCKED SETTINGS FOR PRO USERS */
        <div className="space-y-6">
          {/* WhatsApp Live Device Connection Center */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center shadow-xs ${
                  botSettings.status === 'CONNECTED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400'
                }`}>
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> PRO Member Aktif
                    </span>
                    {botSettings.status === 'CONNECTED' ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Online ({botSettings.connectedNumber || store.whatsappNumber})
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <WifiOff className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                        Belum Terhubung
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                    Koneksi WhatsApp Toko & Asisten Bot
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {botSettings.status === 'CONNECTED' ? (
                  <button
                    type="button"
                    onClick={handleDisconnectWa}
                    disabled={isDisconnecting}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                    <span>Putuskan Sambungan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenQrModal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Tautkan WhatsApp Toko (Scan QR)</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Asisten AI yang menjaga WhatsApp toko Anda 24 jam nonstop, otomatis menjawab ketersediaan stok, harga produk, dan membagikan tautan etalase langsung ke calon pembeli.
            </p>

            {/* Master Switch Aktifkan Auto-Reply */}
            {botSettings.status === 'CONNECTED' && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Master Switch Jaga AI</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      botSettings.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {botSettings.isActive ? 'BOT AKTIF' : 'BOT NONAKTIF'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Saklar utama seluruh fungsi bot WhatsApp toko. Matikan jika ingin menjeda seluruh layanan otomatis secara instan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleBotActive}
                  className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                    botSettings.isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                  aria-label="Toggle Master Bot"
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                      botSettings.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Preferensi & Saklar Kebebasan Seller Jaga AI */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Preferensi & Saklar Otomasi Jaga AI</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-500/20">
                        Kendali Penuh Seller
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Aktifkan atau matikan modul cerdas secara individual sesuai kebutuhan operasional toko Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Saklar 1: AI CS Tanya Jawab Produk 24/7 */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-4.5 flex items-start justify-between gap-3.5 shadow-xs">
                  <div className="space-y-1.5 pr-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        AI CS Tanya Jawab 24/7
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      AI menjawab otomatis pertanyaan pembeli seputar stok, harga, dan varian katalog toko.
                    </p>
                    <div className="pt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        botSettings.enableAICustomerService !== false
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {botSettings.enableAICustomerService !== false ? 'AKTIF (24 Jam)' : 'NONAKTIF'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBotFeature('enableAICustomerService')}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      botSettings.enableAICustomerService !== false ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                    aria-label="Toggle AI CS"
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        botSettings.enableAICustomerService !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Saklar 2: Rekap Pesanan Baru ke WhatsApp Pembeli */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-4.5 flex items-start justify-between gap-3.5 shadow-xs">
                  <div className="space-y-1.5 pr-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Rekap Pesanan ke Pembeli
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Kirim rincian invoice dan tautan lacak otomatis ke WhatsApp pembeli saat selesai checkout.
                    </p>
                    <div className="pt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        botSettings.notifyBuyerOrder !== false
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {botSettings.notifyBuyerOrder !== false ? 'AKTIF (Kirim Otomatis)' : 'NONAKTIF'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBotFeature('notifyBuyerOrder')}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      botSettings.notifyBuyerOrder !== false ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                    aria-label="Toggle Buyer Order Notification"
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        botSettings.notifyBuyerOrder !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Saklar 3: Nomor Resi & Tracking Live ke WhatsApp Pembeli */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-4.5 flex items-start justify-between gap-3.5 shadow-xs">
                  <div className="space-y-1.5 pr-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Truck className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Kirim Resi & Lacak Ekspedisi
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Kirim nomor resi dan link pelacakan kurir saat pesanan Anda update ke status 'Dikirim'.
                    </p>
                    <div className="pt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        botSettings.notifyBuyerShipping !== false
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {botSettings.notifyBuyerShipping !== false ? 'AKTIF (Resi Ekspedisi)' : 'NONAKTIF'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBotFeature('notifyBuyerShipping')}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      botSettings.notifyBuyerShipping !== false ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                    aria-label="Toggle Shipping Notification"
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        botSettings.notifyBuyerShipping !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Saklar 4: Alert Pesanan Masuk ke WhatsApp Penjual */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-4.5 flex items-start justify-between gap-3.5 shadow-xs">
                  <div className="space-y-1.5 pr-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Bell className="h-4 w-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Alert Pesanan ke WhatsApp Penjual
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Notifikasi instan ke WhatsApp pemilik toko begitu ada pembeli checkout agar segera dipacking.
                    </p>
                    <div className="pt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        botSettings.notifySellerOrderAlert !== false
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {botSettings.notifySellerOrderAlert !== false ? 'AKTIF (Alert Toko)' : 'NONAKTIF'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBotFeature('notifySellerOrderAlert')}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                      botSettings.notifySellerOrderAlert !== false ? 'bg-amber-600' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                    aria-label="Toggle Seller Alert Notification"
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        botSettings.notifySellerOrderAlert !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Batas Pesan Input</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">500 Karakter</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Anti-Token Bombing aktif</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Rate Limiter Anti-Spam</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">5 Chat / Menit</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Auto-Mute spammer</div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-1">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Circuit Breaker System</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">Normal (Healthy)</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Mencegah retry error storm</div>
              </div>
            </div>

            {/* Webhook Endpoint Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Webhook Toko (Multi-Tenant Ingestion)</span>
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isCopiedWebhook ? "Tersalin!" : "Salin URL"}</span>
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-[11px] text-slate-700 dark:text-slate-400 select-all break-all">
                {typeof window !== "undefined" ? window.location.origin : "https://www.kozabisnis.com"}/api/webhooks/whatsapp?store_id={store.id}{botSettings.webhookSecret ? `&secret=${botSettings.webhookSecret}` : ""}
              </div>
              <p className="text-[10px] text-slate-500">
                URL ini otomatis dikonfigurasi saat Anda menautkan WhatsApp melalui sistem KoZa Bisnis.
              </p>
            </div>

            {/* Magic Commands Guide */}
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Panduan Perintah Cepat Penjual (Magic Commands)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3 space-y-1">
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">!pause atau !stop</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Kirim perintah ini di chat WhatsApp untuk menjeda bot selama 2 jam penuh agar Anda bebas mengobrol manual.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-3 space-y-1">
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">!start atau !resume</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Kirim perintah ini untuk langsung mengaktifkan kembali bot seketika.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                *Tip: Anda juga cukup mengetik balasan langsung dari WhatsApp HP Anda, bot akan otomatis menjeda diri selama 60 menit tanpa Anda perlu mengetik perintah.
              </p>
            </div>

            {/* Meteran Kuota Chat Harian AI */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Meteran Kuota Harian Jaga AI</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Pengendali batas anggaran chat harian per toko</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                  quotaUsage.percentage >= 90
                    ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                }`}>
                  {quotaUsage.usedToday} / {quotaUsage.dailyLimit} Chat Hari Ini ({quotaUsage.percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quotaUsage.percentage >= 90
                      ? "bg-rose-500"
                      : quotaUsage.percentage >= 70
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(2, quotaUsage.percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Reset otomatis setiap pukul 00:00 WIB</span>
                <span>Tersisa {Math.max(0, quotaUsage.dailyLimit - quotaUsage.usedToday)} chat hari ini</span>
              </div>
            </div>

            {/* Aktivitas Chat Jaga AI & Human Escalation */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Riwayat Percakapan & Status Ambil Alih</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Daftar calon pembeli yang dilayani bot dan status eskalasi seller</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchChatSessions}
                  disabled={loadingSessions}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingSessions ? "animate-spin" : ""}`} />
                  <span>Segarkan</span>
                </button>
              </div>

              {chatSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Belum ada percakapan masuk dari calon pembeli.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Begitu ada WhatsApp masuk ke nomor toko Anda, bot akan otomatis melayani dan riwayatnya muncul di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {session.buyer_phone}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({session.turn_count} pesan)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              session.bot_status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                                : session.bot_status === "PAUSED"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300"
                            }`}
                          >
                            {session.bot_status === "ACTIVE"
                              ? "🟢 Aktif Melayani"
                              : session.bot_status === "PAUSED"
                              ? "⏸️ Dijeda Seller (60 mnt)"
                              : "🚨 Eskalasi Manual"}
                          </span>
                          {session.bot_status !== "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleResumeSession(session.buyer_phone)}
                              disabled={resumingPhone === session.buyer_phone}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {resumingPhone === session.buyer_phone ? "Memproses..." : "Aktifkan Bot Lagi"}
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${session.buyer_phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                          >
                            <span>Buka Chat WA</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </div>

                      {session.last_buyer_message && (
                        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 text-xs space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold">Pesan Terakhir Pembeli:</div>
                          <p className="text-slate-700 dark:text-slate-300 italic">
                            &ldquo;{session.last_buyer_message}&rdquo;
                          </p>
                          {session.last_bot_reply && (
                            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Balasan Bot:</div>
                              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                                {session.last_bot_reply}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal Popup */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Tautkan WhatsApp Toko
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pindai kode QR menggunakan WhatsApp di ponsel Anda.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 min-h-[220px]">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium">Menghubungkan ke gateway...</span>
                </div>
              ) : qrError ? (
                <div className="flex flex-col items-center gap-2 text-center p-2">
                  <AlertCircle className="h-8 w-8 text-rose-500" />
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{qrError}</p>
                  <button
                    type="button"
                    onClick={handleOpenQrModal}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold hover:bg-slate-300 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : qrCodeUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={qrCodeUrl}
                    alt="WhatsApp QR Code"
                    className="w-48 h-48 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 bg-white p-2"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <span>Berlaku selama</span>
                    <span className="font-mono font-bold text-emerald-600">{qrSecondsRemaining} detik</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 p-3 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-700 dark:text-slate-300">Cara Menautkan:</div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Buka aplikasi <strong>WhatsApp</strong> di HP Anda</li>
                <li>Ketuk <strong>Menu (titik 3)</strong> atau <strong>Pengaturan</strong></li>
                <li>Pilih <strong>Perangkat Tertaut</strong> &gt; <strong>Tautkan Perangkat</strong></li>
                <li>Arahkan kamera ke kode QR di atas</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
