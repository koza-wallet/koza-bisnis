"use client";

import { ShieldCheck, QrCode } from "lucide-react";

export function PaymentMethodsBanner() {
  const methods = [
    { name: "QRIS", color: "text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold" },
    { name: "BCA Mobile", color: "text-blue-400 bg-blue-500/10 border-blue-500/30 font-bold" },
    { name: "Livin Mandiri", color: "text-amber-400 bg-amber-500/10 border-amber-500/30 font-bold" },
    { name: "BRImo", color: "text-blue-400 bg-blue-500/10 border-blue-500/30 font-bold" },
    { name: "BNI Mobile", color: "text-orange-400 bg-orange-500/10 border-orange-500/30 font-bold" },
    { name: "GoPay", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold" },
    { name: "DANA", color: "text-sky-400 bg-sky-500/10 border-sky-500/30 font-bold" },
    { name: "OVO", color: "text-purple-400 bg-purple-500/10 border-purple-500/30 font-bold" },
    { name: "ShopeePay", color: "text-orange-400 bg-orange-500/10 border-orange-500/30 font-bold" },
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 text-center space-y-5">
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>Didukung Berbagai Metode Pembayaran Nasional</span>
        </h3>
        <p className="text-xs text-slate-400">
          Transaksi kuota diproses secara aman & instan melalui jaringan QRIS Nasional & Payment Gateway Midtrans.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto">
        {methods.map((m) => (
          <span
            key={m.name}
            className={`px-3 py-1.5 rounded-xl text-xs border tracking-wide ${m.color}`}
          >
            {m.name}
          </span>
        ))}
      </div>
    </div>
  );
}
