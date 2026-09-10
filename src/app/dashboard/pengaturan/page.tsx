"use client";

import { useState } from "react";
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
  Layers
} from "lucide-react";

export default function StoreShippingSettingsPage() {
  const { store, updateStore } = useStore();
  
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-emerald-400" />
            <span>Pengaturan Ekspedisi & Kurir Toko</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pilih ekspedisi apa saja yang didukung toko Anda. Pengaturan ini otomatis berlaku ke seluruh produk di etalase dan landing page.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            1. Kurir Standar & Reguler (Paket Kecil & Eceran)
          </h2>
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

                {/* Toggle Switch UI */}
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>2. Kurir Kargo & Muatan Berat (Khusus Grosir / Partai Besar)</span>
            <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] text-indigo-300 font-semibold normal-case">
              B2B & Produsen
            </span>
          </h2>
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
                    <span className="rounded bg-indigo-950/80 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] text-indigo-300 font-semibold">
                      Kargo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {courier.description}
                  </p>
                </div>

                {/* Toggle Switch UI */}
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
  );
}
