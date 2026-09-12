"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { usePrivacy } from "@/lib/privacy-context";
import { useSidebar } from "@/lib/sidebar-context";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
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
  Truck,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
  Globe
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAI?: boolean;
  badge?: string | number;
  badgeColor?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");
  const { store, orders } = useStore();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES"
  ).length;

  const menuGroups: MenuGroup[] = [
    {
      title: "Operasional Bisnis",
      items: [
        { href: "/dashboard", label: "Ringkasan Bisnis", icon: Home },
        { href: "/dashboard/produk", label: "Kelola Produk", icon: Package },
        { 
          href: "/dashboard/pesanan", 
          label: "Kelola Pesanan", 
          icon: ShoppingBag, 
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: "bg-amber-500 text-slate-950"
        },
      ]
    },
    {
      title: "Konversi & Pertumbuhan",
      items: [
        { 
          href: "/dashboard/landing-pages", 
          label: "Halaman Jualan (AI)", 
          icon: Sparkles, 
          isAI: true 
        },
        { 
          href: "/dashboard/jaga-ai", 
          label: "Jaga AI (CS WhatsApp)", 
          icon: Bot, 
          isAI: true,
          badge: "24/7",
          badgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        },
        { 
          href: "/dashboard/custom-domain", 
          label: "Custom Domain", 
          icon: Globe, 
          badge: "PRO",
          badgeColor: "bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-400/30 font-bold"
        },
      ]
    },
    {
      title: "Keuangan & Ekspedisi",
      items: [
        { href: "/dashboard/keuangan", label: "Laba Bersih Toko", icon: TrendingUp },
        { href: "/dashboard/ekspedisi", label: "Ekspedisi & Kurir", icon: Truck },
      ]
    },
    {
      title: "Langganan & Kuota",
      items: [
        { 
          href: "/dashboard/topup", 
          label: "Isi Kuota Transaksi", 
          icon: Zap,
          badge: `${store.quotaBalance} Sisa`,
          badgeColor: store.quotaBalance <= 5 ? "bg-rose-500 text-white" : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
        },
      ]
    }
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] z-40 transition-all duration-300 ease-in-out ${
        isCollapsed
          ? "w-0 -translate-x-full overflow-hidden border-none opacity-0 pointer-events-none"
          : "w-64 translate-x-0 opacity-100"
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white font-black text-base shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            K
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-white text-base">
                KoZa
              </span>
              <span className="rounded bg-emerald-500/10 dark:bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                BISNIS
              </span>
            </div>
            <p className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase truncate">
              Command Center
            </p>
          </div>
        </Link>

        {/* Close Sidebar Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Tutup Menu Sidebar"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {group.title}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const itemPath = item.href.split("?")[0];
              const itemTab = item.href.includes("?tab=") ? new URLSearchParams(item.href.split("?")[1]).get("tab") : null;

              let isActive = false;
              if (itemTab) {
                isActive = pathname === itemPath && currentTab === itemTab;
              } else if (item.href === "/dashboard") {
                isActive = pathname === "/dashboard";
              } else if (pathname === itemPath) {
                isActive = !currentTab || currentTab === "shipping";
              } else {
                isActive = itemPath !== "/dashboard" && pathname.startsWith(itemPath);
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : item.isAI ? "text-amber-500 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.isAI && (
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.2 text-[8px] font-black text-slate-950 shadow-xs">
                        AI ⚡
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer: Active Store Profile & Link */}
      <div className="p-3 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-black/20">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#151E2E] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600/15 text-teal-700 dark:text-teal-400 border border-teal-500/20 font-bold text-xs uppercase">
            {store.name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {store.name}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" title="Toko Online" />
            </div>
            <p className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400 truncate">
              koza.id/{store.slug}
            </p>
          </div>
          <Link
            href={`/toko/${store.slug}`}
            target="_blank"
            title="Lihat Halaman Toko"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function DashboardTopbar() {
  const router = useRouter();
  const { store } = useStore();
  const { isPrivacyActive, togglePrivacy } = usePrivacy();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#0E1420]/90 backdrop-blur-md transition-colors">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 gap-3">
        {/* Mobile Brand / Desktop Command Search Bar */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Brand mark for Mobile (< lg) */}
          <Link href="/dashboard" className="flex lg:hidden items-center gap-2 group shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white font-black text-sm shadow-xs">
              K
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              KoZa
            </span>
          </Link>

          {/* Desktop Sidebar Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? "Buka Menu Sidebar (Klik untuk menampilkan)" : "Tutup Menu Sidebar"}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/10 transition-colors shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Universal Search Command Mockup (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 w-64 md:w-80 transition-colors focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[#151E2E]">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pesanan, produk, HPP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-xs"
            />
            <span className="hidden md:inline-flex items-center gap-0.5 rounded border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[9.5px] font-mono font-bold text-slate-500 dark:text-slate-400">
              ⌘K
            </span>
          </div>
        </div>

        {/* Topbar Right Actions */}
        <div className="flex items-center gap-2">
          {/* Privacy Shield Toggle (Masking HPP & Net Margins) */}
          <button
            type="button"
            onClick={togglePrivacy}
            title={isPrivacyActive ? "Privasi Aktif: Nominal Laba & HPP Disamarkan (Klik untuk menampilkan)" : "Sembunyikan Angka HPP & Laba saat di tempat umum"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              isPrivacyActive
                ? "bg-amber-50 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-300/80 dark:border-amber-500/30 shadow-xs"
                : "bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-200/60 dark:hover:bg-white/10"
            }`}
          >
            {isPrivacyActive ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Privasi: On</span>
                <span className="sm:hidden">Privasi</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Privasi: Off</span>
              </>
            )}
          </button>

          {/* Quota Indicator Pill */}
          <Link
            href="/dashboard/topup"
            className={`hidden md:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all border ${
              store.quotaBalance <= 5
                ? "bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 animate-pulse"
                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
            }`}
            title="Klik untuk isi ulang kuota transaksi"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 fill-current" />
            <span>{store.quotaBalance} Kuota</span>
          </Link>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />

          {/* Open Storefront Button */}
          <Link
            href={`/toko/${store.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400 px-3 py-1.5 text-xs font-bold text-white dark:text-slate-950 shadow-xs shadow-emerald-600/20 hover:brightness-105 active:scale-95 transition-all"
          >
            <StoreIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Lihat Toko</span>
            <span className="sm:hidden">Toko</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
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
            title="Keluar dari Akun Toko"
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 hover:border-rose-200 dark:hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function DashboardMobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");
  const { orders } = useStore();

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES"
  ).length;

  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/dashboard/produk", label: "Produk", icon: Package },
    { 
      href: "/dashboard/jaga-ai", 
      label: "Jaga AI", 
      icon: Bot, 
      isAI: true 
    },
    { 
      href: "/dashboard/landing-pages", 
      label: "Jualan AI", 
      icon: Sparkles, 
      isAI: true 
    },
    { 
      href: "/dashboard/pesanan", 
      label: "Pesanan", 
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    { href: "/dashboard/keuangan", label: "Laba", icon: TrendingUp },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0E1420]/95 backdrop-blur-xl lg:hidden safe-bottom transition-colors">
      <div className="grid grid-cols-6 py-1 px-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const itemPath = item.href.split("?")[0];
          const itemTab = item.href.includes("?tab=") ? new URLSearchParams(item.href.split("?")[1]).get("tab") : null;

          let isActive = false;
          if (itemTab) {
            isActive = pathname === itemPath && currentTab === itemTab;
          } else if (item.href === "/dashboard") {
            isActive = pathname === "/dashboard";
          } else if (pathname === itemPath) {
            isActive = !currentTab || currentTab === "shipping";
          } else {
            isActive = itemPath !== "/dashboard" && pathname.startsWith(itemPath);
          }

          if (item.isAI) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-3 group"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-md transition-all active:scale-90 ${
                  isActive 
                    ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 ring-2 ring-amber-400/50 shadow-amber-500/30" 
                    : "bg-slate-100 dark:bg-slate-800 border border-amber-500/40 text-amber-600 dark:text-amber-400"
                }`}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className={`mt-1 text-[10px] font-bold tracking-tight ${
                  isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 text-[10px] font-medium transition-colors relative ${
                isActive 
                  ? "text-emerald-700 dark:text-emerald-400 font-bold" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Backward compatibility export if any page imports DashboardNav
export function DashboardNav() {
  return (
    <>
      <DashboardTopbar />
      <DashboardMobileNav />
    </>
  );
}
