"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { MASTER_COURIERS } from "@/lib/mock-data";
import { 
  Truck, 
  Check, 
  AlertCircle, 
  Save, 
  ShieldCheck, 
  Sparkles,
  Package,
  Layers,
  Bot,
  Crown,
  Lock,
  Zap,
  CheckCircle2,
  ArrowRight,
  Shield,
  MessageSquare,
  HelpCircle,
  Globe,
  ExternalLink,
  RefreshCw,
  Loader2,
  QrCode,
  Smartphone,
  Unlink,
  Copy,
  WifiOff,
  X
} from "lucide-react";

export default function StoreSettingsPage() {
  const { store, updateStore } = useStore();
  const [activeTab, setActiveTab] = useState<"shipping" | "ai_bot" | "domain">("shipping");
  const [customDomainInput, setCustomDomainInput] = useState(store.customDomain || "");
  const [isDomainSaved, setIsDomainSaved] = useState(false);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsStatus, setDnsStatus] = useState<{
    configured: boolean;
    message: string;
    targetCname?: string;
    targetA?: string;
    checkedAt?: string;
  } | null>(null);

  const isStorePro = Boolean(
    store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL"
  );
  
  const currentEnabled = store.enabledCouriers && store.enabledCouriers.length > 0 
    ? store.enabledCouriers 
    : ["JNT", "JNE", "SICEPAT"];

  const [selectedCouriers, setSelectedCouriers] = useState<string[]>(currentEnabled);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // AI Bot / WhatsApp Gateway State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isCopiedWebhook, setIsCopiedWebhook] = useState(false);
  const [qrSecondsRemaining, setQrSecondsRemaining] = useState(60);

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

  const handleCopyWebhook = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.kozabisnis.com";
    const secretParam = botSettings.webhookSecret ? `&secret=${botSettings.webhookSecret}` : "";
    const webhookUrl = `${origin}/api/webhooks/whatsapp?store_id=${store.id}${secretParam}`;
    navigator.clipboard.writeText(webhookUrl);
    setIsCopiedWebhook(true);
    setTimeout(() => setIsCopiedWebhook(false), 3000);
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

  const toggleCourier = (code: string) => {
    setIsSaved(false);
    setErrorMessage(null);

    if (selectedCouriers.includes(code)) {
      if (selectedCouriers.length === 1) {
        setErrorMessage("Minimal 1 kurir/ekspedisi harus aktif agar pembeli tetap bisa menyelesaikan pesanan.");
        return;
      }
      setSelectedCouriers(selectedCouriers.filter((c) => c !== code));
    } else {
      setSelectedCouriers([...selectedCouriers, code]);
    }
  };

  const handleSave = () => {
    if (selectedCouriers.length === 0) {
      setErrorMessage("Minimal 1 ekspedisi harus aktif.");
      return;
    }

    updateStore({ enabledCouriers: selectedCouriers });
    setIsSaved(true);
    setErrorMessage(null);
    setTimeout(() => setIsSaved(false), 4000);
  };

  const handleVerifyDomain = async (domainToTest?: string) => {
    const domain = (domainToTest || customDomainInput || store.customDomain || "").trim().toLowerCase();
    if (!domain) return;
    setIsCheckingDns(true);
    setDnsStatus(null);
    try {
      const res = await fetch(`/api/domain/verify?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      setDnsStatus(data);
    } catch {
      setDnsStatus({
        configured: false,
        message: "Gagal terhubung ke layanan verifikasi DNS. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsCheckingDns(false);
    }
  };

  const handleSaveDomain = () => {
    const cleaned = customDomainInput.trim().toLowerCase();
    updateStore({ customDomain: cleaned });
    setIsDomainSaved(true);
    setTimeout(() => setIsDomainSaved(false), 4000);
    if (cleaned) {
      handleVerifyDomain(cleaned);
    }
  };

  const regulerCouriers = MASTER_COURIERS.filter((c) => c.category === "REGULER");
  const kargoCouriers = MASTER_COURIERS.filter((c) => c.category === "KARGO");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <span>Pengaturan Toko & Otomasi</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Kelola opsi pengiriman ekspedisi dan pengaturan asisten bot WhatsApp untuk toko Anda.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("shipping")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "shipping"
              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
          }`}
        >
          <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Ekspedisi & Kurir</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_bot")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === "ai_bot"
              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
          }`}
        >
          <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Asisten AI WhatsApp & Human Takeover</span>
          {!isStorePro && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 text-[10px] font-black">
              <Lock className="h-2.5 w-2.5" /> PRO
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("domain")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === "domain"
              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/50"
          }`}
        >
          <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Custom Domain & Branding</span>
          {!isStorePro && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 text-[10px] font-black">
              <Lock className="h-2.5 w-2.5" /> PRO AI
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: EKSPEDISI & KURIR */}
      {activeTab === "shipping" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Pilihan Kurir & Ekspedisi Toko</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Pilih ekspedisi apa saja yang didukung toko Anda. Pengaturan ini otomatis berlaku ke seluruh produk di etalase dan landing page.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          {/* Alert Messages */}
          {isSaved && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-300">
              <Check className="h-5 w-5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold">Pengaturan Berhasil Disimpan!</strong> Pilihan ekspedisi aktif telah diperbarui secara langsung untuk semua checkout pembeli.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4 text-rose-800 dark:text-rose-300 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-xs sm:text-sm">{errorMessage}</div>
            </div>
          )}

          {/* Info Banner */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Fleksibilitas Operasional Toko & Produsen</p>
              <p className="text-slate-600 dark:text-slate-400">
                Hanya aktifkan ekspedisi yang memiliki agen/gerai terdekat dari lokasi gudang Anda. Jika Anda adalah produsen atau distributor muatan besar, Anda bisa menonaktifkan kurir reguler dan hanya menyalakan <strong>Kurir Kargo</strong>.
              </p>
            </div>
          </div>

          {/* Section 1: Kurir Reguler */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Kurir Standar & Reguler (Paket Kecil & Eceran)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {regulerCouriers.map((courier) => {
                const isEnabled = selectedCouriers.includes(courier.code);
                return (
                  <div
                    key={courier.code}
                    onClick={() => toggleCourier(courier.code)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start justify-between gap-3 select-none ${
                      isEnabled
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-slate-900/90 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{courier.name}</span>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                          {courier.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {courier.description}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 mt-0.5 ${
                        isEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Kurir Kargo */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Kurir Kargo & Grosir B2B (Muatan Berat & Dus Besar)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {kargoCouriers.map((courier) => {
                const isEnabled = selectedCouriers.includes(courier.code);
                return (
                  <div
                    key={courier.code}
                    onClick={() => toggleCourier(courier.code)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start justify-between gap-3 select-none ${
                      isEnabled
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-slate-900/90 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{courier.name}</span>
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-500/20">
                          {courier.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {courier.description}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 mt-0.5 ${
                        isEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button Bottom */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Ekspedisi</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ASISTEN AI WHATSAPP & HUMAN TAKEOVER (PRO LOCK) */}
      {activeTab === "ai_bot" && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
                Asisten cerdas 24/7 yang otomatis membalas chat calon pembeli di WhatsApp bisnis Anda, menjawab spesifikasi produk, dan langsung mengalihkan obrolan saat Anda mengetik manual dari HP.
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
                        Jaga AI CS WhatsApp 24/7 (Multi-Tenant)
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {botSettings.status === 'CONNECTED' ? (
                      <button
                        onClick={handleDisconnectWa}
                        disabled={isDisconnecting}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                      >
                        {isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                        <span>Putuskan Sambungan</span>
                      </button>
                    ) : (
                      <button
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

                {/* Switch Aktifkan Auto-Reply */}
                {botSettings.status === 'CONNECTED' && (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Balas Otomatis Jaga AI</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          botSettings.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {botSettings.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Saat aktif, bot akan langsung merespons pertanyaan pembeli menggunakan katalog produk toko Anda.
                      </p>
                    </div>

                    <button
                      onClick={handleToggleBotActive}
                      className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                        botSettings.isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                          botSettings.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

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
                        Kirim perintah ini di chat untuk menjeda bot selama 2 jam penuh agar Anda bebas mengobrol.
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
              </div>

              {/* MODAL SCAN QR CODE */}
              {isQrModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-5 shadow-2xl">
                    <button
                      onClick={() => setIsQrModalOpen(false)}
                      className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <div className="space-y-1 text-center sm:text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <Smartphone className="h-3 w-3" />
                        <span>Tautkan Perangkat WhatsApp</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan QR Code dengan WhatsApp HP</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Buka WhatsApp di HP Anda, masuk ke <strong>Perangkat Tertaut</strong>, lalu arahkan kamera ke QR di bawah ini.
                      </p>
                    </div>

                    {/* Frame QR Code */}
                    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-200 shadow-inner min-h-[260px]">
                      {qrLoading ? (
                        <div className="flex flex-col items-center gap-3 text-slate-800">
                          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                          <span className="text-xs font-bold">Menyiapkan sesi QR Code...</span>
                        </div>
                      ) : qrError ? (
                        <div className="text-center space-y-3">
                          <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
                          <p className="text-xs text-rose-600 font-medium max-w-xs">{qrError}</p>
                          <button
                            onClick={handleOpenQrModal}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                          >
                            Coba Lagi
                          </button>
                        </div>
                      ) : qrCodeUrl ? (
                        <div className="space-y-3 flex flex-col items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qrCodeUrl}
                            alt="WhatsApp Connect QR Code"
                            className="w-52 h-52 object-contain"
                          />
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Menunggu scan... ({qrSecondsRemaining}d)</span>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Panduan 3 Langkah */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">1.</span>
                        <span>Buka WhatsApp di HP toko Anda</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">2.</span>
                        <span>Ketuk Menu (titik 3 di Android) atau Pengaturan (iOS) &gt; Perangkat Tertaut</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">3.</span>
                        <span>Ketuk <strong>Tautkan Perangkat</strong> dan scan QR di atas</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={handleOpenQrModal}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Segarkan QR Code</span>
                      </button>
                      <button
                        onClick={() => setIsQrModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOM DOMAIN & WHITE-LABEL */}
      {activeTab === "domain" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {!isStorePro ? (
            <div className="rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 space-y-4 text-center sm:text-left shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-amber-100 dark:bg-amber-500/20 p-3 text-amber-600 dark:text-amber-400 shrink-0">
                    <Crown className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                      <span>Eksklusif Member Pro AI</span>
                      <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-0.5 border border-amber-300 dark:border-amber-500/30 font-semibold">
                        White-Label
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                      Gunakan alamat domain sendiri (misal: <strong>namatoko.com</strong>) dan hilangkan seluruh watermark KoZa dari etalase toko Anda.
                    </p>
                  </div>
                </div>

                <Link
                  href="/dashboard/topup?pkg=PRO_AI"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition-all shadow-xs whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Upgrade ke Pro AI (Rp 329rb)</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-7 space-y-6 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Hubungkan Domain Pribadi Toko Anda</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arahkan domain atau subdomain Anda ke server KoZa untuk memperkuat kredibilitas merek toko Anda.
                </p>
              </div>

              {isDomainSaved && (
                <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-300">
                  <Check className="h-5 w-5 shrink-0" />
                  <div className="text-xs sm:text-sm font-semibold">
                    Domain berhasil disimpan! Sistem sedang memproses konfigurasi SSL & DNS.
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Nama Domain Toko:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="misal: belanja.tokoberkah.com atau tokoku.com"
                    className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSaveDomain}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-bold text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      <span>Simpan</span>
                    </button>
                    <button
                      onClick={() => handleVerifyDomain()}
                      disabled={isCheckingDns || !customDomainInput.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                    >
                      {isCheckingDns ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                          <span>Mengecek...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Cek DNS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Hasil Pengecekan DNS */}
              {dnsStatus && (
                <div
                  className={`rounded-2xl border p-4 sm:p-5 space-y-3 animate-in fade-in duration-300 ${
                    dnsStatus.configured
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-500/40 dark:text-emerald-200"
                      : "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/40 dark:text-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {dnsStatus.configured ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="text-emerald-800 dark:text-emerald-300">Domain Terhubung & Aktif!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-amber-800 dark:text-amber-300">DNS Belum Terdeteksi / Masih Propagasi</span>
                        </>
                      )}
                    </div>
                    {dnsStatus.configured && (
                      <a
                        href={`https://${customDomainInput.trim().toLowerCase()}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs shrink-0 cursor-pointer"
                      >
                        <span>Buka Toko</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {dnsStatus.message}
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Panduan Pengaturan DNS (Domain Name Server):</span>
                </div>
                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                  <p>1. Buka dashboard registrar domain Anda (Niagahoster, Domainesia, Cloudflare, Namecheap, dll).</p>
                  <p>2. Tambahkan DNS Record baru dengan tipe <strong>CNAME</strong>:</p>
                  <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 font-mono text-emerald-700 dark:text-emerald-300 space-y-1">
                    <div>Type: <strong>CNAME</strong></div>
                    <div>Host / Name: <strong>@ (atau subdomain Anda)</strong></div>
                    <div>Target / Value: <strong>cname.kozabisnis.com</strong></div>
                    <div>TTL: <strong>Auto / 3600</strong></div>
                  </div>
                  <p>3. Setelah DNS tersimpan, propagasi domain biasanya memakan waktu antara 15 menit hingga 24 jam.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
