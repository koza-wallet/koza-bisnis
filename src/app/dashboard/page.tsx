"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { usePrivacy } from "@/lib/privacy-context";
import { formatRupiah, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  ShoppingBag, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowUpRight, 
  Plus, 
  Sparkles, 
  Store as StoreIcon,
  Inbox,
  Printer,
  ShieldCheck,
  Zap,
  RotateCcw,
  Clock,
  CheckCircle2,
  Truck,
  MessageSquare,
  Bot,
  X
} from "lucide-react";

interface ThermalData {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  destinationAddress?: string;
  productInfo: string;
  courierName: string;
  awbNumber: string;
  totalAmount: number;
  isCod: boolean;
}

export default function DashboardOverviewPage() {
  const { store, products, orders, financialMetrics } = useStore();
  const { isPrivacyActive } = usePrivacy();

  const [copied, setCopied] = useState(false);
  const [storeUrl, setStoreUrl] = useState(`https://www.kozabisnis.com/toko/${store.slug}`);
  const [activeChartTab, setActiveChartTab] = useState<"7d" | "30d" | "year">("30d");
  const [syncToast, setSyncToast] = useState(false);

  // Thermal Modal State
  const [isThermalOpen, setIsThermalOpen] = useState(false);
  const [thermalData, setThermalData] = useState<ThermalData | null>(null);

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

  const handleSyncData = () => {
    setSyncToast(true);
    setTimeout(() => setSyncToast(false), 2500);
  };

  const openThermalModal = (order: typeof orders[0]) => {
    const productSummary = order.items.length > 0 
      ? order.items.map(i => `${i.productName} (${i.quantity}x)`).join(", ")
      : "Produk Pesanan Retail";

    setThermalData({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone || "0812-3456-7890",
      destinationAddress: order.customerAddress || `${order.destinationCity || "Bandung"}, Jawa Barat (Kode Pos 40132)`,
      productInfo: productSummary,
      courierName: order.courierName || "J&T Express",
      awbNumber: order.trackingNumber || `KZ${Math.floor(1000000000 + Math.random() * 9000000000)}ID`,
      totalAmount: order.grandTotal,
      isCod: false
    });
    setIsThermalOpen(true);
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES"
  ).length;

  const inDeliveryCount = orders.filter((o) => o.status === "DIKIRIM").length;
  const completedCount = orders.filter((o) => o.status === "SELESAI").length;

  // Nilai penghematan komisi marketplace (20% standar)
  const feeSaved = Math.round(financialMetrics.totalOmset * 0.20);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 border border-emerald-200/90 dark:border-emerald-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            Selesai
          </span>
        );
      case "DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold text-cyan-800 dark:text-cyan-400 border border-cyan-200/90 dark:border-cyan-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400" />
            Dikirim
          </span>
        );
      case "DIPROSES":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-400 border border-amber-200/90 dark:border-amber-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:text-rose-400 border border-rose-200/90 dark:border-rose-500/25">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
            Menunggu Bayar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Sinkronisasi */}
      {syncToast && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-2.5 text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span>Data transaksi toko & ekspedisi berhasil disinkronkan!</span>
        </div>
      )}

      {/* 1. View Header Banner: Ringkasan Bisnis & Arus Laba */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E1420] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Ringkasan Bisnis & Arus Laba 📊
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Real-time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Monitor perputaran modal HPP, margin laba bersih, dan pengiriman resi otomatis toko <strong>{store.name}</strong> tanpa potongan komisi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSyncData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Sinkron Data</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 transition-all cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Tersalin!" : "Salin Bio Link"}</span>
          </button>

          <Link
            href="/dashboard/topup"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-105 text-white shadow-xs transition-all"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Top-up Saldo Resi</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 Bento Grid Cards Finansial (Craft UI Aesthetics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bento 1: Laba Bersih Riil (Net Margin) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-200/90 dark:border-emerald-500/30 bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-[#0E1420] dark:to-[#080B11] p-5 shadow-xs transition-colors glow-emerald">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Laba Bersih Riil (Net Margin)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-500/25">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 privacy-sensitive">
              {formatRupiah(financialMetrics.labaBersih)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-mono font-bold bg-emerald-100/90 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-300/80 dark:border-emerald-500/25 text-[11px]">
                +{financialMetrics.marginPercent.toFixed(1)}% Margin
              </span>
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                100% bebas potongan 20%
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Omset Kotor:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 privacy-sensitive text-[11.5px]">
                {formatRupiah(financialMetrics.totalOmset)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Total HPP Modal:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 privacy-sensitive text-[11.5px]">
                {formatRupiah(financialMetrics.totalHPP)}
              </span>
            </div>
          </div>
        </div>

        {/* Bento 2: Total Pesanan Selesai */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Pesanan Selesai
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-slate-900 dark:text-white">
              {completedCount} <span className="text-xs font-normal text-slate-400">Paket</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              {pendingOrdersCount > 0 ? (
                <span className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded text-[11px] border border-amber-200 dark:border-amber-500/20">
                  {pendingOrdersCount} Perlu Diproses
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  Semua pesanan tuntas
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Dalam Pengiriman:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                {inDeliveryCount} Paket
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Tuntas Sukses:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                {completedCount} Paket
              </span>
            </div>
          </div>
        </div>

        {/* Bento 3: Jaga AI Closing Rate (Tautan Langsung ke Pengaturan & Saklar AI) */}
        <Link
          href="/dashboard/pengaturan?tab=ai_bot"
          className="group rounded-2xl border border-teal-200/80 dark:border-teal-500/20 bg-white dark:bg-[#0E1420] p-5 shadow-xs transition-all hover:border-teal-400 dark:hover:border-teal-500/40 hover:shadow-md cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                Jaga AI Closing Rate
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                Atur Saklar ↗
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 group-hover:scale-110 transition-transform">
              <Bot className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-teal-600 dark:text-teal-400">
              34.2% <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Closing</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Dijawab otomatis dalam hitungan detik
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Respon Speed:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                1.4 Detik
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Eskalasi Manual:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11.5px]">
                0.6%
              </span>
            </div>
          </div>
        </Link>

        {/* Bento 4: Cuan Diselamatkan (ROI) */}
        <div className="rounded-2xl border border-purple-200/80 dark:border-purple-500/20 bg-white dark:bg-[#0E1420] p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 dark:text-purple-300">
              Cuan Diselamatkan (ROI)
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl font-mono font-extrabold tracking-tight text-purple-600 dark:text-purple-400 privacy-sensitive">
              {formatRupiah(feeSaved > 0 ? feeSaved : 14960000)}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Hemat komisi 20% marketplace
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">Biaya Komisi:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11.5px]">
                Rp 0 (0%)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10.5px] text-slate-400 dark:text-slate-400 block">ROI Investasi:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11.5px]">
                Maksimal 100%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Dual Grid: SVG Trend Chart & Real-time Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart Box (66% Width on Desktop) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Tren Omset & Laba Bersih Harian
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Visualisasi performa setelah dikurangi HPP dan biaya operasional
                </p>
              </div>

              {/* Chart Period Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveChartTab("7d")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === "7d"
                      ? "bg-white dark:bg-[#151E2E] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab("30d")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === "30d"
                      ? "bg-white dark:bg-[#151E2E] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  30 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab("year")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeChartTab === "year"
                      ? "bg-white dark:bg-[#151E2E] text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Tahun 2026
                </button>
              </div>
            </div>

            {/* SVG Area Chart Container */}
            <div className="w-full h-52 sm:h-56 mt-4">
              <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" strokeDasharray="4" className="text-slate-200 dark:text-white/10" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="currentColor" strokeDasharray="4" className="text-slate-200 dark:text-white/10" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="currentColor" strokeDasharray="4" className="text-slate-200 dark:text-white/10" />

                {/* Area 1: Omset Kotor (Cyan) */}
                <path
                  d="M 0 120 Q 60 70, 120 85 T 240 45 T 360 60 T 480 25 T 600 35 L 600 170 L 0 170 Z"
                  fill="url(#cyanGrad)"
                />
                <path
                  d="M 0 120 Q 60 70, 120 85 T 240 45 T 360 60 T 480 25 T 600 35"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Area 2: Laba Bersih Riil (Emerald) */}
                <path
                  d="M 0 145 Q 60 110, 120 120 T 240 85 T 360 95 T 480 65 T 600 70 L 600 170 L 0 170 Z"
                  fill="url(#emeraldGrad)"
                />
                <path
                  d="M 0 145 Q 60 110, 120 120 T 240 85 T 360 95 T 480 65 T 600 70"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Point Highlight Dots */}
                <circle cx="480" cy="25" r="5" fill="#06B6D4" stroke="#FFF" strokeWidth="2" />
                <circle cx="480" cy="65" r="5" fill="#10B981" stroke="#FFF" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
              <span>Omset Kotor Penjualan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Laba Bersih Riil (Setelah HPP)</span>
            </div>
          </div>
        </div>

        {/* Live Activity Stream (33% Width on Desktop) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Aktivitas & Log Real-time
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="mt-3.5 space-y-3">
              {/* Item 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs">
                  📦
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Siti Rahmawati (Bandung)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">12d lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Checkout Gamis Silk Crinkle (XL) • COD Rp 167.000
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    J&T Express Auto-AWB Diterbitkan
                  </span>
                </div>
              </div>

              {/* Item 2: Jaga AI */}
              <Link 
                href="/dashboard/pengaturan?tab=ai_bot"
                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-teal-400/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/10 transition-colors group cursor-pointer"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 text-xs">
                  🤖
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                      <span>Jaga AI Closing Otomatis</span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">↗</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">3m lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Menjawab tanya stok & ukuran via WhatsApp
                  </p>
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 block mt-0.5">
                    Konversi Closing: Rp 345.000
                  </span>
                </div>
              </Link>

              {/* Item 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 text-xs">
                  🚚
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Pickup Kurir Dijadwalkan
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">18m lalu</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    SiCepat menjemput 18 paket dari Gudang
                  </p>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block mt-0.5">
                    Status Resi Aktif Terlacak
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/pesanan"
            className="mt-4 flex items-center justify-center gap-1 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 border-t border-slate-100 dark:border-white/10"
          >
            <span>Lihat Semua Riwayat Pesanan</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Quick Action Toolbar (Pintasan Cepat Operasional) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          href="/dashboard/pengaturan?tab=ai_bot"
          className="flex items-center gap-3 p-3.5 rounded-xl border border-teal-300/80 dark:border-teal-500/30 bg-white dark:bg-[#0E1420] hover:border-teal-500 hover:shadow-xs transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
              <span>Jaga AI CS</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 font-bold">24/7</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Saklar & chat bot</div>
          </div>
        </Link>

        <Link
          href="/dashboard/produk"
          className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] hover:border-emerald-500/40 hover:shadow-xs transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Tambah Produk</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{products.length} item aktif</div>
          </div>
        </Link>

        <Link
          href="/dashboard/landing-pages/create"
          className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-300/60 dark:border-amber-500/20 bg-white dark:bg-[#0E1420] hover:border-amber-500/40 hover:shadow-xs transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Bikin Halaman AI</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Pro AI • 25x/bulan (350x/thn)</div>
          </div>
        </Link>

        <Link
          href="/dashboard/pesanan"
          className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] hover:border-cyan-500/40 hover:shadow-xs transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Kelola Pesanan</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{orders.length} total pesanan</div>
          </div>
        </Link>

        <Link
          href="/dashboard/keuangan"
          className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] hover:border-emerald-500/40 hover:shadow-xs transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Kalkulator HPP</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Laba bersih riil</div>
          </div>
        </Link>
      </div>

      {/* 5. Recent Orders Table with Thermal Print Action */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Pesanan Terbaru & Cetak Label Thermal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cetak label thermal 100x150 mm langsung ke printer thermal tanpa perlu screenshot
            </p>
          </div>

          <Link
            href="/dashboard/pesanan"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 self-start sm:self-auto"
          >
            <span>Buka Semua Transaksi ({orders.length})</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Belum ada transaksi pesanan</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Pasang link toko Anda di bio TikTok / Instagram untuk mulai menerima pesanan pembeli.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Link Bio Toko"}</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5 mt-1">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-teal-600 dark:text-teal-400">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    <strong className="text-slate-900 dark:text-white font-bold">{order.customerName}</strong> • {order.destinationCity} ({order.courierName})
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(", ")}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-none border-slate-100 dark:border-white/5">
                  <div className="text-left md:text-right">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white privacy-sensitive">
                      {formatRupiah(order.grandTotal)}
                    </div>
                    <div className="text-[10.5px] font-mono text-slate-400">
                      {order.paymentMethod === "QRIS_TOKO" ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">QRIS Instan</span>
                      ) : (
                        <span className="text-teal-600 dark:text-teal-400">WhatsApp Pay</span>
                      )}
                    </div>
                  </div>

                  {/* Tombol Cetak Label Thermal */}
                  <button
                    type="button"
                    onClick={() => openThermalModal(order)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-white/10 transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Cetak Label</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Modal Pratinjau Cetak Label Thermal Resi (100x150 mm) */}
      {isThermalOpen && thermalData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsThermalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white text-slate-950 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="h-4 w-4 text-slate-700" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Pratinjau Label Thermal (100x150 mm)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsThermalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Thermal Printable Sheet Area */}
            <div className="p-5">
              <div className="thermal-print-area border-2 border-dashed border-slate-300 p-4 bg-white font-mono text-black text-xs leading-tight rounded-lg">
                {/* Header Kurir & Badge Pembayaran */}
                <div className="flex items-start justify-between border-b-2 border-black pb-2.5">
                  <div>
                    <div className="text-base font-black tracking-wide">
                      {thermalData.courierName.toUpperCase()}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700">
                      EZ (REGULER EXPRESS)
                    </div>
                  </div>
                  <div className="bg-black text-white px-2 py-1 font-black text-xs uppercase tracking-wider">
                    {thermalData.isCod ? `COD: ${formatRupiah(thermalData.totalAmount)}` : "LUNAS (TRANSFER)"}
                  </div>
                </div>

                {/* Barcode Mockup */}
                <div className="my-3 text-center">
                  <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,#fff_2px,#fff_4px,#000_4px,#000_7px,#fff_7px,#fff_10px)]" />
                  <div className="font-black text-xs tracking-widest mt-1">
                    {thermalData.awbNumber}
                  </div>
                </div>

                {/* Info Penerima */}
                <div className="mt-3 border-t border-black pt-2">
                  <div className="text-[9.5px] font-bold uppercase text-slate-600">Penerima:</div>
                  <div className="font-bold text-xs">{thermalData.customerName} ({thermalData.customerPhone})</div>
                  <div className="text-[10.5px] text-slate-800 mt-0.5">{thermalData.destinationAddress}</div>
                </div>

                {/* Info Pengirim */}
                <div className="mt-2.5 border-t border-black pt-2">
                  <div className="text-[9.5px] font-bold uppercase text-slate-600">Pengirim:</div>
                  <div className="font-bold text-xs">{store.name} (0812-3456-7890)</div>
                  <div className="text-[10.5px] text-slate-800 mt-0.5">Kec. Solo, Jawa Tengah</div>
                </div>

                {/* Info Isi Barang */}
                <div className="mt-2.5 border-t border-black pt-2">
                  <div className="text-[9.5px] font-bold uppercase text-slate-600">Isi Barang:</div>
                  <div className="font-bold text-[11px]">{thermalData.productInfo}</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">
                    Berat: 0.45 kg • Auto-AWB via Everpro KoZa Bisnis
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.print();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Cetak Printer Thermal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsThermalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-700 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
