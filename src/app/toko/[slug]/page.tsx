"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, generateOrderNumber } from "@/lib/utils";
import { destinationOptions } from "@/lib/mock-data";
import { Store, Product, OrderItem } from "@/types";
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  MessageSquare, 
  QrCode, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Truck, 
  Download,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { store: localStore, products: localProducts, createOrder } = useStore();
  const supabase = createClient();

  // Active Store & Products (Fetched by Slug from Supabase)
  const [store, setStore] = useState<Store>(localStore);
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  // Fetch Store & Products from Supabase (P0 & P1 Security Fix)
  useEffect(() => {
    async function loadStoreBySlug() {
      setIsLoading(true);
      try {
        const { data: storeRow, error: storeErr } = await supabase
          .from("stores")
          .select("*")
          .eq("slug", slug)
          .single();

        if (storeRow && !storeErr) {
          setStore({
            id: storeRow.id,
            slug: storeRow.slug,
            name: storeRow.name,
            description: storeRow.description || "",
            logoUrl: storeRow.logo_url || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
            whatsappNumber: storeRow.whatsapp_number,
            originCity: storeRow.origin_city || "Kota Jakarta Selatan",
            originDistrict: storeRow.origin_district || "Kebayoran Baru",
            quotaBalance: storeRow.quota_balance ?? 10,
            plan: storeRow.plan || "NON_PRO",
            bankName: storeRow.bank_name,
            bankAccountNumber: storeRow.bank_account_number,
            bankAccountName: storeRow.bank_account_name,
            qrisImageUrl: storeRow.qris_image_url,
            createdAt: storeRow.created_at,
          });

          // P1 Audit Fix: Query from public_products VIEW so cost_price (HPP) is NEVER exposed to client!
          const { data: prodsRows } = await supabase
            .from("public_products")
            .select("*")
            .eq("store_id", storeRow.id);

          if (prodsRows && prodsRows.length > 0) {
            setProducts(
              prodsRows.map((p: any) => ({
                id: p.id,
                storeId: p.store_id,
                name: p.name,
                slug: p.slug,
                description: p.description || "",
                sellingPrice: Number(p.selling_price),
                costPrice: 0, // P1 Audit: zeroed out on client, HPP is strictly hidden
                weightGrams: p.weight_grams || 300,
                stock: p.stock ?? 0,
                imageUrl: p.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
                category: p.category || "Umum",
                isActive: p.is_active ?? true,
                createdAt: p.created_at,
              }))
            );
          } else {
            setProducts([]);
          }
        } else {
          // Fallback to local store if matches slug or local mock
          if (localStore.slug === slug || slug === "toko-cantik") {
            setStore(localStore);
            setProducts(localProducts);
          } else {
            setIsNotFound(true);
          }
        }
      } catch (err) {
        console.warn("Supabase store lookup failed, using local context:", err);
        if (localStore.slug === slug || slug === "toko-cantik") {
          setStore(localStore);
          setProducts(localProducts);
        } else {
          setIsNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadStoreBySlug();
    }
  }, [slug, localStore, localProducts]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("SEMUA");

  // Cart State: { [productId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(destinationOptions[0]);
  const [courierName, setCourierName] = useState("J&T Express");
  const [paymentMethod, setPaymentMethod] = useState<"WHATSAPP" | "QRIS_TOKO">("WHATSAPP");

  // Success State
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Filter Products
  const activeProducts = products.filter((p) => p.isActive);
  const categories = ["SEMUA", ...Array.from(new Set(activeProducts.map((p) => p.category)))];

  const filteredProducts = activeProducts.filter((p) => {
    const matchCat = selectedCategory === "SEMUA" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Cart Calculations (P1 Audit: costPrice is zeroed out to prevent HPP exposure)
  const cartItems: OrderItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return null as any;
      return {
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unitPrice: prod.sellingPrice,
        unitCost: 0, // P1 Audit: zeroed out on client, HPP is strictly hidden
        weightGrams: prod.weightGrams,
        subtotal: prod.sellingPrice * qty,
      };
    })
    .filter(Boolean);

  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeightGrams = cartItems.reduce((sum, item) => sum + item.weightGrams * item.quantity, 0);
  const weightKgRounded = Math.max(1, Math.ceil(totalWeightGrams / 1000));
  const shippingCost = selectedDestination.baseRate * weightKgRounded;
  const grandTotal = cartSubtotal + shippingCost;
  const totalCostPrice = 0;
  const netProfit = 0;

  const addToCart = (prodId: string) => {
    setCart((prev) => ({
      ...prev,
      [prodId]: (prev[prodId] || 0) + 1,
    }));
  };

  const updateQuantity = (prodId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[prodId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      }
      return { ...prev, [prodId]: next };
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Mohon lengkapi Nama, No WhatsApp, dan Alamat Pengiriman Anda.");
      return;
    }

    const orderNumber = generateOrderNumber();

    // 1. P1 Security: Panggil endpoint server-side dengan validasi, sanitasi & rate limiting
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          customerName,
          customerPhone,
          customerAddress,
          destinationCity: selectedDestination.city,
          destinationDistrict: selectedDestination.district,
          courierName,
          courierService: "Reguler (1-2 Hari)",
          shippingCost,
          items: cartItems,
          paymentMethod,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        alert(resData.error || "Gagal membuat pesanan. Silakan coba lagi.");
        return;
      }

      if (resData.success && resData.order) {
        setCompletedOrder(resData.order);
        setCart({});
        setIsCartOpen(false);
        return;
      }
    } catch (err) {
      console.warn("Server order creation failed, using local fallback:", err);
    }

    // Fallback: local store
    const result = createOrder({
      orderNumber,
      storeId: store.id,
      customerName,
      customerPhone,
      customerAddress,
      destinationCity: selectedDestination.city,
      destinationDistrict: selectedDestination.district,
      courierName,
      courierService: "Reguler (1-2 Hari)",
      shippingCost,
      itemsTotal: cartSubtotal,
      grandTotal,
      totalCostPrice: 0,
      netProfit: 0,
      status: paymentMethod === "QRIS_TOKO" ? "DIPROSES" : "MENUNGGU_BAYAR",
      paymentMethod,
      items: cartItems,
    });

    if (!result.success) {
      alert(result.error || "Gagal membuat pesanan");
      return;
    }

    setCompletedOrder(result.order);
    setCart({});
    setIsCartOpen(false);
  };

  const handleOpenWhatsAppOrder = () => {
    if (!completedOrder) return;
    const itemListText = completedOrder.items
      .map((item: any) => `• ${item.quantity}x ${item.productName} (@${formatRupiah(item.unitPrice)})`)
      .join("\n");

    const message = `Halo ${store.name}! Saya mau konfirmasi pesanan:\n\n` +
      `*No Pesanan:* #${completedOrder.orderNumber}\n` +
      `*Nama:* ${completedOrder.customerName}\n` +
      `*No HP:* ${completedOrder.customerPhone}\n` +
      `*Alamat:* ${completedOrder.customerAddress}, ${completedOrder.destinationDistrict}, ${completedOrder.destinationCity}\n\n` +
      `*Rincian Barang:*\n${itemListText}\n\n` +
      `*Subtotal Barang:* ${formatRupiah(completedOrder.itemsTotal)}\n` +
      `*Ongkir (${completedOrder.courierName}):* ${formatRupiah(completedOrder.shippingCost)}\n` +
      `*TOTAL BAYAR:* *${formatRupiah(completedOrder.grandTotal)}*\n\n` +
      `Mohon info rekening pembayaran dan proses pengirimannya ya kak 🙏`;

    const cleanPhone = store.whatsappNumber.startsWith("0") 
      ? "62" + store.whatsappNumber.slice(1) 
      : store.whatsappNumber;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Memuat katalog toko...</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold">Toko Tidak Ditemukan</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Alamat toko <code>/toko/{slug}</code> tidak terdaftar atau belum aktif di KoZa Bisnis.
        </p>
        <Link
          href="/"
          className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={store.logoUrl}
              alt={store.name}
              className="h-9 w-9 rounded-full object-cover border border-emerald-500/30"
            />
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
                {store.name}
              </h1>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="h-3 w-3 text-emerald-400" />
                <span>Dikirim dari {store.originCity}</span>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-[11px] text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg px-2.5 py-1 transition-colors"
          >
            Masuk Dashboard Seller →
          </Link>
        </div>
      </header>

      {/* Hero Store Profile Box */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-6">
        <div className="mx-auto max-w-4xl space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {store.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Produk Original & Bergaransi
            </span>
            <span className="text-slate-400">
              Pengiriman via <strong>J&T, JNE, SiCepat</strong>
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative pt-2">
            <Search className="absolute left-3.5 top-5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari gamis, pashmina, hijab..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none shadow-inner"
            />
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <main className="mx-auto max-w-4xl w-full px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredProducts.map((product) => {
            const inCartQty = cart[product.id] || 0;

            return (
              <div
                key={product.id}
                className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
              >
                <div className="relative aspect-square w-full bg-slate-800 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-slate-300 border border-slate-700">
                    {product.weightGrams}g
                  </span>
                </div>

                <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <div className="text-sm sm:text-base font-extrabold text-emerald-400">
                      {formatRupiah(product.sellingPrice)}
                    </div>
                  </div>

                  {/* Add to Cart / Quantity Selector */}
                  <div className="pt-2">
                    {inCartQty === 0 ? (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-full py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Beli</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 p-1">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-bold text-xs text-white">
                          {inCartQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-500"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="mx-auto max-w-md">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white shadow-2xl shadow-emerald-500/30 hover:brightness-105 transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 font-bold text-sm">
                  {cartTotalItems}
                </div>
                <div className="text-left">
                  <div className="text-xs text-emerald-100">Keranjang Belanja</div>
                  <div className="text-sm font-extrabold">{formatRupiah(cartSubtotal)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold bg-slate-950/20 px-3 py-1.5 rounded-xl">
                <span>Lanjut Checkout</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Keranjang ({cartTotalItems} item)</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-800 overflow-y-auto flex-1 my-3 pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white">{item.productName}</div>
                    <div className="text-xs font-mono text-emerald-400">{formatRupiah(item.unitPrice)}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="h-6 w-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-bold text-xs text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="h-6 w-6 rounded-md bg-emerald-600 text-white flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Berat Paket:</span>
                <span className="font-semibold text-white">{totalWeightGrams} gram (~{weightKgRounded} kg)</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-white">Subtotal Barang:</span>
                <span className="text-emerald-400">{formatRupiah(cartSubtotal)}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                Lanjut ke Pengiriman & Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal (Address & Payment selection) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative my-8 space-y-4">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-400" />
                <span>Pengiriman & Pembayaran</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pilih tujuan pengiriman dan metode bayar (via WhatsApp atau QRIS).
              </p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              {/* Data Pembeli */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                  1. Informasi Penerima
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat Lengkap (Jalan, No Rumah, RT/RW, Patokan) *"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Kurir & Ongkir Otomatis */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                  2. Tujuan & Ekspedisi (Kalkulator Ongkir)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Kota / Kecamatan Tujuan</label>
                    <select
                      value={selectedDestination.district}
                      onChange={(e) => {
                        const d = destinationOptions.find((opt) => opt.district === e.target.value);
                        if (d) setSelectedDestination(d);
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      {destinationOptions.map((opt) => (
                        <option key={opt.district} value={opt.district}>
                          {opt.city} ({opt.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Pilihan Kurir</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="J&T Express">J&T Express (EZ 1-2 Hari)</option>
                      <option value="JNE">JNE (Reguler 1-2 Hari)</option>
                      <option value="SiCepat">SiCepat (REG 1-2 Hari)</option>
                      <option value="Anteraja">Anteraja (Regular)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between rounded-xl bg-slate-950/60 p-2.5 border border-slate-800 text-slate-300">
                  <span>Ongkir ke {selectedDestination.district} ({weightKgRounded} kg):</span>
                  <span className="font-bold text-white">{formatRupiah(shippingCost)}</span>
                </div>
              </div>

              {/* Metode Bayar */}
              <div className="space-y-2">
                <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                  3. Pilih Metode Pembayaran
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("WHATSAPP")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === "WHATSAPP"
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 mb-0.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Order via WhatsApp</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Kirim format pesanan otomatis ke chat seller
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS_TOKO")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      paymentMethod === "QRIS_TOKO"
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400 mb-0.5">
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Scan QRIS Toko</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Scan barcode via BCA/GoPay/DANA
                    </p>
                  </button>
                </div>
              </div>

              {/* Total Summary */}
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ongkos Kirim:</span>
                  <span>{formatRupiah(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                  <span>Total yang Harus Dibayar:</span>
                  <span className="text-emerald-400">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                Konfirmasi Pesanan Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal (Shows WhatsApp CTA or QRIS Barcode) */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center space-y-4 my-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Pesanan Berhasil Dibuat!</h3>
              <div className="font-mono text-xs text-emerald-400 font-semibold">
                No Pesanan: #{completedOrder.orderNumber}
              </div>
              <p className="text-xs text-slate-400">
                Total yang harus dibayar: <strong className="text-white">{formatRupiah(completedOrder.grandTotal)}</strong>
              </p>
            </div>

            {/* If QRIS TOKO chosen */}
            {completedOrder.paymentMethod === "QRIS_TOKO" ? (
              <div className="rounded-2xl bg-white p-4 space-y-2 text-slate-900 shadow-inner">
                <span className="text-[10px] font-bold block text-slate-700">
                  SCAN QRIS TOKO UNTUK BAYAR
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.qrisImageUrl}
                  alt="QRIS Toko"
                  className="mx-auto h-44 w-44 object-contain rounded-lg border border-slate-200"
                />
                <div className="text-[11px] text-slate-600 font-medium">
                  Atau Transfer Bank: <strong>{store.bankName} {store.bankAccountNumber}</strong>
                </div>
                <div className="text-[10px] text-slate-500">
                  a/n {store.bankAccountName}
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleOpenWhatsAppOrder}
                className="w-full py-3 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Kirim Bukti / Chat WhatsApp Penjual</span>
              </button>

              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Kembali ke Toko
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
