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
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Package,
  Sparkles
} from "lucide-react";

export default function EkspedisiSettingsPage() {
  const { store, updateStore } = useStore();
  
  const currentEnabled = store.enabledCouriers && store.enabledCouriers.length > 0 
    ? store.enabledCouriers 
    : ["JNT", "JNE", "SICEPAT"];

  const [selectedCouriers, setSelectedCouriers] = useState<string[]>(currentEnabled);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleCourier = (code: string) => {
    setIsSaved(false);
    if (selectedCouriers.includes(code)) {
      if (selectedCouriers.length === 1) {
        setErrorMessage("Minimal harus ada 1 ekspedisi yang aktif agar pembeli dapat checkout.");
        return;
      }
      setErrorMessage(null);
      setSelectedCouriers((prev) => prev.filter((c) => c !== code));
    } else {
      setErrorMessage(null);
      setSelectedCouriers((prev) => [...prev, code]);
    }
  };

  const handleSelectAll = () => {
    setIsSaved(false);
    setErrorMessage(null);
    setSelectedCouriers(MASTER_COURIERS.map((c) => c.code));
  };

  const handleSelectDefaults = () => {
    setIsSaved(false);
    setErrorMessage(null);
    setSelectedCouriers(["JNT", "JNE", "SICEPAT"]);
  };

  const handleSaveShipping = () => {
    if (selectedCouriers.length === 0) {
      setErrorMessage("Pilih minimal 1 ekspedisi pengiriman.");
      return;
    }

    updateStore({ enabledCouriers: selectedCouriers });
    setIsSaved(true);
    setErrorMessage(null);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <Truck className="h-5 w-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Ekspedisi & Kurir Pengiriman
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pilih kurir ekspedisi apa saja yang didukung toko Anda untuk kalkulasi ongkir dan penjemputan paket otomatis.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveShipping}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Pilihan Ekspedisi</span>
        </button>
      </div>

      {/* Alert Banners */}
      {isSaved && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <strong className="font-bold">Pengaturan Berhasil Disimpan!</strong> Pilihan ekspedisi aktif telah diperbarui secara langsung untuk semua checkout pembeli.
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 p-4 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Origin City Info Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Package className="h-4 w-4 text-emerald-600" />
          <span>Lokasi Asal Gudang Pengirim Toko</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block">Kota / Kabupaten:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {store.originCity || "Kota Bandung"}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block">Kecamatan Asal:</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {store.originDistrict || "Coblong"}
            </span>
          </div>
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-1">
            <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold block">Sistem Auto-AWB:</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" />
              Aktif Otomatis
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          *Ongkos kirim pada saat pembeli checkout otomatis dihitung dari titik kecamatan asal toko ini menuju kecamatan pembeli.
        </p>
      </div>

      {/* Master Courier Checkboxes Grid */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Daftar Pilihan Ekspedisi Partner</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                {selectedCouriers.length} Kurir Aktif
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Centang ekspedisi yang ingin Anda sediakan untuk opsi pengiriman pembeli di etalase dan landing page.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 underline underline-offset-2 px-2 py-1 cursor-pointer"
            >
              Pilih Semua
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={handleSelectDefaults}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 cursor-pointer"
            >
              Default (JNT, JNE, SiCepat)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MASTER_COURIERS.map((courier) => {
            const isChecked = selectedCouriers.includes(courier.code);
            return (
              <div
                key={courier.code}
                onClick={() => handleToggleCourier(courier.code)}
                className={`relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? "border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isChecked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {courier.name}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-slate-400 shrink-0">
                      {courier.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {courier.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer save button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">
            Pastikan klik tombol simpan setelah mengubah pilihan kurir.
          </span>
          <button
            type="button"
            onClick={handleSaveShipping}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan Ekspedisi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
