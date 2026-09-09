"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatRupiah, formatDate } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { 
  ShoppingBag, 
  MessageSquare, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";

export default function OrderManagementPage() {
  const { orders, updateOrderStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "ALL") return true;
    return o.status === filterStatus;
  });

  const handleUpdateResi = (orderId: string) => {
    const resi = trackingInputs[orderId];
    if (!resi) {
      alert("Masukkan nomor resi terlebih dahulu");
      return;
    }
    updateOrderStatus(orderId, "DIKIRIM", resi);
    alert(`Pesanan berhasil diupdate menjadi DIKIRIM dengan Resi: ${resi}`);
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  const openWhatsAppChat = (phone: string, orderNumber: string, customerName: string) => {
    const cleanPhone = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
    const text = encodeURIComponent(
      `Halo Kak ${customerName}, terima kasih sudah order di toko kami! Pesanan #${orderNumber} sedang kami siapkan ya kak 🙏`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-emerald-400" />
          <span>Kelola Pesanan ({orders.length})</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Pesanan dari pembeli di toko bio link Anda otomatis masuk ke sini. Tandai selesai untuk sinkronisasi laba ke buku kas.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "ALL", label: "Semua", count: orders.length },
          { key: "MENUNGGU_BAYAR", label: "Menunggu Bayar", count: orders.filter((o) => o.status === "MENUNGGU_BAYAR").length },
          { key: "DIPROSES", label: "Diproses", count: orders.filter((o) => o.status === "DIPROSES").length },
          { key: "DIKIRIM", label: "Dikirim", count: orders.filter((o) => o.status === "DIKIRIM").length },
          { key: "SELESAI", label: "Selesai", count: orders.filter((o) => o.status === "SELESAI").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === tab.key
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-slate-950/60 px-1.5 py-0.2 text-[10px]">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 py-16 text-center text-slate-400">
            Tidak ada pesanan pada kategori ini.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-white">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                    {order.paymentMethod === "WHATSAPP" ? "Order via WA" : "QRIS Toko"}
                  </span>
                  {order.status === "SELESAI" && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Selesai
                    </span>
                  )}
                  {order.status === "DIKIRIM" && (
                    <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-400 flex items-center gap-1">
                      <Truck className="h-3 w-3" /> Dalam Pengiriman
                    </span>
                  )}
                  {order.status === "DIPROSES" && (
                    <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Siap Dikirim
                    </span>
                  )}
                  {order.status === "MENUNGGU_BAYAR" && (
                    <span className="rounded-full bg-rose-500/15 border border-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Menunggu Bayar
                    </span>
                  )}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer */}
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Pembeli
                  </span>
                  <div className="text-sm font-bold text-white">{order.customerName}</div>
                  <div className="text-slate-400">{order.customerPhone}</div>
                  <button
                    onClick={() => openWhatsAppChat(order.customerPhone, order.orderNumber, order.customerName)}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold pt-1"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat Pembeli di WhatsApp</span>
                  </button>
                </div>

                {/* Shipping info */}
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Pengiriman & Kurir
                  </span>
                  <div className="font-semibold text-slate-200">
                    {order.courierName} — {order.courierService}
                  </div>
                  <div className="text-slate-400 line-clamp-2">
                    {order.customerAddress}, {order.destinationDistrict}, {order.destinationCity}
                  </div>
                  {order.trackingNumber && (
                    <div className="flex items-center gap-1.5 pt-1 font-mono text-emerald-400">
                      <span>No Resi: {order.trackingNumber}</span>
                      <button
                        onClick={() => handleCopyResi(order.trackingNumber!)}
                        className="text-slate-400 hover:text-white"
                        title="Salin Resi"
                      >
                        {copiedResi === order.trackingNumber ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Items & Finance Breakdown */}
                <div className="space-y-1 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Rincian Finansial
                  </span>
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal Barang:</span>
                    <span>{formatRupiah(order.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ongkir Kurir:</span>
                    <span>{formatRupiah(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                    <span>Total Bayar:</span>
                    <span>{formatRupiah(order.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-emerald-400 text-[11px] pt-1">
                    <span>Laba Bersih Toko:</span>
                    <span>+{formatRupiah(order.netProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="rounded-xl bg-slate-950/40 p-3 border border-slate-800/60 text-xs">
                <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider block mb-1">
                  Item Belanjaan:
                </span>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span>
                        <strong>{item.quantity}x</strong> {item.productName} ({item.weightGrams}g)
                      </span>
                      <span className="font-mono">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 gap-3">
                {/* Resi Input Field for Processing Status */}
                {order.status === "DIPROSES" ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Input Nomor Resi..."
                      value={trackingInputs[order.id] || ""}
                      onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdateResi(order.id)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                      Kirim Resi
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Status: <strong className="text-slate-300">{order.status}</strong>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {order.status === "MENUNGGU_BAYAR" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "DIPROSES")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      Verifikasi Pembayaran
                    </button>
                  )}

                  {order.status === "DIKIRIM" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "SELESAI")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      Tandai Paket Selesai & Lunas
                    </button>
                  )}

                  {order.status !== "BATAL" && order.status !== "SELESAI" && (
                    <button
                      onClick={() => {
                        if (confirm("Batalkan pesanan ini?")) {
                          updateOrderStatus(order.id, "BATAL");
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
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
