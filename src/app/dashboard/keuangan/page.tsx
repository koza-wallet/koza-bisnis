"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatRupiah, formatDate } from "@/lib/utils";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Trash2, 
  Download, 
  PieChart,
  Receipt,
  FileSpreadsheet,
  Layers
} from "lucide-react";

export default function FinanceBookkeepingPage() {
  const { financialMetrics, expenses, addExpense, deleteExpense, orders } = useStore();

  // Form input pengeluaran
  const [category, setCategory] = useState<"PACKING" | "BENSIN" | "IKLAN" | "ADMIN" | "LAINNYA">("PACKING");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0 || !description) {
      alert("Masukkan nominal dan keterangan pengeluaran yang valid.");
      return;
    }

    addExpense({
      storeId: "store-1",
      category,
      description,
      amount: num,
    });

    setDescription("");
    setAmount("");
  };

  const handleExportCSV = () => {
    const rows = [
      ["Tanggal", "Tipe", "Kategori/Keterangan", "Nominal", "Status"],
      ...orders.map((o) => [
        formatDate(o.createdAt),
        "PEMASUKAN",
        `Pesanan #${o.orderNumber} - ${o.customerName}`,
        o.grandTotal.toString(),
        o.status,
      ]),
      ...expenses.map((e) => [
        formatDate(e.date),
        "PENGELUARAN",
        `[${e.category}] ${e.description}`,
        e.amount.toString(),
        "SELESAI",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan-keuangan-koza-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            <span>Buku Kas & Laba Rugi Otomatis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Pencatatan omset, modal HPP, dan laba bersih dari toko online terakumulasi secara otomatis tanpa input manual.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-700 transition-all active:scale-95"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          <span>Ekspor Laporan (Excel/CSV)</span>
        </button>
      </div>

      {/* Main P&L Income Statement Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Laporan Keuangan Realtime Toko
            </span>
          </div>
          <span className="text-xs text-slate-400">Bulan Berjalan (September 2026)</span>
        </div>

        {/* Big Profit Number */}
        <div className="text-center py-2 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Laba Bersih Murni (Net Profit)
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-400">
            {formatRupiah(financialMetrics.labaBersih)}
          </div>
          <p className="text-xs text-slate-400">
            Margin Keuntungan: <strong className="text-emerald-400">{financialMetrics.marginPercent.toFixed(1)}%</strong> dari total penjualan
          </p>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
              <span>Total Omset Penjualan</span>
            </div>
            <div className="text-xl font-bold text-white">
              {formatRupiah(financialMetrics.totalOmset)}
            </div>
            <div className="text-[11px] text-slate-500">Uang bruto dari pembeli</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>Modal Produk (HPP)</span>
            </div>
            <div className="text-xl font-bold text-white">
              -{formatRupiah(financialMetrics.totalHPP)}
            </div>
            <div className="text-[11px] text-slate-500">Biaya kulakan barang laku</div>
          </div>

          <div className="rounded-xl bg-slate-950/60 p-4 border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              <span>Biaya Operasional Toko</span>
            </div>
            <div className="text-xl font-bold text-white">
              -{formatRupiah(financialMetrics.totalExpenses)}
            </div>
            <div className="text-[11px] text-slate-500">Packing, bensin, iklan, dll</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Catat Pengeluaran & Riwayat Pengeluaran */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Catat Pengeluaran Operasional (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Catat Biaya Operasional</span>
            </h2>
            <p className="text-xs text-slate-400">
              Catat pengeluaran toko di luar modal baju agar perhitungan laba bersih akurat 100%.
            </p>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Biaya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="PACKING">📦 Packing (Plastik, Lakban, Bubble Wrap)</option>
                <option value="BENSIN">🛵 Bensin & Transportasi Drop Paket</option>
                <option value="IKLAN">📢 Iklan & Promosi (Meta Ads, Endorse)</option>
                <option value="ADMIN">👤 Gaji / Makan Admin</option>
                <option value="LAINNYA">⚙️ Pengeluaran Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Keterangan Biaya *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Lakban 2 rol + Plastik polymailer"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nominal Biaya (Rp) *
              </label>
              <input
                type="number"
                required
                placeholder="25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
            >
              Simpan Pengeluaran
            </button>
          </form>
        </div>

        {/* List of Operational Expenses (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-400" />
              <span>Riwayat Biaya Operasional ({expenses.length})</span>
            </h2>
            <span className="text-xs font-semibold text-rose-400">
              Total: {formatRupiah(financialMetrics.totalExpenses)}
            </span>
          </div>

          <div className="divide-y divide-slate-800 max-h-[340px] overflow-y-auto pr-1">
            {expenses.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Belum ada catatan biaya operasional toko.
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {exp.category}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {formatDate(exp.date)}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {exp.description}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-rose-400">
                      -{formatRupiah(exp.amount)}
                    </span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
