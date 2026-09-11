"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Eye, 
  TrendingUp, 
  ShoppingBag, 
  Layers,
  ArrowUpRight
} from "lucide-react";

export default function LandingPagesDashboard() {
  const { landingPages, deleteLandingPage } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalViews = landingPages.reduce((sum, lp) => sum + (lp.analytics?.viewsCount || 0), 0);
  const totalOrders = landingPages.reduce((sum, lp) => sum + (lp.analytics?.ordersCount || 0), 0);
  const avgConversion = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : "0.0";

  const copyPublicLink = (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.kozabisnis.com";
    const url = `${origin}/lp/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getThemeBadge = (theme: string) => {
    switch (theme) {
      case "MIDNIGHT":
        return { label: "Midnight Luxe", bg: "bg-amber-100 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30" };
      case "ROSE":
        return { label: "Rose Glow", bg: "bg-pink-100 dark:bg-pink-500/10 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-500/30" };
      case "ELECTRIC":
        return { label: "Electric Flash", bg: "bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30" };
      default:
        return { label: "Emerald Modern", bg: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30" };
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Landing Page Studio
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <Sparkles className="h-3 w-3" />
              AI & Editor Modular
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Buat halaman jualan konversi tinggi dengan AI otomatis 15 detik, kanvas kosong, atau pustaka template siap pakai.
          </p>
        </div>

        <Link
          href="/dashboard/landing-pages/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Landing Page Baru</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161E2E] p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Landing Page</span>
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">{landingPages.length}</p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Aktif siap jualan</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161E2E] p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Pengunjung</span>
            <Eye className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">{totalViews.toLocaleString("id-ID")}</p>
          <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">Trafik organik & iklan</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161E2E] p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Order Closing</span>
            <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">{totalOrders.toLocaleString("id-ID")}</p>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Checkout berhasil</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161E2E] p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Avg Conversion Rate</span>
            <TrendingUp className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">{avgConversion}%</p>
          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">Standar industri 2-3%</span>
        </div>
      </div>

      {/* Catalog Grid */}
      {landingPages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-4">Belum Ada Landing Page</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            Gunakan AI untuk membuat halaman penjualan berkonversi tinggi dalam 15 detik tanpa perlu skill desain coding.
          </p>
          <Link
            href="/dashboard/landing-pages/create"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white mt-5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Bikin Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {landingPages.map((lp) => {
            const themeBadge = getThemeBadge(lp.theme);
            const isCopied = copiedId === lp.id;
            return (
              <div
                key={lp.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161E2E] p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${themeBadge.bg}`}>
                      {themeBadge.label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {lp.tone}
                    </span>
                  </div>

                  {/* Title & Preview Image */}
                  <div className="flex items-start gap-3">
                    {lp.hero.heroImageUrl ? (
                      <img
                        src={lp.hero.heroImageUrl}
                        alt={lp.title}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {lp.title}
                        </h3>
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            lp.isPublished
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                          }`}
                        >
                          {lp.isPublished ? "TERBIT" : "DRAFT"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {lp.hero.subheadline}
                      </p>
                    </div>
                  </div>

                  {/* Pricing info */}
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs">
                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      Rp {lp.pricing.promoPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-slate-400 line-through text-[11px] font-mono">
                      Rp {lp.pricing.normalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="ml-auto rounded bg-rose-100 dark:bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                      Hemat {lp.pricing.discountPercent}%
                    </span>
                  </div>

                  {/* Performance stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-center text-xs">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Views</p>
                      <p className="font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">{lp.analytics?.viewsCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Orders</p>
                      <p className="font-semibold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">{lp.analytics?.ordersCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">CR</p>
                      <p className="font-semibold font-mono text-amber-700 dark:text-amber-400 mt-0.5">{lp.analytics?.conversionRate || 0}%</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyPublicLink(lp.slug, lp.id)}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Salin Link Publik"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? "Tersalin!" : "Link"}</span>
                    </button>

                    <Link
                      href={`/lp/${lp.slug}`}
                      target="_blank"
                      className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                      title="Buka Halaman Publik"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      <span>Lihat</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/landing-pages/${lp.id}/builder`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
                      title="Buka Editor Visual Modular"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Builder</span>
                    </Link>
                    <Link
                      href={`/dashboard/landing-pages/${lp.id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Cepat"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Yakin ingin menghapus landing page ini?")) {
                          deleteLandingPage(lp.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
