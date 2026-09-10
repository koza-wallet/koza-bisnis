"use client";

import { useState } from "react";
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
  HelpCircle
} from "lucide-react";

export default function StoreSettingsPage() {
  const { store, updateStore } = useStore();
  const [activeTab, setActiveTab] = useState<"shipping" | "ai_bot">("shipping");

  const isStorePro = Boolean(
    (store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL") &&
    (!store.planExpiryDate || new Date(store.planExpiryDate).getTime() > Date.now())
  );
  
  const currentEnabled = store.enabledCouriers && store.enabledCouriers.length > 0 
    ? store.enabledCouriers 
    : ["JNT", "JNE", "SICEPAT"];

  const [selectedCouriers, setSelectedCouriers] = useState<string[]>(currentEnabled);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const regulerCouriers = MASTER_COURIERS.filter((c) => c.category === "REGULER");
  const kargoCouriers = MASTER_COURIERS.filter((c) => c.category === "KARGO");

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span>Pengaturan Toko & Otomasi</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Kelola opsi pengiriman ekspedisi dan pengaturan asisten bot WhatsApp untuk toko Anda.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("shipping")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "shipping"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <Truck className="h-4 w-4 text-emerald-400" />
          <span>Ekspedisi & Kurir</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_bot")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "ai_bot"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <Bot className="h-4 w-4 text-indigo-400" />
          <span>Asisten AI WhatsApp & Human Takeover</span>
          {!isStorePro && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black">
              <Lock className="h-2.5 w-2.5" /> PRO
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: EKSPEDISI & KURIR */}
      {activeTab === "shipping" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-400" />
                <span>Pilihan Kurir & Ekspedisi Toko</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih ekspedisi apa saja yang didukung toko Anda. Pengaturan ini otomatis berlaku ke seluruh produk di etalase dan landing page.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95 shrink-0"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          {/* Alert Messages */}
          {isSaved && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 animate-in fade-in duration-300">
              <Check className="h-5 w-5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <strong className="font-bold">Pengaturan Berhasil Disimpan!</strong> Pilihan ekspedisi aktif telah diperbarui secara langsung untuk semua checkout pembeli.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-xs sm:text-sm">{errorMessage}</div>
            </div>
          )}

          {/* Info Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Fleksibilitas Operasional Toko & Produsen</p>
              <p className="text-slate-400">
                Hanya aktifkan ekspedisi yang memiliki agen/gerai terdekat dari lokasi gudang Anda. Jika Anda adalah produsen atau distributor muatan besar, Anda bisa menonaktifkan kurir reguler dan hanya menyalakan <strong>Kurir Kargo</strong>.
              </p>
            </div>
          </div>

          {/* Section 1: Kurir Reguler */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
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
                        ? "border-emerald-500/50 bg-slate-900/90 shadow-md shadow-emerald-500/5"
                        : "border-slate-800 bg-slate-950/50 opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{courier.name}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
                          {courier.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {courier.description}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 mt-0.5 ${
                        isEnabled ? "bg-emerald-500" : "bg-slate-800"
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
              <Layers className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
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
                        ? "border-indigo-500/50 bg-slate-900/90 shadow-md shadow-indigo-500/5"
                        : "border-slate-800 bg-slate-950/50 opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{courier.name}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-indigo-300 font-medium border border-indigo-500/20">
                          {courier.service}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {courier.description}
                      </p>
                    </div>

                    <div
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 mt-0.5 ${
                        isEnabled ? "bg-indigo-500" : "bg-slate-800"
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
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
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
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Fitur Eksklusif PRO Member
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      Asisten Bot AI WhatsApp & Human Takeover
                    </h2>
                  </div>
                </div>

                <Link
                  href="/dashboard/topup?pkg=PRO_MONTHLY"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Upgrade ke PRO (Rp 99rb/bln)</span>
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Asisten cerdas 24/7 yang otomatis membalas chat calon pembeli di WhatsApp bisnis Anda, menjawab spesifikasi produk, dan langsung mengalihkan obrolan saat Anda mengetik manual dari HP.
              </p>

              {/* Benefit Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Balas Otomatis 24 Jam</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Pembeli tidak perlu menunggu saat Anda tidur atau sibuk packing pesanan.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Ambil Alih Otomatis</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ketik balasan dari HP WhatsApp Anda, bot langsung jeda 60 menit secara alami.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
                  <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">Anti-Bocor Biaya</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dilengkapi Circuit Breaker dan Hard-Cap 500 karakter pencegah token bombing.
                  </p>
                </div>
              </div>

              {/* Bottom CTA Banner */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300 text-center sm:text-left">
                  Toko Anda saat ini menggunakan paket <span className="font-bold text-amber-300">NON-PRO</span>. Upgrade sekarang untuk mengaktifkan seluruh otomasi AI.
                </div>
                <Link
                  href="/dashboard/topup?pkg=PRO_MONTHLY"
                  className="flex items-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 underline underline-offset-4 shrink-0"
                >
                  <span>Buka Akses Fitur PRO Sekarang</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* UNLOCKED SETTINGS FOR PRO USERS */
            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> PRO Member Aktif
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                        Status Asisten AI & Cost Guard: AKTIF
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>5 Titik Guardrail Aktif</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Asisten AI WhatsApp terhubung dan siap membalas pertanyaan pembeli seputar katalog produk dan status pengiriman.
                </p>

                {/* Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">Batas Pesan Input</div>
                    <div className="text-lg font-black text-white">500 Karakter</div>
                    <div className="text-[10px] text-emerald-400">Anti-Token Bombing aktif</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">Rate Limiter Anti-Spam</div>
                    <div className="text-lg font-black text-white">5 Chat / Menit</div>
                    <div className="text-[10px] text-emerald-400">Auto-Mute spammer</div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">Circuit Breaker System</div>
                    <div className="text-lg font-black text-white">Normal (Healthy)</div>
                    <div className="text-[10px] text-emerald-400">Mencegah retry error storm</div>
                  </div>
                </div>

                {/* Magic Commands Guide */}
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                    <HelpCircle className="h-4 w-4 text-indigo-400" />
                    <span>Panduan Perintah Cepat Penjual (Magic Commands)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                      <div className="font-mono text-emerald-400 font-bold">!pause atau !stop</div>
                      <p className="text-slate-300 text-[11px]">
                        Kirim perintah ini di chat untuk menjeda bot selama 2 jam penuh agar Anda bebas mengobrol.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
                      <div className="font-mono text-emerald-400 font-bold">!start atau !resume</div>
                      <p className="text-slate-300 text-[11px]">
                        Kirim perintah ini untuk langsung mengaktifkan kembali bot seketika.
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    *Tip: Anda juga cukup mengetik balasan langsung dari WhatsApp HP Anda, bot akan otomatis menjeda diri selama 60 menit tanpa Anda perlu mengetik perintah.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
