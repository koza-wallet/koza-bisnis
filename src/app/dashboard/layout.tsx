"use client";

import { DashboardNav } from "@/components/dashboard-nav";
import { useStore } from "@/lib/store-context";
import Link from "next/link";
import { AlertCircle, Zap } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { store } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <DashboardNav />

      {/* Quota Warning Alert Banner */}
      {store.quotaBalance <= 5 && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border-b border-amber-500/30 px-4 py-2.5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {store.quotaBalance === 0 ? (
                  <strong>PERHATIAN: Kuota order Anda telah habis (0). Toko tidak dapat menerima pesanan baru!</strong>
                ) : (
                  <span>
                    Sisa kuota order toko Anda tinggal <strong>{store.quotaBalance} transaksi</strong>. Segera isi ulang agar toko tetap aktif.
                  </span>
                )}
              </span>
            </div>
            <Link
              href="/dashboard/topup"
              className="flex items-center gap-1 shrink-0 rounded-md bg-amber-500 px-3 py-1 font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Isi Ulang via QRIS</span>
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-6 max-w-7xl mx-auto w-full pb-24 md:pb-12">
        {children}
      </main>
    </div>
  );
}
