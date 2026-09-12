"use client";

import { Suspense } from "react";
import { DashboardSidebar, DashboardTopbar, DashboardMobileNav } from "@/components/dashboard-nav";
import { useStore } from "@/lib/store-context";
import Link from "next/link";
import { AlertCircle, Zap } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { store } = useStore();
  const pathname = usePathname();
  const isBuilder = pathname?.includes("/builder");

  return (
    <div
      className={`bg-slate-50 dark:bg-[#080B11] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 ${
        isBuilder ? "h-screen overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Desktop Fixed Sidebar Navigation (256px) */}
      <Suspense fallback={null}>
        <DashboardSidebar />
      </Suspense>

      {/* Main Viewport Container */}
      <div className={`flex-1 flex flex-col min-w-0 ${isBuilder ? "h-screen overflow-hidden" : ""}`}>
        {/* Top Command Header Bar */}
        <DashboardTopbar />

        {/* Quota Warning Alert Banner (Adaptive Soft Alert) */}
        {!isBuilder && store.quotaBalance <= 5 && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/50 px-4 py-2.5 transition-colors">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  {store.quotaBalance === 0 ? (
                    <strong>PERHATIAN: Kuota order toko Anda telah habis (0). Toko tidak dapat menerima pesanan baru!</strong>
                  ) : (
                    <span>
                      Sisa kuota order toko Anda tinggal <strong>{store.quotaBalance} transaksi</strong>. Segera isi ulang agar pesanan pembeli lancar.
                    </span>
                  )}
                </span>
              </div>
              <Link
                href="/dashboard/topup"
                className="flex items-center gap-1 shrink-0 rounded-lg bg-amber-500 px-3 py-1 font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs text-xs"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Isi Ulang QRIS</span>
              </Link>
            </div>
          </div>
        )}

        {/* Viewport Content */}
        <main
          className={
            isBuilder
              ? "flex-1 w-full h-full p-0 m-0 max-w-none overflow-hidden flex flex-col"
              : "flex-1 px-4 py-6 sm:px-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12"
          }
        >
          {children}
        </main>
      </div>

      {/* Mobile Floating Bottom Dock (6 Tabs) */}
      {!isBuilder && (
        <Suspense fallback={null}>
          <DashboardMobileNav />
        </Suspense>
      )}
    </div>
  );
}
