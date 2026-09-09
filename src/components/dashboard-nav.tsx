"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wallet, 
  Zap, 
  ExternalLink,
  Store as StoreIcon,
  ChevronRight
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const { store, orders } = useStore();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES"
  ).length;

  const navItems = [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/produk", label: "Produk", icon: Package },
    { 
      href: "/dashboard/pesanan", 
      label: "Pesanan", 
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    { href: "/dashboard/keuangan", label: "Buku Kas", icon: Wallet },
    { 
      href: "/dashboard/topup", 
      label: "Beli Kuota", 
      icon: Zap,
      quotaBadge: store.quotaBalance 
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold shadow-lg shadow-emerald-500/20">
              K
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  KoZa
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  BISNIS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {store.name}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-slate-950">
                    {item.badge}
                  </span>
                )}
                {item.quotaBadge !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    store.quotaBalance <= 5 
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse" 
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {store.quotaBalance} Order
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button: Preview Storefront */}
        <div className="flex items-center gap-2">
          <Link
            href={`/toko/${store.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all active:scale-95"
          >
            <StoreIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Buka Toko Publik</span>
            <span className="sm:hidden">Toko</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg md:hidden">
        <div className="grid grid-cols-5 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 text-[10px] font-medium transition-colors relative ${
                  isActive ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge !== undefined && (
                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                      {item.badge}
                    </span>
                  )}
                  {item.quotaBadge !== undefined && (
                    <span className="absolute -right-2 -top-1 flex h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </div>
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
