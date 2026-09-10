"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatRupiah } from "@/lib/utils";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Package, 
  Sparkles, 
  Check, 
  X,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export default function ProductManagementPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Gamis");
  const [imageUrl, setImageUrl] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [weightGrams, setWeightGrams] = useState("250");
  const [stock, setStock] = useState("20");
  const [minOrderQuantity, setMinOrderQuantity] = useState("1");
  const [wholesaleTiers, setWholesaleTiers] = useState<Array<{ minQty: number; unitPrice: number }>>([]);

  const addWholesaleTier = () => {
    setWholesaleTiers([...wholesaleTiers, { minQty: 10, unitPrice: 0 }]);
  };

  const updateWholesaleTier = (index: number, field: "minQty" | "unitPrice", val: number) => {
    const updated = [...wholesaleTiers];
    updated[index] = { ...updated[index], [field]: val };
    setWholesaleTiers(updated);
  };

  const removeWholesaleTier = (index: number) => {
    setWholesaleTiers(wholesaleTiers.filter((_, i) => i !== index));
  };

  const sellingNum = Number(sellingPrice) || 0;
  const costNum = Number(costPrice) || 0;
  const profitPerItem = sellingNum - costNum;
  const profitMargin = sellingNum > 0 ? (profitPerItem / sellingNum) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice || !costPrice) {
      alert("Mohon lengkapi Nama Produk, Harga Jual, dan Harga Modal (HPP).");
      return;
    }

    const cleanTiers = wholesaleTiers
      .filter((t) => t.minQty > 1 && t.unitPrice > 0)
      .sort((a, b) => a.minQty - b.minQty);

    addProduct({
      storeId: "store-1",
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description,
      sellingPrice: sellingNum,
      costPrice: costNum,
      weightGrams: Number(weightGrams) || 200,
      stock: Number(stock) || 10,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
      category,
      isActive: true,
      minOrderQuantity: Math.max(1, Number(minOrderQuantity) || 1),
      wholesaleTiers: cleanTiers,
    });

    // Reset Form
    setName("");
    setDescription("");
    setImageUrl("");
    setSellingPrice("");
    setCostPrice("");
    setMinOrderQuantity("1");
    setWholesaleTiers([]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-400" />
            <span>Katalog Produk ({products.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Kelola produk yang tampil di toko online Anda. Harga modal (HPP) aman dan hanya Anda yang bisa melihat.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const profit = product.sellingPrice - product.costPrice;
          const margin = (profit / product.sellingPrice) * 100;

          return (
            <div
              key={product.id}
              className={`rounded-2xl border bg-slate-900/60 overflow-hidden shadow-lg transition-all ${
                product.isActive ? "border-slate-800" : "border-slate-800/40 opacity-60"
              }`}
            >
              {/* Product Image & Badges */}
              <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%]">
                  <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-slate-700">
                    {product.category}
                  </span>
                  <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                    {product.weightGrams}g
                  </span>
                  {product.minOrderQuantity && product.minOrderQuantity > 1 && (
                    <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-950 border border-amber-400">
                      MOQ: {product.minOrderQuantity}
                    </span>
                  )}
                  {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                    <span className="rounded-full bg-indigo-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-indigo-400">
                      Grosir ({product.wholesaleTiers.length})
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                    className={`rounded-full p-1.5 backdrop-blur-md transition-colors ${
                      product.isActive ? "bg-emerald-500/80 text-white" : "bg-slate-800/80 text-slate-400"
                    }`}
                    title={product.isActive ? "Nonaktifkan Produk" : "Aktifkan Produk"}
                  >
                    {product.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Product Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {product.description || "Tidak ada deskripsi produk."}
                  </p>
                </div>

                {/* Price & Cost Breakdown Box (The KoZa Magic) */}
                <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Harga Jual Pembeli:</span>
                    <span className="text-sm font-bold text-white">
                      {formatRupiah(product.sellingPrice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Harga Modal (HPP):</span>
                    <span className="font-mono text-slate-300">
                      {formatRupiah(product.costPrice)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">Laba Bersih/pcs:</span>
                    <span className="font-bold text-emerald-400">
                      +{formatRupiah(profit)} ({margin.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* Wholesale Tiers Preview */}
                {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                  <div className="rounded-xl bg-indigo-950/40 p-2.5 border border-indigo-500/30 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                      <span>Harga Grosir Bertingkat:</span>
                      <span>{product.wholesaleTiers.length} Tingkat</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {product.wholesaleTiers.map((t, idx) => (
                        <div key={idx} className="flex justify-between bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80 text-slate-300">
                          <span>≥ {t.minQty} pcs:</span>
                          <span className="font-bold text-emerald-400">{formatRupiah(t.unitPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-400">
                    Stok: <strong className="text-white">{product.stock} pcs</strong>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus produk "${product.name}"?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Hapus Produk"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1 mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>Tambah Produk Baru</span>
              </h2>
              <p className="text-xs text-slate-400">
                Input harga jual ke pembeli dan harga modal kulakan untuk pencatatan laba otomatis.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gamis Rayon Polos Premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Kategori & Berat */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Gamis">Gamis</option>
                    <option value="Hijab">Hijab / Pashmina</option>
                    <option value="Dress">Dress</option>
                    <option value="Tunik">Tunik</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Berat Paket (Gram) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dual Price Calculation (The Killer Feature) */}
              <div className="rounded-xl bg-slate-950/80 p-4 border border-emerald-500/20 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Harga Jual (ke Pembeli) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="120000"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Harga Modal (HPP) *</span>
                      <span className="text-[10px] text-amber-400">Rahasia</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="70000"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Profit Preview Banner */}
                {sellingNum > 0 && costNum > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Estimasi Laba per Pcs:</span>
                    <span className="font-bold text-emerald-400">
                      +{formatRupiah(profitPerItem)} ({profitMargin.toFixed(1)}% Laba)
                    </span>
                  </div>
                )}
              </div>

              {/* Stok & URL Foto */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Stok Barang
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link Foto Produk (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail bahan, ukuran, dan keunggulan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Pengaturan Grosir & B2B (Opsional untuk Produsen/Distributor) */}
              <div className="rounded-xl bg-slate-950/90 p-4 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <span>Pengaturan Grosir & Produsen (B2B)</span>
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-400">Opsional</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Atur minimal order (MOQ) dan diskon kuantiti bertingkat untuk pembeli partai besar.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Minimal Pembelian (MOQ / Minimum Order Quantity)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={minOrderQuantity}
                      onChange={(e) => setMinOrderQuantity(e.target.value)}
                      className="w-32 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400">pcs (default 1 pcs untuk eceran)</span>
                  </div>
                </div>

                {/* Wholesale Tiers */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Tier Harga Grosir Bertingkat
                    </label>
                    <button
                      type="button"
                      onClick={addWholesaleTier}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Tier</span>
                    </button>
                  </div>

                  {wholesaleTiers.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">
                      Belum ada tier harga grosir. Klik "+ Tambah Tier" untuk memberi harga khusus jika beli banyak.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {wholesaleTiers.map((tier, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                          <div className="flex-1 flex items-center gap-1.5 text-xs text-slate-300">
                            <span>Beli ≥</span>
                            <input
                              type="number"
                              min="2"
                              value={tier.minQty}
                              onChange={(e) => updateWholesaleTier(idx, "minQty", Number(e.target.value))}
                              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white text-center focus:border-indigo-500 focus:outline-none"
                            />
                            <span>pcs:</span>
                          </div>
                          <div className="flex-1 flex items-center gap-1 text-xs text-slate-300">
                            <span>Rp</span>
                            <input
                              type="number"
                              placeholder="Harga Satuan"
                              value={tier.unitPrice || ""}
                              onChange={(e) => updateWholesaleTier(idx, "unitPrice", Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeWholesaleTier(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
