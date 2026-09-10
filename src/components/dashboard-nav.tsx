"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { createClient } from "@/lib/supabase/client";
import { 
  Home, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  ExternalLink,
  Store as StoreIcon,
  Sparkles,
  Zap,
  LogOut,
  Truck
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { store, orders } = useStore();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES"
  ).length;

  // Core operational & growth menus
  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/dashboard/produk", label: "Produk", icon: Package },
    { 
      href: "/dashboard/landing-pages", 
      label: "Halaman Jualan (AI)", 
      mobileLabel: "Jualan AI",
      icon: Sparkles, 
      isAI: true 
    },
    { 
      href: "/dashboard/pesanan", 
      label: "Pesanan", 
      mobileLabel: "Pesanan",
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    { 
      href: "/dashboard/keuangan", 
      label: "Laba Bersih", 
      mobileLabel: "Laba Bersih",
      icon: TrendingUp 
    },
    { 
      href: "/dashboard/pengaturan", 
      label: "Ekspedisi", 
      mobileLabel: "Ekspedisi",
      icon: Truck 
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors text-sm sm:text-base">
                  KoZa
                </span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                  BISNIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-[130px] sm:max-w-xs truncate">
                {store.name}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation (5 focused menus) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${item.isAI ? "text-amber-400" : ""}`} />
                <span>{item.label}</span>
                {item.isAI && (
                  <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.2 text-[8px] font-black text-slate-950 shadow-sm">
                    AI ⚡
                  </span>
                )}
                {item.badge !== undefined && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Interactive Quota Badge & View Store */}
        <div className="flex items-center gap-2">
          {/* Quota Badge (Clickable to topup page) */}
          <Link
            href="/dashboard/topup"
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all border ${
              store.quotaBalance <= 5
                ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
            }`}
            title="Klik untuk tambah kuota order"
          >
            <Zap className="h-3 w-3 text-amber-400" />
            <span>{store.quotaBalance} Kuota Order</span>
          </Link>

          {/* Primary Action Button: Lihat Toko Saya */}
          <Link
            href={`/toko/${store.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <StoreIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lihat Toko Saya</span>
            <span className="sm:hidden">Toko</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          {/* Logout Button */}
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/login");
              router.refresh();
            }}
            title="Keluar dari Dashboard"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (6 Ergonomic Tabs, Zero Truncation) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl md:hidden safe-bottom">
        <div className="grid grid-cols-6 py-1.5 px-1 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            if (item.isAI) {
              // Highlighted center button for AI
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center -mt-3 group"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-90 ${
                    isActive 
                      ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 ring-2 ring-amber-400/50 shadow-amber-500/30" 
                      : "bg-slate-800 border border-amber-500/40 text-amber-400 shadow-slate-950/50"
                  }`}>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className={`mt-1 text-[10px] font-bold tracking-tight ${
                    isActive ? "text-amber-400" : "text-slate-300"
                  }`}>
                    {item.mobileLabel || item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-colors relative ${
                  isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {item.badge !== undefined && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1">{item.mobileLabel || item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
