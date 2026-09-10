"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { destinationOptions } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { LandingPage } from "@/types";
import { PixelTracker, trackPixelInitiateCheckout, trackPixelPurchase } from "@/components/pixel-tracker";
import { BlockRenderer } from "@/components/builder/block-renderer";
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Award, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  QrCode, 
  ArrowRight,
  Flame,
  Check,
  Store as StoreIcon,
  Loader2
} from "lucide-react";

export default function PublicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { getLandingPageBySlug, recordLandingPageView, createOrder, store: localStore } = useStore();
  const supabase = createClient();

  const [lp, setLp] = useState<LandingPage | null>(null);
  const [store, setStore] = useState<any>(localStore);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Landing Page from Supabase (P0 Multi-Tenant)
  useEffect(() => {
    async function loadLandingPage() {
      setIsLoading(true);
      try {
        const { data: lpRow, error: lpErr } = await supabase
          .from("landing_pages")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (lpRow && !lpErr) {
          setLp({
            id: lpRow.id,
            storeId: lpRow.store_id,
            productId: lpRow.product_id,
            slug: lpRow.slug,
            title: lpRow.title,
            theme: lpRow.theme,
            tone: lpRow.tone,
            builderMode: lpRow.builder_mode,
            hero: lpRow.hero,
            problemSection: lpRow.problem_section,
            solutionSection: lpRow.solution_section,
            features: lpRow.features,
            testimonials: lpRow.testimonials,
            pricing: lpRow.pricing,
            faq: lpRow.faqs || lpRow.faq || { title: "FAQ", items: [] },
            blocks: lpRow.blocks,
            design: lpRow.design,
            seo: lpRow.seo,
            pixels: lpRow.pixels,
            guarantee: lpRow.guarantee || { title: "Garansi 100% Original", description: "Jaminan kepuasan pelanggan" },
            analytics: lpRow.analytics || { viewsCount: 0, ordersCount: 0, conversionRate: 0 },
            isPublished: lpRow.is_active ?? true,
            createdAt: lpRow.created_at || new Date().toISOString(),
          });

          // Ambil data toko publik dari view public_stores (Patch #10)
          const { data: storeRow } = await supabase
            .from("public_stores")
            .select("id, name, whatsapp_number, origin_city, origin_district, qris_image_url, bank_name, bank_account_number, bank_account_name, enabled_couriers")
            .eq("id", lpRow.store_id)
            .maybeSingle();

          if (storeRow) {
            setStore({
              id: storeRow.id,
              name: storeRow.name,
              whatsappNumber: storeRow.whatsapp_number,
              originCity: storeRow.origin_city,
              originDistrict: storeRow.origin_district,
              qrisImageUrl: storeRow.qris_image_url,
              bankName: storeRow.bank_name,
              bankAccountNumber: storeRow.bank_account_number,
              bankAccountName: storeRow.bank_account_name,
              enabledCouriers: Array.isArray(storeRow.enabled_couriers) && storeRow.enabled_couriers.length > 0
                ? storeRow.enabled_couriers
                : ["JNT", "JNE", "SICEPAT"],
            });
          }

          // Ambil metadata produk (MOQ & tier grosir) jika terhubung ke produk katalog
          if (lpRow.product_id) {
            const { data: prodRow } = await supabase
              .from("public_products")
              .select("id, min_order_quantity, wholesale_tiers")
              .eq("id", lpRow.product_id)
              .maybeSingle();

            if (prodRow) {
              const moq = prodRow.min_order_quantity ? Number(prodRow.min_order_quantity) : 1;
              setProductMeta({
                minOrderQuantity: moq,
                wholesaleTiers: Array.isArray(prodRow.wholesale_tiers) ? prodRow.wholesale_tiers : [],
              });
              if (moq > 1) {
                setQuantity(moq);
              }
            }
          }
        } else {
          const fallbackLp = getLandingPageBySlug(slug);
          if (fallbackLp) setLp(fallbackLp);
        }
      } catch (err) {
        console.warn("Supabase LP load failed, using local context:", err);
        const fallbackLp = getLandingPageBySlug(slug);
        if (fallbackLp) setLp(fallbackLp);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadLandingPage();
    }
  }, [slug]);

  // Product B2B Wholesale Meta
  const [productMeta, setProductMeta] = useState<{
    minOrderQuantity: number;
    wholesaleTiers: Array<{ minQty: number; unitPrice: number }>;
  } | null>(null);

  // Countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 48, seconds: 15 });

  // Order form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(destinationOptions[0]);
  const [selectedCourier, setSelectedCourier] = useState<string>("SICEPAT");
  const [paymentMethod, setPaymentMethod] = useState<"WHATSAPP" | "QRIS_TOKO">("WHATSAPP");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // FAQ open states
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Record page view once
  useEffect(() => {
    if (slug) {
      recordLandingPageView(slug);
    }
  }, [slug]);

  // Countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Memuat landing page...</p>
      </div>
    );
  }

  if (!lp) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          Landing page dengan alamat <code>/lp/{slug}</code> belum dibuat atau sudah dinonaktifkan oleh pemilik toko.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Calculate pricing & B2B Wholesale Tiered Rates
  const getDynamicItemPrice = () => {
    let price = lp.pricing.promoPrice;
    if (productMeta?.wholesaleTiers && productMeta.wholesaleTiers.length > 0) {
      const sorted = [...productMeta.wholesaleTiers].sort((a, b) => {
        const minA = Number(a.minQty ?? (a as any).min_qty ?? 0);
        const minB = Number(b.minQty ?? (b as any).min_qty ?? 0);
        return minB - minA;
      });
      for (const tier of sorted) {
        const minQ = Number(tier.minQty ?? (tier as any).min_qty ?? 0);
        const tierPrice = Number(tier.unitPrice ?? (tier as any).unit_price ?? 0);
        if (minQ > 0 && quantity >= minQ && tierPrice > 0) {
          price = tierPrice;
          break;
        }
      }
    }
    return price;
  };

  const itemPrice = getDynamicItemPrice();
  const itemsTotal = itemPrice * quantity;
  const isKargoSelected = selectedCourier === "JTR" || selectedCourier === "JNTCARGO";
  const shippingCost = isKargoSelected
    ? Math.max(25000, Math.round(selectedDestination.baseRate * 1.5))
    : selectedDestination.baseRate;
  const grandTotal = itemsTotal + shippingCost;

  // All Available Courier Rates
  const allMasterCouriers = [
    { id: "SICEPAT", name: "SiCepat REG", rate: selectedDestination.baseRate, desc: "Estimasi 1-3 hari", tag: "Rekomendasi" },
    { id: "JNT", name: "J&T Express", rate: selectedDestination.baseRate + 2000, desc: "Estimasi 1-3 hari" },
    { id: "JNE", name: "JNE Reguler", rate: selectedDestination.baseRate + 1000, desc: "Estimasi 2-4 hari" },
    { id: "ANTERAJA", name: "Anteraja", rate: selectedDestination.baseRate, desc: "Estimasi 1-3 hari" },
    { id: "JTR", name: "JTR (JNE Trucking) Kargo", rate: Math.max(25000, Math.round(selectedDestination.baseRate * 1.5)), desc: "Kargo Barang Berat (3-5 hari)", tag: "Kargo Hemat" },
    { id: "JNTCARGO", name: "J&T Cargo", rate: Math.max(28000, Math.round(selectedDestination.baseRate * 1.8)), desc: "Kargo Paket Besar (2-4 hari)", tag: "Kargo" },
    { id: "INDAH", name: "Indah Logistik Cargo", rate: Math.max(26000, Math.round(selectedDestination.baseRate * 1.6)), desc: "Kargo Partai Besar (3-6 hari)", tag: "Kargo" },
  ];

  const allowedStoreCouriers = store.enabledCouriers && store.enabledCouriers.length > 0
    ? store.enabledCouriers
    : ["JNT", "JNE", "SICEPAT"];

  const filteredCouriers = allMasterCouriers.filter((c) => allowedStoreCouriers.includes(c.id));
  const couriers = filteredCouriers.length > 0 ? filteredCouriers : allMasterCouriers.slice(0, 3);

  // Auto-sync selectedCourier jika kurir yang aktif di toko berubah
  useEffect(() => {
    if (couriers.length > 0 && !couriers.some((c) => c.id === selectedCourier)) {
      setSelectedCourier(couriers[0].id);
    }
  }, [couriers, selectedCourier]);

  // Theme configuration
  const getThemeClasses = () => {
    switch (lp.theme) {
      case "MIDNIGHT":
        return {
          wrapper: "bg-slate-950 text-slate-100",
          card: "bg-slate-900/90 border-slate-800",
          accentText: "text-amber-400",
          accentBg: "bg-amber-500",
          primaryButton: "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-amber-500/20",
          pill: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        };
      case "ROSE":
        return {
          wrapper: "bg-[#fffafb] text-slate-800",
          card: "bg-white border-pink-100 shadow-sm",
          accentText: "text-pink-600",
          accentBg: "bg-pink-500",
          primaryButton: "bg-gradient-to-r from-pink-500 to-rose-400 text-white font-black shadow-pink-500/20",
          pill: "bg-pink-50 text-pink-600 border-pink-200",
        };
      case "ELECTRIC":
        return {
          wrapper: "bg-slate-950 text-slate-100",
          card: "bg-slate-900/90 border-slate-800",
          accentText: "text-red-400",
          accentBg: "bg-red-500",
          primaryButton: "bg-gradient-to-r from-red-600 to-orange-500 text-white font-black shadow-red-500/20",
          pill: "bg-red-500/10 text-red-300 border-red-500/30",
        };
      default:
        return {
          wrapper: "bg-slate-950 text-slate-100",
          card: "bg-slate-900/90 border-slate-800",
          accentText: "text-emerald-400",
          accentBg: "bg-emerald-500",
          primaryButton: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-emerald-500/20",
          pill: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        };
    }
  };

  const theme = getThemeClasses();


  const handleInitiateCheckout = () => {
    trackPixelInitiateCheckout({
      title: lp?.title || "",
      value: itemsTotal,
      quantity,
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Silakan lengkapi nama, nomor WhatsApp, dan alamat pengiriman!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Patch #11: Panggil endpoint server-side /api/orders/create sebagai single source of truth
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: lp.storeId,
          customerName,
          customerPhone,
          customerAddress,
          destinationCity: selectedDestination.city,
          destinationDistrict: selectedDestination.district,
          courierName: selectedCourier,
          courierService: "Reguler",
          shippingCost,
          items: [
            {
              productId: lp.productId || "prod-lp",
              productName: lp.title,
              quantity,
              unitPrice: itemPrice,
              subtotal: itemsTotal,
            },
          ],
          paymentMethod,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        alert(resData.error || "Gagal membuat pesanan. Silakan coba lagi.");
        setIsSubmitting(false);
        return;
      }

      const completedOrder = resData.order;
      setOrderSuccess(completedOrder);
      setIsSubmitting(false);

      // Track conversion event for Meta & TikTok Pixel
      trackPixelPurchase({
        title: lp.title,
        value: grandTotal,
        quantity,
        orderNumber: completedOrder.orderNumber,
      });

      // If WhatsApp checkout, open WhatsApp directly
      if (paymentMethod === "WHATSAPP") {
        const text = encodeURIComponent(
          `Halo Kak Admin ${store.name}! Saya mau konfirmasi pesanan dari website:\n\n` +
          `📦 *No. Order*: ${completedOrder.orderNumber}\n` +
          `🏷️ *Produk*: ${lp.title} (x${quantity})\n` +
          `💰 *Total Bayar*: Rp ${grandTotal.toLocaleString("id-ID")}\n\n` +
          `👤 *Nama*: ${customerName}\n` +
          `📞 *WA*: ${customerPhone}\n` +
          `📍 *Alamat*: ${customerAddress}, ${selectedDestination.district}, ${selectedDestination.city}\n` +
          `🚚 *Ekspedisi*: ${selectedCourier}\n\n` +
          `Mohon segera diproses ya kak, terima kasih!`
        );
        const waUrl = `https://wa.me/${store.whatsappNumber}?text=${text}`;
        window.open(waUrl, "_blank");
      }
    } catch (err: any) {
      console.error("Order submit failed:", err);
      alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PixelTracker metaPixelId={lp.pixels?.metaPixelId} tiktokPixelId={lp.pixels?.tiktokPixelId} />
      
      {lp.builderMode === "MANUAL_BERDU" || lp.builderMode === "MANUAL" || (lp.blocks && lp.blocks.length > 0) ? (
        <div
          className="min-h-screen selection:bg-emerald-500 selection:text-white pb-16"
          style={{
            backgroundColor: lp.design?.backgroundColor || "#020617",
            color: lp.design?.textColor || "#f8fafc",
            fontFamily: lp.design?.fontFamily || "Outfit",
          }}
        >
          {lp.blocks?.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              design={lp.design}
              isPreview={false}
              storeName={store.name}
              storePhone={store.whatsappNumber}
              onCheckoutSubmit={async (orderData) => {
                try {
                  const res = await fetch("/api/orders/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      storeId: lp.storeId,
                      customerName: orderData.customerName,
                      customerPhone: orderData.customerPhone,
                      customerAddress: orderData.customerAddress,
                      destinationCity: orderData.destination,
                      destinationDistrict: "",
                      courierName: orderData.courier,
                      courierService: "Reguler",
                      shippingCost: orderData.shippingCost,
                      items: [
                        {
                          productId: lp.productId || "prod-lp",
                          productName: lp.title,
                          quantity: orderData.quantity || 1,
                          unitPrice: orderData.promoPrice || 149000,
                          subtotal: orderData.itemsTotal,
                        },
                      ],
                      paymentMethod: orderData.paymentMethod,
                    }),
                  });

                  const resData = await res.json();
                  if (res.ok && resData.order) {
                    trackPixelPurchase({
                      title: lp.title,
                      value: orderData.grandTotal,
                      quantity: orderData.quantity || 1,
                      orderNumber: resData.order.orderNumber,
                    });
                  }
                } catch (e) {
                  console.warn("Server modular order creation error:", e);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className={`min-h-screen ${theme.wrapper} font-sans selection:bg-emerald-500 selection:text-white pb-24 md:pb-12`}>
        {/* Top Banner Urgency */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 py-2 text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 animate-bounce text-amber-300" />
            <span>{lp.hero.badge}</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] bg-black/30 px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3 text-amber-300" />
            <span>Berakhir Dalam: </span>
            <span className="text-amber-300">
              {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${theme.pill}`}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>Garansi 100% Original & Terpercaya</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
            {lp.hero.headline}
          </h1>

          <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
            {lp.hero.subheadline}
          </p>

          {/* Hero Image */}
          {lp.hero.heroImageUrl && (
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mt-4 aspect-video max-h-[420px] mx-auto">
              <img
                src={lp.hero.heroImageUrl}
                alt={lp.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 rounded-xl bg-red-600/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-white shadow-lg">
                DISKON {lp.pricing.discountPercent}%
              </div>
            </div>
          )}

          {/* Pricing Box CTA */}
          <div className={`rounded-2xl border p-5 mt-6 ${theme.card}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-xs opacity-60">Harga Spesial Hari Ini:</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-3xl font-black tracking-tight ${theme.accentText}`}>
                    Rp {lp.pricing.promoPrice.toLocaleString("id-ID")}
                  </span>
                  <span className="text-sm line-through opacity-50">
                    Rp {lp.pricing.normalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-rose-400 font-bold mt-1">
                  {lp.pricing.scarcityText}
                </p>
              </div>

              <a
                href="#order-form"
                onClick={handleInitiateCheckout}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm shadow-xl active:scale-95 transition-all ${theme.primaryButton}`}
              >
                <span>{lp.hero.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Problem Agitation Section */}
        <section className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
          <div className="text-center max-w-lg mx-auto mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Masalah Umum
            </span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              {lp.problemSection.title}
            </h2>
            <p className="text-xs opacity-70 mt-1">
              {lp.problemSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {lp.problemSection.painPoints.map((pt, i) => (
              <div
                key={i}
                className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 font-bold text-xs">
                  0{i + 1}
                </div>
                <h3 className="font-bold text-sm text-slate-100">{pt.title}</h3>
                <p className="text-xs opacity-75 leading-relaxed">{pt.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Solution & Transformation */}
        <section className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 space-y-4">
              <span className={`text-xs font-bold uppercase tracking-wider ${theme.accentText}`}>
                Solusi Terbaik
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
                {lp.solutionSection.title}
              </h2>
              <p className="text-sm opacity-80 leading-relaxed">
                {lp.solutionSection.description}
              </p>

              <div className="space-y-2 pt-2">
                {lp.solutionSection.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-medium">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${theme.accentText}`} />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold">
              Keunggulan Eksklusif
            </h2>
            <p className="text-xs opacity-70 mt-1">
              Kenapa ribuan pelanggan lebih memilih produk kami:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lp.features.map((feat, i) => (
              <div key={i} className={`flex items-start gap-4 rounded-2xl border p-5 ${theme.card}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.pill} shrink-0`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{feat.title}</h3>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className={`rounded-3xl border p-6 sm:p-8 ${theme.card}`}>
          <div className="text-center mb-6">
            <div className="flex justify-center text-amber-400 gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Kata Mereka yang Sudah Mencoba
            </h2>
            <p className="text-xs opacity-70 mt-1">
              Ulasan asli dari pembeli terverifikasi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {lp.testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <p className="font-bold text-xs">{t.name}</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Check className="h-3 w-3" />
                      Terverifikasi
                    </p>
                  </div>
                </div>
                <p className="text-xs opacity-80 italic leading-relaxed">
                  "{t.review}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Guarantee Box */}
        <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-2">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {lp.guarantee.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {lp.guarantee.description}
          </p>
        </section>

        {/* Order Form (Instant Checkout) */}
        <section id="order-form" className={`rounded-3xl border p-6 sm:p-8 scroll-mt-20 ${theme.card}`}>
          {orderSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-white">Pesanan Berhasil Dibuat!</h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Terima kasih, <strong>{customerName}</strong>! Nomor pesanan Anda adalah:
              </p>
              <div className="inline-block rounded-xl bg-slate-800 px-4 py-2 font-mono text-base font-bold text-emerald-400 border border-slate-700">
                {orderSuccess.orderNumber}
              </div>

              {paymentMethod === "QRIS_TOKO" && (
                <div className="mt-6 p-6 rounded-2xl bg-slate-800 border border-slate-700 max-w-sm mx-auto space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Scan QRIS untuk Bayar
                  </p>
                  <img
                    src={store.qrisImageUrl}
                    alt="QRIS Toko"
                    className="mx-auto h-48 w-48 rounded-xl bg-white p-2 shadow-md"
                  />
                  <p className="text-xs text-slate-400">
                    Nominal Transfer Tepat: <strong className="text-white">Rp {grandTotal.toLocaleString("id-ID")}</strong>
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => setOrderSuccess(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Buat Pesanan Lainnya
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="text-center">
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${theme.pill}`}>
                  Formulir Cepat
                </span>
                <h2 className="text-2xl font-black mt-2">
                  Lengkapi Data Pengiriman Anda
                </h2>
                <p className="text-xs opacity-70 mt-1">
                  Pesanan langsung dipacking & dikirim dengan resi resmi.
                </p>
              </div>

              {/* Quantity selector */}
              <div className="space-y-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold">{lp.title}</p>
                      {productMeta?.minOrderQuantity && productMeta.minOrderQuantity > 1 && (
                        <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold">
                          Min. {productMeta.minOrderQuantity} pcs
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-black ${theme.accentText} mt-0.5`}>
                      Rp {itemPrice.toLocaleString("id-ID")} / pcs
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(productMeta?.minOrderQuantity || 1, quantity - 1))}
                      className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 font-bold text-slate-300 hover:text-white flex items-center justify-center disabled:opacity-40"
                      disabled={quantity <= (productMeta?.minOrderQuantity || 1)}
                    >
                      -
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 font-bold text-slate-300 hover:text-white flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Wholesale pricing table banner */}
                {productMeta?.wholesaleTiers && productMeta.wholesaleTiers.length > 0 && (
                  <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                      <span>⚡ Diskon Pembelian Grosir / Partai Besar:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                      {productMeta.wholesaleTiers.map((t, idx) => {
                        const minQ = Number(t.minQty ?? (t as any).min_qty ?? 0);
                        const uPrice = Number(t.unitPrice ?? (t as any).unit_price ?? 0);
                        const isActive = quantity >= minQ;
                        return (
                          <div
                            key={idx}
                            className={`px-2 py-1.5 rounded-lg border transition-all ${
                              isActive
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold"
                                : "bg-slate-900/60 border-slate-800 text-slate-400"
                            }`}
                          >
                            <span>≥ {minQ} pcs:</span>{" "}
                            <span className="text-white font-semibold">Rp {uPrice.toLocaleString("id-ID")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-80">
                    Nama Penerima <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 opacity-80">
                    Nomor WhatsApp <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-80">
                  Alamat Lengkap (Jalan, No Rumah, RT/RW, Kelurahan) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Jl. Mawar No. 12, RT 02/05, Kel. Kebayoran Baru..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* City Destination */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-80">
                  Kota / Kabupaten Tujuan Pengiriman
                </label>
                <select
                  value={selectedDestination.city}
                  onChange={(e) => {
                    const found = destinationOptions.find((d) => d.city === e.target.value);
                    if (found) setSelectedDestination(found);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {destinationOptions.map((d) => (
                    <option key={d.city} value={d.city}>
                      {d.city} ({d.district}) — Ongkir Rp {d.baseRate.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Courier Selection */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-80">
                  Pilihan Ekspedisi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {couriers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCourier(c.id as any)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        selectedCourier === c.id
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-800 bg-slate-800/40 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{c.name}</span>
                        {c.tag && (
                          <span className="rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-300 font-bold">
                            Top
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                        Rp {c.rate.toLocaleString("id-ID")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 opacity-80">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("WHATSAPP")}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      paymentMethod === "WHATSAPP"
                        ? "border-emerald-500 bg-emerald-500/15 text-white"
                        : "border-slate-800 bg-slate-800/40 text-slate-400"
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">WhatsApp Checkout</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Konfirmasi langsung ke CS toko</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QRIS_TOKO")}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      paymentMethod === "QRIS_TOKO"
                        ? "border-emerald-500 bg-emerald-500/15 text-white"
                        : "border-slate-800 bg-slate-800/40 text-slate-400"
                    }`}
                  >
                    <QrCode className="h-5 w-5 text-blue-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">QRIS Toko Instan</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">BCA, GoPay, OVO, Dana, ShopeePay</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-70">Total Produk ({quantity}x):</span>
                  <span className="font-semibold">Rp {itemsTotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Ongkos Kirim ({selectedCourier}):</span>
                  <span className="font-semibold">Rp {shippingCost.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-sm font-extrabold">
                  <span>Total Pembayaran:</span>
                  <span className={`text-lg ${theme.accentText}`}>
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-4 text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 ${theme.primaryButton}`}
              >
                <span>{isSubmitting ? "Memproses Pesanan..." : "Kirim Pesanan Sekarang"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {lp.faq.map((item, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border overflow-hidden transition-all ${theme.card}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm"
                  >
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs opacity-80 leading-relaxed border-t border-slate-800/60 pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Brand */}
        <footer className="text-center text-xs opacity-50 pt-8 pb-4">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <StoreIcon className="h-3.5 w-3.5" />
            <span className="font-semibold">{store.name}</span>
          </div>
          <p className="text-[11px]">
            Toko Online Resmi • Powered by <span className="text-emerald-400 font-bold">KoZa Bisnis</span>
          </p>
        </footer>
      </main>

      {/* Sticky Mobile Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md p-3 sm:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] opacity-60">Harga Promo:</p>
            <p className={`text-base font-black ${theme.accentText}`}>
              Rp {itemPrice.toLocaleString("id-ID")}
            </p>
          </div>
          <a
            href="#order-form"
            onClick={handleInitiateCheckout}
            className={`flex-1 text-center py-2.5 px-4 rounded-xl text-xs font-black shadow-lg ${theme.primaryButton}`}
          >
            Beli Sekarang ({lp.pricing.discountPercent}% OFF)
          </a>
        </div>
      </div>
    </div>
    )}
    </>
  );
}
