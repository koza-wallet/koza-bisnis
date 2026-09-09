"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { formatRupiah, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  ShoppingBag, 
  Zap, 
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
  AlertCircle
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { store, products, orders, financialMetrics, updateOrderStatus } = useStore();
  const [copied, setCopied] = useState(false);

  const storeUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/toko/${store.slug}`
    : `https://koza.id/toko/${store.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Selesai
          </span>
        );
      case "DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Truck className="h-3 w-3" /> Dikirim
          </span>
        );
      case "DIPROSES":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" /> Belum Bayar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Store Link Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Halo, {store.name}! 👋
              </h1>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                Toko Aktif
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Link toko online Anda siap dipajang di Bio TikTok & Instagram.
            </p>
          </div>

          {/* Quick Copy Link Box */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 p-1.5 border border-slate-800">
            <div className="px-3 py-1 text-xs font-mono text-emerald-400 truncate max-w-[200px] sm:max-w-xs">
              {storeUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all active:scale-95 shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Link"}</span>
            </button>
            <Link
              href={`/toko/${store.slug}`}
              target="_blank"
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Buka Toko"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Financial & Store Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Laba Bersih (The Killer Value) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900/60 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Laba Bersih Toko</span>
            <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">
              {formatRupiah(financialMetrics.labaBersih)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">
                {financialMetrics.marginPercent.toFixed(1)}% Margin
              </span>
              <span>setelah dipotong modal (HPP)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Omset Kotor */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Omset Penjualan</span>
            <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400 border border-blue-500/30">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">
              {formatRupiah(financialMetrics.totalOmset)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Dari {financialMetrics.completedOrdersCount} pesanan selesai
            </div>
          </div>
        </div>

        {/* Metric 3: Total Pesanan */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Pesanan Masuk</span>
            <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-white">
              {orders.length}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-amber-400 font-medium">
                {orders.filter((o) => o.status === "MENUNGGU_BAYAR" || o.status === "DIPROSES").length} Perlu Diproses
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Saldo Kuota Order (The Monetization Driver) */}
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-300">Sisa Kuota Order</span>
            <Link
              href="/dashboard/topup"
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300"
            >
              <span>Isi Ulang</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                {store.quotaBalance}
              </span>
              <span className="text-xs text-slate-400 font-normal">Order Tersisa</span>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (store.quotaBalance / 250) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/produk"
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-emerald-500/40 hover:bg-slate-800/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Tambah Produk</div>
            <div className="text-[11px] text-slate-400">{products.length} Produk aktif</div>
          </div>
        </Link>

        <Link
          href="/dashboard/pesanan"
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Kelola Pesanan</div>
            <div className="text-[11px] text-slate-400">Update resi & status</div>
          </div>
        </Link>

        <Link
          href="/dashboard/keuangan"
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-amber-500/40 hover:bg-slate-800/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Buku Kas Toko</div>
            <div className="text-[11px] text-slate-400">Catat biaya & laba</div>
          </div>
        </Link>

        <Link
          href="/dashboard/topup"
          className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 hover:border-purple-500/40 hover:bg-slate-800/60 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Beli Kuota Order</div>
            <div className="text-[11px] text-slate-400">Mulai Rp49rb via QRIS</div>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Pesanan Terbaru</h2>
            <p className="text-xs text-slate-400">Daftar transaksi pembeli yang masuk dari bio link</p>
          </div>
          <Link
            href="/dashboard/pesanan"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Belum ada pesanan masuk. Coba lakukan simulasi order di toko publik Anda!
            </div>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-[11px] text-slate-400">
                      via {order.paymentMethod === "WHATSAPP" ? "WhatsApp Order" : "QRIS Toko"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong>{order.customerName}</strong> • {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {order.destinationCity} • {order.courierName} • {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {formatRupiah(order.grandTotal)}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-400">
                      Laba: +{formatRupiah(order.netProfit)}
                    </div>
                  </div>

                  {/* Fast Action Toggle */}
                  {order.status !== "SELESAI" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "SELESAI")}
                      className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all active:scale-95"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
