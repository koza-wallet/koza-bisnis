"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, generateOrderNumber } from "@/lib/utils";
import { destinationOptions, MASTER_COURIERS } from "@/lib/mock-data";
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
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [isWhiteLabel, setIsWhiteLabel] = useState(false);

  // Fetch Store & Products from Supabase (P0 & P1 Security Fix)
  useEffect(() => {
    async function loadStoreBySlug() {
      setIsLoading(true);
      try {
        const { data: storeRow, error: storeErr } = await supabase
          .from("public_stores")
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
            quotaBalance: 0,
            customDomain: storeRow.custom_domain,
            bankName: storeRow.bank_name,
            bankAccountNumber: storeRow.bank_account_number,
            bankAccountName: storeRow.bank_account_name,
            qrisImageUrl: storeRow.qris_image_url,
            enabledCouriers: Array.isArray(storeRow.enabled_couriers) && storeRow.enabled_couriers.length > 0
              ? storeRow.enabled_couriers
              : ["JNT", "JNE", "SICEPAT"],
            createdAt: storeRow.created_at,
          });
          setIsWhiteLabel(Boolean(storeRow.is_white_label));

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
                minOrderQuantity: p.min_order_quantity ? Number(p.min_order_quantity) : 1,
                wholesaleTiers: Array.isArray(p.wholesale_tiers) ? p.wholesale_tiers : [],
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

  // Dynamic Couriers supported by this Store
  const storeCouriersCodes = store.enabledCouriers && store.enabledCouriers.length > 0
    ? store.enabledCouriers
    : ["JNT", "JNE", "SICEPAT"];

  const activeCouriers = MASTER_COURIERS.filter((c) => storeCouriersCodes.includes(c.code));
  const effectiveCourierList = activeCouriers.length > 0 ? activeCouriers : MASTER_COURIERS.slice(0, 3);

  // Sync courierName if store disabled current courier
  useEffect(() => {
    if (effectiveCourierList.length > 0 && !effectiveCourierList.some((c) => c.name === courierName)) {
      setCourierName(effectiveCourierList[0].name);
    }
  }, [effectiveCourierList, courierName]);

  // Success & Loading State
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [copiedRekening, setCopiedRekening] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status White-label Toko (Pro AI / Annual / Monthly bebas watermark) — dihitung server-side
  // via kolom boolean is_white_label pada view public_stores, bukan dari string plan mentah
  // (plan persis toko lain tidak perlu diketahui publik/kompetitor).
  const isStoreWhiteLabel = isWhiteLabel;

  // Filter Products
  const activeProducts = products.filter((p) => p.isActive);
  const categories = ["SEMUA", ...Array.from(new Set(activeProducts.map((p) => p.category)))];

  const filteredProducts = activeProducts.filter((p) => {
    const matchCat = selectedCategory === "SEMUA" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Helper hitung harga satuan dinamis berdasarkan kuantiti grosir
  const getProductUnitPrice = (prod: Product, qty: number): number => {
    if (!prod.wholesaleTiers || prod.wholesaleTiers.length === 0) {
      return prod.sellingPrice;
    }
    const sorted = [...prod.wholesaleTiers].sort((a, b) => {
      const minA = Number(a.minQty ?? (a as any).min_qty ?? 0);
      const minB = Number(b.minQty ?? (b as any).min_qty ?? 0);
      return minB - minA;
    });
    for (const tier of sorted) {
      const minQ = Number(tier.minQty ?? (tier as any).min_qty ?? 0);
      const price = Number(tier.unitPrice ?? (tier as any).unit_price ?? 0);
      if (minQ > 0 && qty >= minQ && price > 0) {
        return price;
      }
    }
    return prod.sellingPrice;
  };

  // Cart Calculations (P1 Audit: costPrice is zeroed out to prevent HPP exposure)
  const cartItems: OrderItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      if (!prod) return null as any;
      const unitPrice = getProductUnitPrice(prod, qty);
      return {
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unitPrice,
        unitCost: 0, // P1 Audit: zeroed out on client, HPP is strictly hidden
        weightGrams: prod.weightGrams,
        subtotal: unitPrice * qty,
      };
    })
    .filter(Boolean);

  const cartTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeightGrams = cartItems.reduce((sum, item) => sum + item.weightGrams * item.quantity, 0);
  const weightKgRounded = Math.max(1, Math.ceil(totalWeightGrams / 1000));
  
  // Kalkulasi Ongkir Cerdas: Diskon tarif kargo untuk muatan berat (> 5 kg)
  const isKargo = courierName.includes("Trucking") || courierName.includes("Cargo") || courierName.includes("Kargo");
  const shippingCost = isKargo
    ? Math.max(25000, Math.round(selectedDestination.baseRate * 1.5 + Math.max(0, weightKgRounded - 5) * 3000))
    : selectedDestination.baseRate * weightKgRounded;

  const grandTotal = cartSubtotal + shippingCost;
  const totalCostPrice = 0;
  const netProfit = 0;

  const addToCart = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    const moq = prod?.minOrderQuantity && prod.minOrderQuantity > 1 ? prod.minOrderQuantity : 1;
    setCart((prev) => {
      const current = prev[prodId] || 0;
      return {
        ...prev,
        [prodId]: current === 0 ? moq : current + 1,
      };
    });
  };

  const updateQuantity = (prodId: string, delta: number) => {
    const prod = products.find((p) => p.id === prodId);
    const moq = prod?.minOrderQuantity && prod.minOrderQuantity > 1 ? prod.minOrderQuantity : 1;
    setCart((prev) => {
      const current = prev[prodId] || 0;
      const next = current + delta;
      if (next < moq) {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      }
      return { ...prev, [prodId]: next };
    });
  };

  const handleCopyOrderNumber = () => {
    if (!completedOrder?.orderNumber) return;
    navigator.clipboard.writeText(completedOrder.orderNumber);
    setCopiedOrderNumber(true);
    setTimeout(() => setCopiedOrderNumber(false), 2000);
  };

  const handleCopyRekening = () => {
    if (!store.bankAccountNumber) return;
    navigator.clipboard.writeText(store.bankAccountNumber);
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Mohon lengkapi Nama, No WhatsApp, dan Alamat Pengiriman Anda.");
      return;
    }

    if (isSubmitting) return; // Prevent double click (click-path-audit)
    setIsSubmitting(true);

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
        const suffix = resData.errorRef ? ` (Kode Referensi: ${resData.errorRef})` : "";
        alert((resData.error || "Gagal membuat pesanan. Silakan coba lagi.") + suffix);
        setIsSubmitting(false);
        return;
      }

      if (resData.success && resData.order) {
        setCompletedOrder(resData.order);
        setCart({});
        setIsCartOpen(false);
        setIsCheckoutModalOpen(false);
        setIsSubmitting(false);
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

    setIsSubmitting(false);

    if (!result.success) {
      alert(result.error || "Gagal membuat pesanan");
      return;
    }

    setCompletedOrder(result.order);
    setCart({});
    setIsCartOpen(false);
    setIsCheckoutModalOpen(false);
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
      `Mohon info rekening pembayaran dan proses pengirimannya ya kak, terima kasih.`;

    const cleanPhone = store.whatsappNumber.startsWith("0") 
      ? "62" + store.whatsappNumber.slice(1) 
      : store.whatsappNumber;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-white animate-pulse">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-20 rounded bg-slate-200/70 dark:bg-slate-800/70" />
            </div>
          </div>
          <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-4 max-w-5xl mx-auto">
          <div className="h-3 w-2/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-11 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          <div className="flex gap-2">
            {[16, 20, 16, 20, 16].map((w, i) => (
              <div key={i} className="h-7 rounded-full bg-slate-200 dark:bg-slate-800" style={{ width: `${w * 4}px` }} />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-square rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
                <div className="h-3.5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3.5 w-1/3 rounded bg-slate-200/70 dark:bg-slate-800/70" />
                <div className="h-8 w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[11px] text-slate-500">
          <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
          <span>Memuat katalog toko...</span>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex flex-col items-center justify-center p-6 text-center text-slate-900 dark:text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold">Toko Tidak Ditemukan</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Alamat toko <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">/toko/{slug}</code> tidak terdaftar atau belum aktif di KoZa Bisnis.
        </p>
        <Link
          href="/"
          className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col pb-28 selection:bg-emerald-500 selection:text-slate-950 transition-colors">
      {/* 1. Header Profil Toko Minimalis & Editorial */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="relative h-10 w-10 rounded-2xl overflow-hidden border border-emerald-500/30 ring-2 ring-emerald-500/10 shrink-0 shadow-sm">
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {store.name}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Resmi</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin className="h-3 w-3 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Dikirim dari {store.originCity}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 rounded-xl px-3 py-1.5 transition-all shadow-sm flex items-center gap-1"
            >
              <span>Dashboard</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Store Profile Box & Search Bar */}
      <div className="bg-gradient-to-b from-slate-100/70 via-slate-50 to-slate-50 dark:from-slate-900/40 dark:via-[#0B0F17]/40 dark:to-[#0B0F17] border-b border-slate-200 dark:border-slate-800/60 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {store.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs pt-0.5">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Original & Bergaransi
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[11px] shadow-sm">
              <Truck className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
              <span>Ekspedisi Resmi <strong>J&T, JNE, SiCepat, Kargo</strong></span>
            </span>
          </div>

          {/* Search Bar Berpresisi Tinggi */}
          <div className="relative pt-2">
            <Search className="absolute left-3.5 top-5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari produk di toko ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                    : "bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Product Catalog Grid */}
      <main className="mx-auto max-w-4xl w-full px-4 py-8">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Katalog Produk ({filteredProducts.length})
          </h2>
          {selectedCategory !== "SEMUA" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("SEMUA")}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Lihat Semua Kategori
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-12 text-center space-y-3 shadow-sm">
            <ShoppingBag className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-900 dark:text-white">Tidak ada produk yang cocok</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Coba kata kunci pencarian lain atau ubah filter kategori di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredProducts.map((product) => {
              const inCartQty = cart[product.id] || 0;

              return (
                <div
                  key={product.id}
                  className="group rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-xl dark:hover:shadow-emerald-950/20 transition-all duration-300 shadow-sm"
                >
                  {/* Image Container with Hover Zoom */}
                  <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono shadow-sm">
                      {product.weightGrams}g
                    </span>
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-rose-500/15 dark:bg-rose-500/20 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:text-rose-300 border border-rose-500/30">
                        Sisa {product.stock}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-3.5 sm:p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatRupiah(product.sellingPrice)}
                      </div>

                      {/* Badge Grosir & MOQ */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {product.minOrderQuantity && product.minOrderQuantity > 1 && (
                          <span className="rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold">
                            Min. {product.minOrderQuantity} pcs
                          </span>
                        )}
                        {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                          <span className="rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold">
                            Grosir s/d {formatRupiah(product.wholesaleTiers[product.wholesaleTiers.length - 1].unitPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart / Quantity Selector Taktil */}
                    <div className="pt-1">
                      {inCartQty === 0 ? (
                        <button
                          type="button"
                          onClick={() => addToCart(product.id)}
                          className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-600/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>
                            {product.minOrderQuantity && product.minOrderQuantity > 1
                              ? `Beli (Min. ${product.minOrderQuantity})`
                              : "Beli"}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white active:scale-95 transition-all shadow-sm"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">
                            {inCartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
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
        )}
      </main>

      {/* 4. Footer / Watermark Viral Loop untuk Toko Basic & Non-Pro */}
      {!isStoreWhiteLabel && (
        <footer className="mt-12 pb-24 text-center px-4">
          <Link
            href={`/register?ref=${encodeURIComponent(store.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all shadow-sm group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/koza-icon.png" alt="KoZa" className="h-3.5 w-3.5 object-contain" />
            <span>Dibuat dengan</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-white">KoZa Bisnis</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Buka Toko 0% Komisi →</span>
          </Link>
        </footer>
      )}

      {/* 5. Floating Bottom Cart Dock (Obsidian Glassmorphism) */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="mx-auto max-w-md pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-emerald-500/30 dark:border-emerald-500/40 backdrop-blur-xl p-3.5 sm:p-4 text-slate-900 dark:text-white shadow-2xl shadow-slate-300/60 dark:shadow-emerald-950/60 hover:border-emerald-500 active:scale-98 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md">
                  {cartTotalItems}
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Keranjang Belanja</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">{formatRupiah(cartSubtotal)}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black bg-emerald-500 text-slate-950 px-3.5 py-2 rounded-xl shadow-md group-hover:bg-emerald-400 transition-colors">
                <span>Checkout</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 6. Cart Drawer Modal (Obsidian Sheet) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-xl p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Keranjang Belanja ({cartTotalItems} item)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto flex-1 my-3 pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.productName}</div>
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{formatRupiah(item.unitPrice)}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:text-slate-900 dark:hover:text-white active:scale-95 shadow-sm"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-bold text-xs text-slate-900 dark:text-white w-5 text-center font-mono">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 active:scale-95 shadow-sm"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Total Berat Paket:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">{totalWeightGrams} gram (~{weightKgRounded} kg)</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Subtotal Barang:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-black">{formatRupiah(cartSubtotal)}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black hover:bg-emerald-500 dark:hover:bg-emerald-400 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Pengiriman & Pembayaran</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Checkout Modal (Obsidian Form) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 backdrop-blur-xl p-6 sm:p-7 shadow-2xl relative my-8 space-y-5">
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Truck className="h-3.5 w-3.5" />
                <span>Checkout Mandiri 0% Komisi</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Pengiriman & Pembayaran</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lengkapi alamat pengiriman untuk kalkulasi ongkir kurir otomatis.
              </p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5 text-xs">
              {/* Step 1: Data Penerima */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                  <span>1. Informasi Penerima</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Nomor WhatsApp (Aktif) *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat Lengkap (Nama Jalan, No Rumah, RT/RW, Patokan) *"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              {/* Step 2: Kurir & Ongkir Otomatis */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                  <span>2. Tujuan & Ekspedisi (Kalkulator Ongkir)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Kecamatan Tujuan</label>
                    <select
                      value={selectedDestination.district}
                      onChange={(e) => {
                        const d = destinationOptions.find((opt) => opt.district === e.target.value);
                        if (d) setSelectedDestination(d);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    >
                      {destinationOptions.map((opt) => (
                        <option key={opt.district} value={opt.district}>
                          {opt.city} ({opt.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Pilihan Ekspedisi</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none font-semibold"
                    >
                      {effectiveCourierList.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.name} ({c.service})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Ongkir ke <strong>{selectedDestination.district}</strong> ({weightKgRounded} kg):
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatRupiah(shippingCost)}</span>
                </div>
              </div>

              {/* Step 3: Metode Bayar */}
              <div className="space-y-2.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                  <span>3. Pilih Metode Pembayaran</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("WHATSAPP")}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      paymentMethod === "WHATSAPP"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-slate-900 dark:text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Order via WhatsApp</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Format order otomatis dikirimkan ke chat WhatsApp penjual.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS_TOKO")}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      paymentMethod === "QRIS_TOKO"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-slate-900 dark:text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-purple-600 dark:text-purple-400 mb-1">
                      <QrCode className="h-4 w-4" />
                      <span>Scan QRIS Toko Langsung</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Scan barcode QRIS via BCA, GoPay, OVO, DANA, dll.
                    </p>
                  </button>
                </div>
              </div>

              {/* Total Summary Breakdown */}
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Barang:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatRupiah(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Ongkos Kirim ({courierName}):</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatRupiah(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Bayar:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base font-black">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black hover:bg-emerald-500 dark:hover:bg-emerald-400 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <span>Konfirmasi & Selesaikan Pesanan</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Order Success Modal (Shows WhatsApp CTA, QRIS, & Live Tracking Link) */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl text-center space-y-4 my-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Pesanan Berhasil Dibuat!</h3>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 px-3 py-1 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  #{completedOrder.orderNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Salin nomor pesanan"
                >
                  {copiedOrderNumber ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Total yang harus dibayar: <strong className="text-slate-900 dark:text-white font-mono">{formatRupiah(completedOrder.grandTotal)}</strong>
              </p>
            </div>

            {/* QRIS Toko Card */}
            {completedOrder.paymentMethod === "QRIS_TOKO" && (
              <div className="rounded-2xl bg-slate-50 dark:bg-white p-4 space-y-2 text-slate-900 border border-slate-200 shadow-inner">
                <span className="text-[10px] font-black block text-slate-700 uppercase tracking-wider">
                  Scan QRIS Toko untuk Bayar
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={store.qrisImageUrl}
                  alt="QRIS Toko"
                  className="mx-auto h-44 w-44 object-contain rounded-xl border border-slate-200 bg-white"
                />
                <div className="text-[11px] text-slate-700 font-medium">
                  Atau Transfer Bank: <strong>{store.bankName} {store.bankAccountNumber}</strong>
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                  <span>a/n {store.bankAccountName}</span>
                  <button
                    type="button"
                    onClick={handleCopyRekening}
                    className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    {copiedRekening ? <span>Tersalin!</span> : <span>Salin Rekening</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleOpenWhatsAppOrder}
                className="w-full py-3.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-black hover:bg-emerald-500 dark:hover:bg-emerald-400 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Kirim Bukti / Chat WhatsApp Penjual</span>
              </button>

              <Link
                href={`/lacak/${completedOrder.orderNumber}`}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors block"
              >
                <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lacak Status Pesanan Saya (/lacak)</span>
              </Link>

              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Kembali Belanja di Toko
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
