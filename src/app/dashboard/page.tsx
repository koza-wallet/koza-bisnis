"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { formatRupiah, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  ShoppingBag, 
  Wallet, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  AlertCircle, 
  Sparkles, 
  Store as StoreIcon,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Inbox
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { store, products, orders, financialMetrics } = useStore();
  const [copied, setCopied] = useState(false);
  const [storeUrl, setStoreUrl] = useState(`https://www.kozabisnis.com/toko/${store.slug}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStoreUrl(`${window.location.origin}/toko/${store.slug}`);
    }
  }, [store.slug]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Selesai
          </span>
        );
      case "DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400 border border-sky-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
            Dikirim
          </span>
        );
      case "DIPROSES":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            Menunggu Bayar
          </span>
        );
    }
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES"
  ).length;

  const quotaPercent = Math.min(100, Math.max(0, (store.quotaBalance / 250) * 100));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Banner & Store Quick Share Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-md shadow-xl">
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Halo, {store.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/25">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Toko Aktif
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Etalase online & Bio Link Anda siap menerima konversi instan dari TikTok, Instagram, dan WhatsApp.
            </p>
          </div>

          {/* Quick Copy Link Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-emerald-400 truncate max-w-full sm:max-w-[260px]">
              <StoreIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{storeUrl}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition-all active:scale-95 shadow-sm"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-200" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Tersalin!" : "Salin Link"}</span>
              </button>
              <Link
                href={`/toko/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors border border-transparent hover:border-slate-700"
                title="Buka Toko di Tab Baru"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4 Core Financial & Store Metric Cards (High-Density Monospace Figures) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Laba Bersih */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-950/20 via-slate-900/60 to-slate-950/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Laba Bersih Toko</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-white">
              {formatRupiah(financialMetrics.labaBersih)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {financialMetrics.marginPercent.toFixed(1)}% Margin
              </span>
              <span className="text-[11px] text-slate-400">setelah HPP</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Omset Kotor */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Omset Penjualan</span>
            <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400 border border-sky-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-white">
              {formatRupiah(financialMetrics.totalOmset)}
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <span className="font-mono text-slate-300 font-semibold">{financialMetrics.completedOrdersCount}</span>
              <span>pesanan selesai</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Pesanan */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pesanan Masuk</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-white">
              {orders.length}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {pendingOrdersCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
                  <Clock className="h-3 w-3" />
                  {pendingOrdersCount} Perlu Diproses
                </span>
              ) : (
                <span className="text-emerald-400 text-xs">Semua pesanan terproses</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 4: Sisa Kuota Order */}
        <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-b from-purple-950/20 via-slate-900/60 to-slate-950/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300">Sisa Kuota Order</span>
            <Link
              href="/dashboard/topup"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>Isi Ulang</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-extrabold tracking-tight text-white">
                {store.quotaBalance}
              </span>
              <span className="text-xs text-slate-400">Order Tersisa</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panduan 3 Langkah Cepat Mulai Jualan (High-Converting Onboarding) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
              ⚡
            </span>
            <h2 className="text-sm font-bold text-white tracking-tight">Panduan 3 Langkah Cepat Mulai Jualan</h2>
          </div>
          <span className="text-xs text-slate-400">Siap menerima transaksi dalam 2 menit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 hover:border-emerald-500/30 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono font-bold text-emerald-400">01</span>
                <Package className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-white">Tambah Produk Jualan</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Upload foto produk, tentukan harga jual, dan isi modal HPP rahasia agar kalkulator laba bersih toko otomatis aktif.
              </p>
            </div>
            <Link
              href="/dashboard/produk"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Kelola Produk</span>
            </Link>
          </div>

          {/* Step 2 */}
          <div className="group flex flex-col justify-between rounded-xl border border-amber-500/25 bg-gradient-to-b from-amber-500/5 to-slate-950/60 p-4 hover:border-amber-500/50 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-amber-400">02</span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-amber-300">Rekomendasi</span>
                </div>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Bikin Halaman Jualan AI</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Buat sales page 1-produk instan dengan AI. Eksklusif member Pro AI — 25x generate/bulan (350x/tahun untuk Pro Tahunan).
              </p>
            </div>
            <Link
              href="/dashboard/landing-pages/create"
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 px-3 py-2 text-xs font-bold text-slate-950 shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bikin Halaman AI (15 Detik)</span>
            </Link>
          </div>

          {/* Step 3 */}
          <div className="group flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 hover:border-sky-500/30 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono font-bold text-sky-400">03</span>
                <StoreIcon className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-white">Pasang Link di Bio Anda</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Salin link toko atau halaman AI Anda, pasang di bio TikTok / IG, dan mulai terima notifikasi pesanan masuk otomatis.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Link Tersalin!" : "Salin Link Toko"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Focused Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/produk"
          className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 hover:border-emerald-500/30 hover:bg-slate-850/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">Tambah Produk</div>
            <div className="text-[11px] text-slate-400 truncate">{products.length} Produk aktif</div>
          </div>
        </Link>

        <Link
          href="/dashboard/landing-pages"
          className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-slate-900/40 p-3.5 hover:border-amber-500/50 hover:bg-slate-850/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">Halaman Jualan AI</div>
            <div className="text-[11px] text-slate-400 truncate">Siap iklan TikTok</div>
          </div>
        </Link>

        <Link
          href="/dashboard/pesanan"
          className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 hover:border-sky-500/30 hover:bg-slate-850/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">Kelola Pesanan</div>
            <div className="text-[11px] text-slate-400 truncate">Update resi & status</div>
          </div>
        </Link>

        <Link
          href="/dashboard/keuangan"
          className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 hover:border-emerald-500/30 hover:bg-slate-850/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">Laba Bersih Toko</div>
            <div className="text-[11px] text-slate-400 truncate">Catat biaya & margin</div>
          </div>
        </Link>
      </div>

      {/* 5. Recent Orders Section (High-Density List) */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Pesanan Terbaru</h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar transaksi masuk dari etalase toko & halaman jualan AI</p>
          </div>
          <Link
            href="/dashboard/pesanan"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Lihat Semua ({orders.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Belum ada pesanan masuk</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Bagikan tautan etalase toko Anda atau pasang di bio media sosial untuk mulai menerima pesanan pembeli.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Link Tersalin!" : "Salin Link Toko Saya"}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 mt-1">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-300 truncate">
                    <strong className="text-white font-medium">{order.customerName}</strong> • {order.destinationCity} ({order.courierName})
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(", ")}
                  </p>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-0 pt-2 sm:pt-0 border-slate-800/60 shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {formatRupiah(order.grandTotal)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
