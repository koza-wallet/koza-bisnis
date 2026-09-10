"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { generateAICopy } from "@/lib/ai-copywriter";
import { BUILDER_TEMPLATES, createDefaultBlock } from "@/lib/builder-templates";
import { BuilderTemplate, BuilderPageDesign } from "@/types/builder";
import { LandingPage, LandingPageTheme, LandingPageTone } from "@/types";
import { 
  Sparkles, 
  ArrowLeft, 
  Check, 
  Eye, 
  Smartphone, 
  Monitor, 
  Wand2, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Award, 
  Star, 
  ChevronRight,
  Flame,
  AlertCircle,
  Crown,
  Lock,
  Palette,
  Layers,
  ArrowRight,
  Search,
  CheckCircle2,
  X
} from "lucide-react";

type CreationMode = "AI" | "MANUAL" | "TEMPLATE";

export default function CreateLandingPage() {
  const router = useRouter();
  const { products, createLandingPage, store } = useStore();

  // Mode Selection: AI, Kanvas Kosong (Berdu), or Template Library
  const [creationMode, setCreationMode] = useState<CreationMode>("AI");

  // User Pro Status (Termasuk Pro AI atau pemilik token AI)
  const isUserPro = store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL" || (store.aiCreditsBalance !== undefined && store.aiCreditsBalance > 0);

  // State for AI Generator
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(145000);
  const [normalPrice, setNormalPrice] = useState<number>(225000);
  const [keyBenefits, setKeyBenefits] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tone, setTone] = useState<LandingPageTone>("URGENT");
  const [theme, setTheme] = useState<LandingPageTheme>("EMERALD");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generatedLP, setGeneratedLP] = useState<Omit<LandingPage, "id" | "createdAt"> | null>(null);
  const [devicePreview, setDevicePreview] = useState<"MOBILE" | "DESKTOP">("MOBILE");

  // State for Blank Canvas (Manual Mode)
  const [manualTitle, setManualTitle] = useState("");
  const [manualSlug, setManualSlug] = useState("");
  const [manualTheme, setManualTheme] = useState<LandingPageTheme>("EMERALD");
  const [manualFont, setManualFont] = useState<"Outfit" | "Plus Jakarta Sans" | "Inter" | "Poppins">("Plus Jakarta Sans");

  // State for Template Library
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [templateSearch, setTemplateSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<BuilderTemplate | null>(null);
  const [showProModal, setShowProModal] = useState(false);
  const [proModalTargetTemplate, setProModalTargetTemplate] = useState<BuilderTemplate | null>(null);

  // Auto-generate slug from title
  const handleManualTitleChange = (val: string) => {
    setManualTitle(val);
    const slugified = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setManualSlug(slugified);
  };

  // If user selects an existing product in AI mode
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setProductName(prod.name);
      setSellingPrice(prod.sellingPrice);
      setNormalPrice(Math.round((prod.sellingPrice * 1.5) / 1000) * 1000);
      setImageUrl(prod.imageUrl);
      setKeyBenefits(prod.description);
    }
  };

  // AI Generation Handler
  const handleGenerate = async () => {
    if (!productName.trim()) {
      alert("Silakan masukkan nama produk terlebih dahulu!");
      return;
    }

    setIsGenerating(true);
    setGenerationStep("Menganalisis audiens & positioning produk...");
    await new Promise((r) => setTimeout(r, 600));

    setGenerationStep("Menulis hook headline & copywriting formula AIDA...");
    await new Promise((r) => setTimeout(r, 700));

    setGenerationStep("Menyusun ulasan pembeli autentik & penawaran terbatas...");
    await new Promise((r) => setTimeout(r, 600));

    setGenerationStep("Menyiapkan layout checkout konversi tinggi...");
    await new Promise((r) => setTimeout(r, 500));

    const result = generateAICopy({
      productName,
      sellingPrice,
      normalPrice,
      keyBenefits,
      targetAudience,
      tone,
      theme,
      imageUrl: imageUrl || undefined,
      storeId: store.id,
      productId: selectedProductId || undefined,
    });

    setGeneratedLP({
      ...result,
      builderMode: "AI",
    });
    setIsGenerating(false);
  };

  const handlePublish = () => {
    if (!generatedLP) return;
    createLandingPage(generatedLP);
    router.push("/dashboard/landing-pages");
  };

  // Handler Start Blank Canvas (Manual Mode)
  const handleCreateBlankCanvas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      alert("Silakan masukkan nama halaman!");
      return;
    }

    const defaultBlocks = [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ];

    const designConfig: BuilderPageDesign = {
      fontFamily: manualFont,
      pageWidth: "CONTAINED",
      primaryColor: manualTheme === "MIDNIGHT" ? "#f59e0b" : manualTheme === "ROSE" ? "#db2777" : manualTheme === "ELECTRIC" ? "#ef4444" : "#10b981",
      backgroundColor: manualTheme === "MIDNIGHT" ? "#0a0a0a" : manualTheme === "ROSE" ? "#831843" : manualTheme === "ELECTRIC" ? "#180606" : "#022c22",
      textColor: "#ffffff",
      cardRadius: "xl",
      themePreset: manualTheme,
    };

    const newPage = createLandingPage({
      storeId: store.id,
      productId: selectedProductId || undefined,
      slug: manualSlug || "page-" + Date.now(),
      title: manualTitle,
      theme: manualTheme,
      tone: "URGENT",
      builderMode: "MANUAL",
      blocks: defaultBlocks,
      design: designConfig,
      seo: {
        metaTitle: manualTitle,
        metaDescription: `Halaman jualan resmi ${manualTitle}`,
        metaKeywords: "",
        noIndex: false,
      },
      hero: {
        badge: "PROMO HARI INI",
        headline: manualTitle,
        subheadline: "Pesan sekarang dapatkan diskon spesial dan gratis ongkir!",
        ctaText: "Pesan Sekarang ➔",
        heroImageUrl: "",
        countdownHours: 3,
      },
      problemSection: { title: "", subtitle: "", painPoints: [] },
      solutionSection: { title: "", description: "", highlights: [] },
      features: [],
      testimonials: [],
      guarantee: { title: "Garansi 100%", description: "Garansi kepuasan atau uang kembali" },
      faq: [],
      pricing: {
        normalPrice: 250000,
        promoPrice: 149000,
        discountPercent: 40,
        scarcityText: "Khusus Hari Ini",
      },
      analytics: { viewsCount: 0, ordersCount: 0, conversionRate: 0 },
      isPublished: true,
    });

    router.push(`/dashboard/landing-pages/${newPage.id}/builder`);
  };

  // Handler Use Template
  const handleUseTemplate = (template: BuilderTemplate) => {
    // Check if template is PRO and user is NOT PRO
    if (template.isPro && !isUserPro) {
      setProModalTargetTemplate(template);
      setShowProModal(true);
      return;
    }

    const generatedSlug = template.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Math.floor(100 + Math.random() * 900);

    const newPage = createLandingPage({
      storeId: store.id,
      slug: generatedSlug,
      title: template.name,
      theme: template.design.themePreset === "CUSTOM" ? "EMERALD" : template.design.themePreset,
      tone: "URGENT",
      builderMode: "TEMPLATE",
      blocks: template.blocks,
      design: template.design,
      seo: {
        metaTitle: template.name,
        metaDescription: template.description,
        metaKeywords: "",
        noIndex: false,
      },
      hero: {
        badge: "PROMO SPESIAL",
        headline: template.name,
        subheadline: template.description,
        ctaText: "Beli Sekarang",
        heroImageUrl: template.thumbnailUrl,
        countdownHours: 3,
      },
      problemSection: { title: "", subtitle: "", painPoints: [] },
      solutionSection: { title: "", description: "", highlights: [] },
      features: [],
      testimonials: [],
      guarantee: { title: "Garansi Resmi", description: "Jaminan keaslian dan kepuasan pelanggan" },
      faq: [],
      pricing: {
        normalPrice: 285000,
        promoPrice: 149000,
        discountPercent: 48,
        scarcityText: "Hemat 48% Hari Ini",
      },
      analytics: { viewsCount: 0, ordersCount: 0, conversionRate: 0 },
      isPublished: true,
    });

    router.push(`/dashboard/landing-pages/${newPage.id}/builder`);
  };

  // Color schemes for preview
  const getThemeStyles = (t: LandingPageTheme) => {
    switch (t) {
      case "MIDNIGHT":
        return {
          bg: "bg-slate-950 text-white",
          accentBg: "bg-amber-500",
          accentText: "text-amber-400",
          accentBorder: "border-amber-500/30",
          cardBg: "bg-slate-900 border-slate-800",
          buttonBg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold",
        };
      case "ROSE":
        return {
          bg: "bg-[#fffafc] text-slate-900",
          accentBg: "bg-pink-500",
          accentText: "text-pink-600",
          accentBorder: "border-pink-300",
          cardBg: "bg-white border-pink-100 shadow-sm",
          buttonBg: "bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold",
        };
      case "ELECTRIC":
        return {
          bg: "bg-slate-950 text-white",
          accentBg: "bg-red-500",
          accentText: "text-red-400",
          accentBorder: "border-red-500/30",
          cardBg: "bg-slate-900 border-slate-800",
          buttonBg: "bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold",
        };
      default:
        return {
          bg: "bg-slate-950 text-white",
          accentBg: "bg-emerald-500",
          accentText: "text-emerald-400",
          accentBorder: "border-emerald-500/30",
          cardBg: "bg-slate-900 border-slate-800",
          buttonBg: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold",
        };
    }
  };

  const currentTheme = generatedLP ? getThemeStyles(generatedLP.theme) : getThemeStyles(theme);

  // Filter templates
  const filteredTemplates = BUILDER_TEMPLATES.filter((tpl) => {
    const matchCat = selectedCategory === "ALL" || tpl.category === selectedCategory;
    const matchSearch = tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) || 
      tpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/landing-pages"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Halaman</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Buat Halaman Jualan Baru
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pilih metode yang paling sesuai: otomatis kilat dengan AI, kanvas kosong modular, atau pilih dari template siap pakai.
          </p>
        </div>

        {generatedLP && creationMode === "AI" && (
          <button
            onClick={handlePublish}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Simpan & Publikasikan</span>
          </button>
        )}
      </div>

      {/* 3-Mode Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Mode 1: AI */}
        <button
          type="button"
          onClick={() => setCreationMode("AI")}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
            creationMode === "AI"
              ? "bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className={`p-2.5 rounded-xl ${creationMode === "AI" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-emerald-400"}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">⚡ AI Generator</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                15 Detik Jadi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ketik nama produk, AI menulis copywriting formula AIDA dan merakit layout otomatis.
            </p>
          </div>
        </button>

        {/* Mode 2: Manual Blank Canvas */}
        <button
          type="button"
          onClick={() => setCreationMode("MANUAL")}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
            creationMode === "MANUAL"
              ? "bg-gradient-to-br from-blue-950/60 to-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className={`p-2.5 rounded-xl ${creationMode === "MANUAL" ? "bg-blue-500 text-slate-950" : "bg-slate-800 text-blue-400"}`}>
            <Palette className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">🎨 Kanvas Kosong</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Ala Berdu
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Mulai dari nol dengan kanvas fleksibel, bebas tambah, geser, dan edit blok sesuka hati.
            </p>
          </div>
        </button>

        {/* Mode 3: Template Library */}
        <button
          type="button"
          onClick={() => setCreationMode("TEMPLATE")}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
            creationMode === "TEMPLATE"
              ? "bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
          }`}
        >
          <div className={`p-2.5 rounded-xl ${creationMode === "TEMPLATE" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-amber-400"}`}>
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">📚 Pustaka Template</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                10 Template
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pilih desain siap jualan per kategori industri (5 Gratis + 5 Eksklusif Member PRO).
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: AI GENERATOR */}
      {/* ========================================================================= */}
      {creationMode === "AI" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Wand2 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-white">AI Copywriting Generator</h2>
              </div>

              {/* Product selection shortcut */}
              {products.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Produk dari Toko (Opsional):
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Ketik Produk Baru Sendiri --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Rp {p.sellingPrice.toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Produk <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Serum Retinol Anti-Aging Glow"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Harga Promo (Jual)
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Harga Coret (Normal)
                  </label>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Key Benefits */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Poin Keunggulan Utama (Bahan, Manfaat)
                </label>
                <textarea
                  rows={2}
                  value={keyBenefits}
                  onChange={(e) => setKeyBenefits(e.target.value)}
                  placeholder="Contoh: Menyamarkan garis halus dalam 14 hari, tidak lengket, bersertifikasi BPOM, cocok untuk kulit sensitif."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Target Audience */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Pembeli / Masalah yang Dialami
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Contoh: Wanita 25-45 tahun yang ingin awet muda tanpa perawatan klinik mahal"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Image URL */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Link Foto Produk (URL)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Tone Selection */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Gaya Bahasa Copywriting:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "URGENT", label: "🔥 Mendesak / Flash Sale", desc: "Urgensi tinggi, diskon terbatas" },
                    { id: "LUXURY", label: "💎 Eksklusif / Mewah", desc: "Elegan, prestisius, nilai tinggi" },
                    { id: "EMOTIONAL", label: "❤️ Cerita / Empati", desc: "Menyentuh perasaan & solusi" },
                    { id: "SCIENTIFIC", label: "🧪 Fakta & Edukatif", desc: "Data, bahan, uji klinis" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as LandingPageTone)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        tone === t.id
                          ? "bg-emerald-500/10 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/20"
                          : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <span className="font-semibold block text-white">{t.label}</span>
                      <span className="text-[10px] text-slate-400">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selection */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Pilihan Tema Visual:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "EMERALD", name: "Emerald", color: "bg-emerald-500" },
                    { id: "MIDNIGHT", name: "Midnight", color: "bg-amber-500" },
                    { id: "ROSE", name: "Rose Glow", color: "bg-pink-500" },
                    { id: "ELECTRIC", name: "Electric", color: "bg-red-500" },
                  ].map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setTheme(th.id as LandingPageTheme)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        theme === th.id
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-700 bg-slate-800/40 hover:border-slate-600"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full ${th.color} shadow-sm`} />
                      <span className="text-[11px] font-medium text-slate-300">{th.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{generationStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Landing Page Sekarang (15 Detik)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Mockup */}
          <div className="lg:col-span-6 sticky top-6">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-400" />
                Live Mockup Preview
              </span>

              <div className="flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-800 p-1">
                <button
                  onClick={() => setDevicePreview("MOBILE")}
                  className={`p-1.5 rounded ${devicePreview === "MOBILE" ? "bg-slate-800 text-emerald-400" : "text-slate-400"}`}
                  title="Mobile View"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevicePreview("DESKTOP")}
                  className={`p-1.5 rounded ${devicePreview === "DESKTOP" ? "bg-slate-800 text-emerald-400" : "text-slate-400"}`}
                  title="Desktop View"
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Smartphone frame */}
            <div className="mx-auto max-w-[380px] rounded-[40px] border-[10px] border-slate-800 bg-slate-950 p-2 shadow-2xl relative overflow-hidden">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-800 rounded-b-xl z-30" />

              <div className="h-[580px] overflow-y-auto rounded-[28px] bg-slate-900 scrollbar-none text-left">
                {generatedLP ? (
                  <div className={`p-4 space-y-4 ${currentTheme.bg}`}>
                    <div className="text-center py-2 px-3 rounded-lg bg-red-600 text-white text-[11px] font-bold">
                      🔥 {generatedLP.hero.badge}
                    </div>

                    <div className="text-center space-y-2">
                      <h2 className="text-base font-black leading-tight text-white">
                        {generatedLP.hero.headline}
                      </h2>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {generatedLP.hero.subheadline}
                      </p>
                    </div>

                    {generatedLP.hero.heroImageUrl ? (
                      <div className="rounded-xl overflow-hidden border border-slate-700/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={generatedLP.hero.heroImageUrl}
                          alt="Product"
                          className="w-full h-44 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-36 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-1">
                        <Flame className="h-6 w-6 text-amber-400" />
                        <span className="text-[11px]">Foto Produk Anda</span>
                      </div>
                    )}

                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-center space-y-1">
                      <span className="text-[10px] text-slate-400 line-through">
                        Rp {generatedLP.pricing.normalPrice.toLocaleString("id-ID")}
                      </span>
                      <div className="text-xl font-black text-emerald-400">
                        Rp {generatedLP.pricing.promoPrice.toLocaleString("id-ID")}
                      </div>
                      <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Hemat {generatedLP.pricing.discountPercent}% Hari Ini
                      </span>
                    </div>

                    <div className="py-2.5 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md">
                      {generatedLP.hero.ctaText}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2">
                      <span className="text-[11px] font-bold text-rose-400">
                        ⚠️ {generatedLP.problemSection.title}
                      </span>
                      <div className="space-y-1.5">
                        {generatedLP.problemSection.painPoints.slice(0, 2).map((p, i) => (
                          <div key={i} className="text-[10px] text-slate-300">
                            • <strong className="text-white">{p.title}</strong>: {p.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">Preview Belum Digenerate</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Isi form di samping dan klik tombol Generate untuk melihat visual mockup interaktif secara instan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KANVAS KOSONG (MANUAL BUILDER ALA BERDU) */}
      {/* ========================================================================= */}
      {creationMode === "MANUAL" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Mulai dari Kanvas Kosong (Ala Berdu)</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Anda akan masuk ke antarmuka editor visual untuk menambahkan blok modular satu per satu.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBlankCanvas} className="space-y-5">
              {/* Product link (optional) */}
              {products.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hubungkan ke Produk Toko (Opsional):
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) handleManualTitleChange(prod.name);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- Pilih Produk Toko (Opsional) --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Rp {p.sellingPrice.toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama Halaman Landing Page <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => handleManualTitleChange(e.target.value)}
                  placeholder="Contoh: Promo Spesial Gamis Silk Premium"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL Path / Slug
                </label>
                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-slate-400">
                  <span className="text-slate-500 mr-1 select-none">kozabisnis.com/lp/</span>
                  <input
                    type="text"
                    required
                    value={manualSlug}
                    onChange={(e) => setManualSlug(e.target.value)}
                    className="flex-1 bg-transparent text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Theme & Font */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Warna Tema Utama:
                  </label>
                  <select
                    value={manualTheme}
                    onChange={(e) => setManualTheme(e.target.value as LandingPageTheme)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="EMERALD">Emerald Modern (Hijau Segar)</option>
                    <option value="MIDNIGHT">Midnight Luxe (Hitam Emas)</option>
                    <option value="ROSE">Rose Glow (Elegan Pink)</option>
                    <option value="ELECTRIC">Electric Flash (Merah Menggelegar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Jenis Font Tipografi:
                  </label>
                  <select
                    value={manualFont}
                    onChange={(e) => setManualFont(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern)</option>
                    <option value="Outfit">Outfit (Clean & Premium)</option>
                    <option value="Inter">Inter (Minimalis)</option>
                    <option value="Poppins">Poppins (Friendly Bold)</option>
                  </select>
                </div>
              </div>

              {/* Default included sections info */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  📦 Blok Permulaan yang Otomatis Disiapkan:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Bar Pengumuman Urgensi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Hero Banner Headline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Grid 4 Keunggulan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Ulasan Bintang 5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Form Checkout 1-Klik</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Sticky Bottom Mobile CTA</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  *Anda dapat menambah, menghapus, atau menata ulang semua blok di dalam dapur editor.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
              >
                <span>Mulai Rancang di Dapur Editor Berdu</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: TEMPLATE LIBRARY (5 GRATIS + 5 PRO) */}
      {/* ========================================================================= */}
      {creationMode === "TEMPLATE" && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
              {[
                { id: "ALL", label: "Semua Template" },
                { id: "FASHION", label: "👗 Fashion" },
                { id: "BEAUTY", label: "🌸 Skincare & Beauty" },
                { id: "FOOD", label: "🍲 Kuliner & Makanan" },
                { id: "GADGET", label: "⌚ Gadget & Elektronik" },
                { id: "SERVICES", label: "💼 Jasa & Portofolio" },
                { id: "HERBAL", label: "🌿 Herbal & Suplemen" },
                { id: "VIRAL_TIKTOK", label: "🔥 Viral TikTok Ads" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Cari template industri..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden hover:border-slate-700 hover:shadow-2xl transition-all"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tpl.thumbnailUrl}
                    alt={tpl.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Badge PRO or Free */}
                  <div className="absolute top-3 left-3">
                    {tpl.isPro ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg">
                        <Crown className="h-3.5 w-3.5" />
                        PRO EXCLUSIVE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white shadow-md">
                        <Check className="h-3.5 w-3.5" />
                        GRATIS
                      </span>
                    )}
                  </div>

                  {/* Quick Preview button overlay */}
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all shadow-md"
                    title="Lihat Detail Template"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {tpl.category}
                    </span>
                    <h3 className="text-base font-bold text-white drop-shadow-sm">{tpl.name}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-200">{tpl.blocks.length} Blok</span> siap pakai
                    </div>

                    <button
                      onClick={() => handleUseTemplate(tpl)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                        tpl.isPro && !isUserPro
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                          : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                      }`}
                    >
                      {tpl.isPro && !isUserPro ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-amber-400" />
                          <span>Gunakan (PRO)</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5" />
                          <span>Gunakan Template</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRO PAYWALL MODAL */}
      {/* ========================================================================= */}
      {showProModal && proModalTargetTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl ring-1 ring-amber-500/20">
            {/* Close button */}
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center text-slate-950">
                <Crown className="h-8 w-8" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                Fitur Eksklusif Member PRO
              </span>
              <h3 className="text-lg font-black text-white">
                Buka Akses Template &quot;{proModalTargetTemplate.name}&quot;
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Template ini dirancang dengan formula konversi tinggi untuk pengiklan profesional TikTok &amp; Meta Ads. Upgrade ke paket PRO untuk membuka seluruh 10+ template tanpa batas!
              </p>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Akses seluruh template sales page premium</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Bonus kuota order pesanan toko</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Pelacakan otomatis Meta &amp; TikTok Pixel Runner</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Dukungan prioritas tim KoZa Bisnis</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowProModal(false);
                  router.push("/dashboard/topup");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade ke KoZa PRO Sekarang ➔</span>
              </button>
              <button
                onClick={() => setShowProModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Nanti Saja, Gunakan Template Gratis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE DETAIL PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewTemplate.thumbnailUrl}
                alt={previewTemplate.name}
                className="h-20 w-28 rounded-xl object-cover border border-slate-800 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{previewTemplate.name}</h3>
                  {previewTemplate.isPro ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      👑 PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      GRATIS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{previewTemplate.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                  <span>🎨 Tema: <strong>{previewTemplate.design.themePreset}</strong></span>
                  <span>✍️ Font: <strong>{previewTemplate.design.fontFamily}</strong></span>
                </div>
              </div>
            </div>

            {/* Block Stack Preview */}
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-slate-300 block">
                Susunan Blok Seksi ({previewTemplate.blocks.length} Blok):
              </span>
              <div className="space-y-1.5">
                {previewTemplate.blocks.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-700 text-[10px] font-bold text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold">{b.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      {b.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(t);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                  previewTemplate.isPro && !isUserPro
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black"
                    : "bg-emerald-500 text-white hover:bg-emerald-400"
                }`}
              >
                {previewTemplate.isPro && !isUserPro ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Buka Akses dengan PRO</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Gunakan Template Ini ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
