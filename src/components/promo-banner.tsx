"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";

export function PromoBanner() {
  const [copied, setCopied] = useState(false);
  const couponCode = "KOZACUAN";

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs sm:text-sm font-medium">
        <span className="rounded-full bg-yellow-400 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 shadow-sm uppercase tracking-wider">
          PROMO TERBATAS
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span>Dapatkan diskon 25% untuk semua paket kuota! Pakai kupon:</span>
          <button
            onClick={handleCopy}
            className="group inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg font-mono font-black text-white transition-all active:scale-95 border border-white/30"
            title="Klik untuk salin kupon"
          >
            <span>{couponCode}</span>
            {copied ? (
              <Check className="h-3 w-3 text-emerald-200" />
            ) : (
              <Copy className="h-3 w-3 opacity-70 group-hover:opacity-100" />
            )}
            <span className="text-[10px] font-normal text-emerald-100">
              {copied ? "(Tersalin!)" : "(Salin)"}
            </span>
          </button>
          <span>saat checkout QRIS.</span>
        </div>
      </div>
    </div>
  );
}
