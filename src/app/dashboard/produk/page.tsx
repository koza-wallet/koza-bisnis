"use client";

import { useState } from "react";
import { useStore } from "@/lib/store-context";
import { formatRupiah } from "@/lib/utils";
import { 
  Plus, 
  Trash2, 
  Package, 
  Sparkles, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  Search,
  Inbox,
  ShieldCheck,
  Layers
} from "lucide-react";

export default function ProductManagementPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

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

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Title & CTA Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Katalog Produk
            </h1>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-300 border border-slate-700">
              {products.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola produk etalase toko. Harga modal HPP terenkripsi rahasia dan hanya terlihat di dashboard Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* 2. Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                {cat === "ALL" ? "Semua Kategori" : cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* 3. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 py-16 px-4 text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Inbox className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "ALL"
                ? "Tidak ada produk yang cocok dengan kriteria filter pencarian Anda."
                : "Toko Anda belum memiliki produk jualan. Tambahkan produk pertama Anda sekarang."}
            </p>
          </div>
          {searchQuery || selectedCategory !== "ALL" ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Reset Filter Pencarian
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Produk Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const profit = product.sellingPrice - product.costPrice;
            const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;

            return (
              <div
                key={product.id}
                className={`group rounded-2xl border bg-slate-900/60 overflow-hidden shadow-lg transition-all hover:border-slate-700 backdrop-blur-md flex flex-col justify-between ${
                  product.isActive ? "border-slate-800/80" : "border-slate-800/40 opacity-60"
                }`}
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%]">
                      <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-slate-700">
                        {product.category}
                      </span>
                      <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700">
                        {product.weightGrams}g
                      </span>
                      {product.minOrderQuantity && product.minOrderQuantity > 1 && (
                        <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-slate-950 border border-amber-400">
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
                        type="button"
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

                  {/* Product Content Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {product.description || "Tidak ada deskripsi produk."}
                      </p>
                    </div>

                    {/* Price & Cost Breakdown Box */}
                    <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Harga Jual:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {formatRupiah(product.sellingPrice)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span>Modal (HPP):</span>
                          <span className="text-[10px] text-amber-400/80">Rahasia</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {formatRupiah(product.costPrice)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-medium text-emerald-400">Laba/pcs:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{formatRupiah(profit)} ({margin.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    {/* Wholesale Tiers Preview */}
                    {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                      <div className="rounded-xl bg-indigo-950/40 p-2.5 border border-indigo-500/25 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                          <span>Harga Grosir Bertingkat:</span>
                          <span className="font-mono">{product.wholesaleTiers.length} Tier</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          {product.wholesaleTiers.map((t, idx) => (
                            <div key={idx} className="flex justify-between bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80 text-slate-300 font-mono">
                              <span>≥ {t.minQty} pcs:</span>
                              <span className="font-bold text-emerald-400">{formatRupiah(t.unitPrice)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock & Delete Action Footer */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-850">
                  <div className="text-xs text-slate-400">
                    Stok: <strong className="text-white font-mono">{product.stock} pcs</strong>
                  </div>

                  <button
                    type="button"
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
            );
          })}
        </div>
      )}

      {/* 4. Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative my-8">
            <button
              type="button"
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
                Input harga jual ke pembeli dan modal kulakan HPP untuk pencatatan laba bersih otomatis.
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
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Dual Price Calculation (The KoZa Margin Engine) */}
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
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
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
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Live Profit Preview Banner */}
                {sellingNum > 0 && costNum > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Estimasi Laba per Pcs:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{formatRupiah(profitPerItem)} ({profitMargin.toFixed(1)}% Margin)
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
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
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
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none text-xs"
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

              {/* Wholesale / B2B Section */}
              <div className="rounded-xl bg-slate-950/90 p-4 border border-indigo-500/25 space-y-3">
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
                    Minimal Pembelian (MOQ)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={minOrderQuantity}
                      onChange={(e) => setMinOrderQuantity(e.target.value)}
                      className="w-28 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                    />
                    <span className="text-xs text-slate-400">pcs (default 1 untuk eceran)</span>
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
                      Belum ada tier grosir. Klik "+ Tambah Tier" untuk memberi harga khusus jika pembeli beli banyak.
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
                              className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white text-center focus:border-indigo-500 focus:outline-none font-mono"
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
                              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
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
                  className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs sm:text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
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

