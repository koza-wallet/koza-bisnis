"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Order } from "@/types";
import { 
  ShoppingBag, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Star,
  Lock,
  Search,
  Inbox
} from "lucide-react";

export default function OrderManagementPage() {
  const { orders, updateOrderStatus, processOrderWithQuota } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [savingResiId, setSavingResiId] = useState<string | null>(null);
  const [resiSuccessMsg, setResiSuccessMsg] = useState<{ id: string; msg: string } | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === "ALL" || o.status === filterStatus;
    const matchesSearch = !searchQuery || 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleUpdateResi = async (orderId: string) => {
    const resi = trackingInputs[orderId]?.trim();
    if (!resi) {
      alert("Masukkan nomor resi terlebih dahulu");
      return;
    }
    updateOrderStatus(orderId, "DIKIRIM", resi);
    setSavingResiId(orderId);

    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "DIKIRIM",
          trackingNumber: resi,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.notificationSent) {
        setResiSuccessMsg({ id: orderId, msg: "Resi tersimpan & notifikasi WhatsApp terkirim ke pembeli! 🚀" });
      } else {
        setResiSuccessMsg({ id: orderId, msg: "Nomor resi berhasil disimpan." });
      }
      setTimeout(() => setResiSuccessMsg(null), 4000);
    } catch (err) {
      console.warn("Gagal sinkron status pesanan:", err);
    } finally {
      setSavingResiId(null);
    }
  };

  const handleCopyResi = (resi: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resi);
      setCopiedResi(resi);
      setTimeout(() => setCopiedResi(null), 2000);
    }
  };

  const handleCopyTrackingLink = (orderNumber: string) => {
    const url = typeof window !== "undefined" 
      ? `${window.location.origin}/lacak/${orderNumber}` 
      : `https://www.kozabisnis.com/lacak/${orderNumber}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(orderNumber);
      setTimeout(() => setCopiedLink(null), 2000);
    }
  };

  const openWhatsAppChat = (order: Order) => {
    const cleanPhone = order.customerPhone.startsWith("0") 
      ? "62" + order.customerPhone.slice(1) 
      : order.customerPhone;
    const trackingUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/lacak/${order.orderNumber}` 
      : `https://www.kozabisnis.com/lacak/${order.orderNumber}`;

    let message = `Halo Kak ${order.customerName}, terima kasih sudah berbelanja di toko kami! Pesanan #${order.orderNumber} sedang kami siapkan ya kak 🙏`;

    if (order.status === "DIKIRIM" && order.trackingNumber) {
      message = `Halo Kak ${order.customerName}! Paket pesanan #${order.orderNumber} telah kami kirimkan via ${order.courierName} dengan No. Resi: *${order.trackingNumber}*.\n\nPantau pergerakan paket secara langsung di:\n${trackingUrl}\n\nTerima kasih banyak sudah berbelanja di toko kami! 🙏`;
    } else if (order.status === "SELESAI") {
      message = `Halo Kak ${order.customerName}, paket pesanan #${order.orderNumber} tercatat sudah tiba dengan aman 📦✨!\n\nBantu kami dengan memberikan rating & ulasan di:\n${trackingUrl}?review=true\n\nTerima kasih banyak ya kak 🙏`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SELESAI":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200/90 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            Selesai
          </span>
        );
      case "DIKIRIM":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:text-sky-400 border border-sky-200/90 dark:border-sky-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
            Dalam Pengiriman
          </span>
        );
      case "DIPROSES":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-400 border border-amber-200/90 dark:border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            Diproses
          </span>
        );
      case "TERKUNCI_KUOTA":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            <Lock className="h-3 w-3" />
            Terkunci Kuota
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:text-rose-400 border border-rose-200/90 dark:border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
            Menunggu Bayar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Title & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Kelola Pesanan
            </h1>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {orders.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pesanan dari pembeli toko online & bio link Anda. Tandai selesai untuk sinkronisasi laba bersih ke buku kas.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. order / pembeli..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 2. Filter Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "ALL", label: "Semua", count: orders.length },
          { key: "MENUNGGU_BAYAR", label: "Menunggu Bayar", count: orders.filter((o) => o.status === "MENUNGGU_BAYAR").length },
          { key: "TERKUNCI_KUOTA", label: "Terkunci Kuota", count: orders.filter((o) => o.status === "TERKUNCI_KUOTA").length },
          { key: "DIPROSES", label: "Diproses", count: orders.filter((o) => o.status === "DIPROSES").length },
          { key: "DIKIRIM", label: "Dikirim", count: orders.filter((o) => o.status === "DIKIRIM").length },
          { key: "SELESAI", label: "Selesai", count: orders.filter((o) => o.status === "SELESAI").length },
        ].map((tab) => {
          const isActive = filterStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                isActive ? "bg-emerald-800 text-emerald-100" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161E2E] py-16 px-4 text-center space-y-3 shadow-xs">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
              <Inbox className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Tidak ada pesanan pada filter ini</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery 
                  ? "Tidak ada pesanan yang sesuai dengan kata kunci pencarian Anda." 
                  : "Belum ada pesanan masuk untuk kategori status ini."}
              </p>
            </div>
            {(searchQuery || filterStatus !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setFilterStatus("ALL");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161E2E] p-5 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    {order.paymentMethod === "WHATSAPP" ? "Order via WA" : "QRIS Toko"}
                  </span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Customer & Courier & Finance Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Col 1: Customer Info */}
                <div className="space-y-1.5">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
                    Data Pembeli
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{order.customerName}</div>
                  <div className="font-mono text-slate-600 dark:text-slate-400">{order.customerPhone}</div>
                  
                  <button
                    type="button"
                    onClick={() => openWhatsAppChat(order)}
                    className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-semibold pt-1 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat Pembeli di WhatsApp</span>
                  </button>

                  {order.customerRating ? (
                    <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-2 space-y-1">
                      <div className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-bold text-[11px]">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{order.customerRating}/5 Bintang dari Pembeli</span>
                      </div>
                      {order.customerReview && (
                        <p className="text-slate-700 dark:text-slate-300 italic text-[10px] line-clamp-2">"{order.customerReview}"</p>
                      )}
                    </div>
                  ) : order.status === "SELESAI" ? (
                    <div className="pt-1 text-[10px] text-slate-400 flex items-center gap-1">
                      <Star className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                      <span>Belum ada ulasan pembeli</span>
                    </div>
                  ) : null}
                </div>

                {/* Col 2: Shipping & Tracking */}
                <div className="space-y-1.5">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
                    Pengiriman & Kurir
                  </span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {order.courierName} — {order.courierService}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {order.customerAddress}, {order.destinationDistrict}, {order.destinationCity}
                  </div>

                  {order.trackingNumber ? (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-1.5 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                        <span>Resi: {order.trackingNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyResi(order.trackingNumber!)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                          title="Salin Nomor Resi"
                        >
                          {copiedResi === order.trackingNumber ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Link
                          href={`/lacak/${order.orderNumber}`}
                          target="_blank"
                          className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium transition-colors"
                        >
                          <span>Lacak Kurir</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTrackingLink(order.orderNumber)}
                          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer"
                        >
                          {copiedLink === order.orderNumber ? "Link Tersalin!" : "Salin Link Lacak"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic pt-1">
                      Nomor resi belum diinput
                    </div>
                  )}
                </div>

                {/* Col 3: Financial Summary Breakdown */}
                <div className="space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] block">
                    Rincian Finansial
                  </span>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Subtotal Barang:</span>
                    <span className="font-mono font-semibold">{formatRupiah(order.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Ongkos Kirim:</span>
                    <span className="font-mono">{formatRupiah(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Bayar:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">{formatRupiah(order.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-800 dark:text-emerald-400 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-850">
                    <span>Laba Bersih Toko:</span>
                    <span className="font-mono">+{formatRupiah(order.netProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Items List Box */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-950/40 p-3 border border-slate-200 dark:border-slate-800/60 text-xs">
                <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider block mb-1.5">
                  Daftar Item Belanjaan:
                </span>
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="truncate pr-2">
                        <strong className="text-slate-900 dark:text-white font-mono">{item.quantity}x</strong> {item.productName} ({item.weightGrams}g)
                      </span>
                      <span className="font-mono shrink-0 font-semibold">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                {/* Resi Input for DIPROSES status */}
                {order.status === "DIPROSES" ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Input nomor resi kurir..."
                      value={trackingInputs[order.id] || ""}
                      onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={savingResiId === order.id}
                      onClick={() => handleUpdateResi(order.id)}
                      className="rounded-lg bg-sky-600 hover:bg-sky-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {savingResiId === order.id ? "Menyimpan..." : "Kirim Resi"}
                    </button>
                    {resiSuccessMsg?.id === order.id && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                        {resiSuccessMsg.msg}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Status: <strong className="text-slate-800 dark:text-slate-300 font-mono">{order.status}</strong>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {order.status === "MENUNGGU_BAYAR" && (
                    <button
                      type="button"
                      disabled={processingOrderId === order.id}
                      onClick={async () => {
                        setProcessingOrderId(order.id);
                        const res = await processOrderWithQuota(order.id);
                        setProcessingOrderId(null);
                        if (!res.success) {
                          alert(res.message || "Gagal memproses pesanan.");
                        }
                      }}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {processingOrderId === order.id ? "Memproses..." : "Verifikasi Pembayaran"}
                    </button>
                  )}

                  {order.status === "TERKUNCI_KUOTA" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/dashboard/topup"
                        className="rounded-lg bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Kuota Habis — Top-Up Kuota</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        disabled={processingOrderId === order.id}
                        onClick={async () => {
                          setProcessingOrderId(order.id);
                          const res = await processOrderWithQuota(order.id);
                          setProcessingOrderId(null);
                          if (!res.success) {
                            alert(res.message || "Gagal memproses pesanan.");
                          }
                        }}
                        className="rounded-lg bg-emerald-600/90 hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {processingOrderId === order.id ? "Memproses..." : "Coba Proses Ulang"}
                      </button>
                    </div>
                  )}

                  {order.status === "DIKIRIM" && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/lacak/${order.orderNumber}`}
                        target="_blank"
                        className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <span>Lacak Kurir</span>
                        <ExternalLink className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, "SELESAI")}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        Tandai Selesai & Lunas
                      </button>
                    </div>
                  )}

                  {order.status !== "BATAL" && order.status !== "SELESAI" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Batalkan pesanan ini?")) {
                          updateOrderStatus(order.id, "BATAL");
                        }
                      }}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
