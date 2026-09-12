"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { BUILDER_TEMPLATES, createDefaultBlock } from "@/lib/builder-templates";
import { BuilderTemplate, BuilderPageDesign, BuilderPageSEO, BuilderBlock } from "@/types/builder";
import { LandingPageTheme, LandingPageTone } from "@/types";
import { BlockRenderer } from "@/components/builder/block-renderer";
import { DevicePreviewFrame } from "@/components/builder/device-preview-frame";
import { useTheme } from "@/lib/theme-context";
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
  const { theme } = useTheme();

  // Mode Selection: AI, Kanvas Kosong (Modular), or Template Library
  const [creationMode, setCreationMode] = useState<CreationMode>("AI");

  // User Pro Status (Termasuk Pro AI atau pemilik token AI)
  const isUserPro = store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL" || (store.aiCreditsBalance !== undefined && store.aiCreditsBalance > 0);
  // Fitur AI Landing Page Generator eksklusif Pro AI (bulanan/tahunan) — Basic & Free/Trial dikunci,
  // sengaja TIDAK ikut aiCreditsBalance seperti isUserPro di atas.
  const hasAiLandingPageAccess = store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL";

  // State for AI Generator (minimal input, AI decides layout/copywriting/design)
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(145000);
  const [normalPrice, setNormalPrice] = useState<number>(225000);
  const [ctaText, setCtaText] = useState("");
  const [otherInfo, setOtherInfo] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedBlocks, setGeneratedBlocks] = useState<BuilderBlock[] | null>(null);
  const [generatedDesign, setGeneratedDesign] = useState<BuilderPageDesign | null>(null);
  const [generatedSeo, setGeneratedSeo] = useState<BuilderPageSEO | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"MOBILE" | "DESKTOP">("MOBILE");

  // State for Blank Canvas (Manual Mode)
  const [selectedProductId, setSelectedProductId] = useState<string>("");
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


  // AI Generation Handler — memanggil endpoint server yang benar-benar memanggil OpenAI
  const handleGenerate = async () => {
    if (!productName.trim() || !description.trim()) {
      alert("Nama produk dan deskripsi produk wajib diisi!");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedBlocks(null);
    setGeneratedDesign(null);
    setGeneratedSeo(null);
    setPublishedUrl(null);

    try {
      const res = await fetch("/api/landing-pages/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: productName,
          description,
          sellingPrice,
          normalPrice,
          imageUrl: imageUrl || undefined,
          ctaText: ctaText || undefined,
          otherInfo: otherInfo || undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const suffix = json.errorRef ? ` (Kode Referensi: ${json.errorRef})` : "";
        setGenerationError((json.error || "Gagal membuat halaman. Silakan coba lagi.") + suffix);
        return;
      }

      setGeneratedBlocks(json.data.blocks);
      setGeneratedDesign(json.data.design);
      setGeneratedSeo(json.data.seo);
    } catch (err) {
      setGenerationError("Gagal terhubung ke server. Periksa koneksi Anda dan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  const buildAiLandingPagePayload = (isPublished: boolean) => {
    const slug =
      productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
      "-" +
      Math.floor(100 + Math.random() * 900);

    return {
      storeId: store.id,
      slug,
      title: generatedSeo?.metaTitle || productName,
      theme: (generatedDesign?.themePreset === "CUSTOM" ? "EMERALD" : generatedDesign?.themePreset) || "EMERALD",
      tone: "URGENT" as LandingPageTone,
      builderMode: "AI" as const,
      blocks: generatedBlocks || [],
      design: generatedDesign || undefined,
      seo: generatedSeo || { metaTitle: productName, metaDescription: description, metaKeywords: "", noIndex: !isPublished },
      hero: { badge: "", headline: productName, subheadline: description, ctaText: ctaText || "Pesan Sekarang", heroImageUrl: imageUrl, countdownHours: 12 },
      problemSection: { title: "", subtitle: "", painPoints: [] },
      solutionSection: { title: "", description: "", highlights: [] },
      features: [],
      testimonials: [],
      guarantee: { title: "Garansi 100% Kepuasan", description: "Barang rusak atau tidak sesuai kami ganti baru tanpa ribet." },
      faq: [],
      pricing: { normalPrice, promoPrice: sellingPrice, discountPercent: Math.round(((normalPrice - sellingPrice) / normalPrice) * 100), scarcityText: "" },
      analytics: { viewsCount: 0, ordersCount: 0, conversionRate: 0 },
      isPublished,
    };
  };

  const handleEditInCanvas = () => {
    if (!generatedBlocks) return;
    const newPage = createLandingPage(buildAiLandingPagePayload(false));
    router.push(`/dashboard/landing-pages/${newPage.id}/builder`);
  };

  const handlePublish = () => {
    if (!generatedBlocks) return;
    const newPage = createLandingPage(buildAiLandingPagePayload(true));
    setPublishedUrl(`${window.location.origin}/lp/${newPage.slug}`);
  };

  const handleCopyPublishedLink = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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
        noIndex: true,
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
      isPublished: false,
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
        noIndex: true,
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
      isPublished: false,
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
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-[#0E1420]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
        <div>
          <Link
            href="/dashboard/landing-pages"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Halaman</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Buat Halaman Jualan Baru
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Pilih metode yang paling sesuai: otomatis kilat dengan AI, kanvas kosong modular, atau pilih dari template siap pakai.
          </p>
        </div>
      </div>

      {/* 3-Mode Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Mode 1: AI */}
        <button
          type="button"
          onClick={() => setCreationMode("AI")}
          className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all ${
            creationMode === "AI"
              ? "bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/60 dark:to-slate-900 border-emerald-400/80 dark:border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30"
              : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900"
          }`}
        >
          <div className={`p-2.5 rounded-xl ${creationMode === "AI" ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400"}`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">⚡ AI Generator</span>
              {hasAiLandingPageAccess ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  15 Detik Jadi
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  <Lock className="h-2.5 w-2.5" />
                  PRO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
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
              ? "bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/60 dark:to-slate-900 border-blue-400/80 dark:border-blue-500/50 shadow-sm ring-1 ring-blue-500/30"
              : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900"
          }`}
        >
          <div className={`p-2.5 rounded-xl ${creationMode === "MANUAL" ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400"}`}>
            <Palette className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">🎨 Kanvas Kosong</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                Modular
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
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
              ? "bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/60 dark:to-slate-900 border-amber-400/80 dark:border-amber-500/50 shadow-sm ring-1 ring-amber-500/30"
              : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-900"
          }`}
        >
          <div className={`p-2.5 rounded-xl ${creationMode === "TEMPLATE" ? "bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950" : "bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400"}`}>
            <Layers className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">📚 Pustaka Template</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                10 Template
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Pilih desain siap jualan per kategori industri (5 Gratis + 5 Eksklusif Member PRO).
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: AI GENERATOR */}
      {/* ========================================================================= */}
      {creationMode === "AI" && !hasAiLandingPageAccess && (
        <div className="max-w-lg mx-auto rounded-2xl border border-amber-300/80 dark:border-amber-500/30 bg-gradient-to-b from-amber-50/80 via-white to-white dark:from-amber-500/10 dark:to-slate-900/80 p-8 text-center space-y-4 shadow-sm transition-colors">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Fitur Eksklusif Pro AI</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              AI Landing Page Generator hanya tersedia untuk member Pro AI (25x generate/bulan, atau 350x/tahun untuk paket Pro Tahunan). Upgrade paket Anda untuk mulai membuat halaman jualan dengan AI.
            </p>
          </div>
          <Link
            href="/dashboard/topup"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-xs transition-all active:scale-95"
          >
            <Crown className="h-4 w-4" />
            <span>Upgrade ke Pro AI</span>
          </Link>
        </div>
      )}

      {creationMode === "AI" && hasAiLandingPageAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Minimal Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-6 shadow-xs transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  <Wand2 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Buat dengan AI</h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5">
                Isi informasi bisnis dasar — AI yang urus copywriting, layout, dan tampilan halamannya.
              </p>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Halaman / Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Serum Retinol Anti-Aging Glow"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Gambar Produk
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi Produk <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Serum wajah berbahan retinol yang menyamarkan garis halus dalam 14 hari, cocok untuk kulit sensitif, bersertifikasi BPOM."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Harga Jual</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Harga Coret (Opsional)</label>
                  <input
                    type="number"
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Teks CTA (Opsional)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Contoh: Pesan Sekarang"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Info Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={otherInfo}
                  onChange={(e) => setOtherInfo(e.target.value)}
                  placeholder="Target pembeli, garansi, promo khusus, dll."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none resize-none"
                />
              </div>

              {generationError && (
                <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                  {generationError}
                </div>
              )}

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sedang membuat halaman dengan AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Landing Page</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Real Preview (BlockRenderer — sama persis dengan Canvas & halaman publik) */}
          <div className="lg:col-span-7 sticky top-32">
            <div className="flex items-center justify-between mb-3 text-slate-500 dark:text-slate-400">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Preview
              </span>

              {generatedBlocks && (
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
                  <button
                    onClick={() => setDevicePreview("MOBILE")}
                    className={`p-1.5 rounded-lg transition-colors ${devicePreview === "MOBILE" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-slate-500 dark:text-slate-400"}`}
                    title="Mobile View"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDevicePreview("DESKTOP")}
                    className={`p-1.5 rounded-lg transition-colors ${devicePreview === "DESKTOP" ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-slate-500 dark:text-slate-400"}`}
                    title="Desktop View"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {publishedUrl ? (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-8 text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                  <Check className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Halaman Sudah Live!</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 break-all">{publishedUrl}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={handleCopyPublishedLink}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isCopied ? "Tersalin!" : "Salin Link Halaman"}</span>
                  </button>
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    Buka Halaman
                  </a>
                </div>
              </div>
            ) : (
              <div className={`mx-auto rounded-3xl border-[10px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl relative overflow-hidden ${devicePreview === "MOBILE" ? "max-w-[380px]" : "max-w-full"}`}>
                <div className="h-[620px] overflow-y-auto bg-slate-50 dark:bg-slate-900 text-left">
                  {generatedBlocks ? (
                    <>
                      {devicePreview === "MOBILE" ? (
                        <DevicePreviewFrame width={360} isDark={theme === "dark"} className="w-full block">
                          <div>
                            {generatedBlocks
                              .filter((b) => b.isVisible)
                              .map((block) => (
                                <BlockRenderer key={block.id} block={block} design={generatedDesign || undefined} isPreview />
                              ))}
                          </div>
                        </DevicePreviewFrame>
                      ) : (
                        <div className="max-w-3xl mx-auto">
                          {generatedBlocks
                            .filter((b) => b.isVisible)
                            .map((block) => (
                              <BlockRenderer key={block.id} block={block} design={generatedDesign || undefined} isPreview />
                            ))}
                        </div>
                      )}
                      <div className="sticky bottom-0 p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                        <button
                          onClick={handleEditInCanvas}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-800 dark:text-white transition-colors"
                        >
                          <Layers className="h-3.5 w-3.5" />
                          <span>Edit di Canvas</span>
                        </button>
                        <button
                          onClick={handlePublish}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Publish</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300">Preview Belum Digenerate</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Isi form di samping dan klik Generate untuk melihat halaman jadi secara instan.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KANVAS KOSONG (MANUAL BUILDER MODULAR) */}
      {/* ========================================================================= */}
      {creationMode === "MANUAL" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-6 md:p-8 shadow-xs transition-colors">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mulai dari Kanvas Kosong Modular</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Anda akan masuk ke antarmuka editor visual untuk menambahkan blok modular satu per satu.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBlankCanvas} className="space-y-5">
              {/* Product link (optional) */}
              {products.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Hubungkan ke Produk Toko (Opsional):
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) handleManualTitleChange(prod.name);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Halaman Landing Page <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => handleManualTitleChange(e.target.value)}
                  placeholder="Contoh: Promo Spesial Gamis Silk Premium"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Path / Slug
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 text-sm text-slate-500 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500 mr-1 select-none">kozabisnis.com/lp/</span>
                  <input
                    type="text"
                    required
                    value={manualSlug}
                    onChange={(e) => setManualSlug(e.target.value)}
                    className="flex-1 bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Theme & Font */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Warna Tema Utama:
                  </label>
                  <select
                    value={manualTheme}
                    onChange={(e) => setManualTheme(e.target.value as LandingPageTheme)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                  >
                    <option value="EMERALD">Emerald Modern (Hijau Segar)</option>
                    <option value="MIDNIGHT">Midnight Luxe (Hitam Emas)</option>
                    <option value="ROSE">Rose Glow (Elegan Pink)</option>
                    <option value="ELECTRIC">Electric Flash (Merah Menggelegar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Jenis Font Tipografi:
                  </label>
                  <select
                    value={manualFont}
                    onChange={(e) => setManualFont(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                  >
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern)</option>
                    <option value="Outfit">Outfit (Clean & Premium)</option>
                    <option value="Inter">Inter (Minimalis)</option>
                    <option value="Poppins">Poppins (Friendly Bold)</option>
                  </select>
                </div>
              </div>

              {/* Default included sections info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">
                  📦 Blok Permulaan yang Otomatis Disiapkan:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Bar Pengumuman Urgensi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Hero Banner Headline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Grid 4 Keunggulan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ulasan Bintang 5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Form Checkout 1-Klik</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>Mulai Rancang di Editor Visual</span>
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
                      ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-bold"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
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
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] overflow-hidden hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg transition-all"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
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
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{tpl.blocks.length} Blok</span> siap pakai
                    </div>

                    <button
                      onClick={() => handleUseTemplate(tpl)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                        tpl.isPro && !isUserPro
                          ? "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-200 dark:hover:bg-amber-500/30"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20"
                      }`}
                    >
                      {tpl.isPro && !isUserPro ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 p-6 shadow-2xl ring-1 ring-amber-500/20">
            {/* Close button */}
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center text-slate-950">
                <Crown className="h-8 w-8" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/30">
                Fitur Eksklusif Member PRO
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Buka Akses Template &quot;{proModalTargetTemplate.name}&quot;
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Template ini dirancang dengan formula konversi tinggi untuk pengiklan profesional TikTok &amp; Meta Ads. Upgrade ke paket PRO untuk membuka seluruh 10+ template tanpa batas!
              </p>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Akses seluruh template sales page premium</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Bonus kuota order pesanan toko</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Pelacakan otomatis Meta &amp; TikTok Pixel Runner</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Dukungan prioritas tim KoZa Bisnis</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowProModal(false);
                  router.push("/dashboard/topup");
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade ke KoZa PRO Sekarang ➔</span>
              </button>
              <button
                onClick={() => setShowProModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewTemplate.thumbnailUrl}
                alt={previewTemplate.name}
                className="h-20 w-28 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{previewTemplate.name}</h3>
                  {previewTemplate.isPro ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      👑 PRO
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      GRATIS
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{previewTemplate.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-300">
                  <span>🎨 Tema: <strong>{previewTemplate.design.themePreset}</strong></span>
                  <span>✍️ Font: <strong>{previewTemplate.design.fontFamily}</strong></span>
                </div>
              </div>
            </div>

            {/* Block Stack Preview */}
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300 block">
                Susunan Blok Seksi ({previewTemplate.blocks.length} Blok):
              </span>
              <div className="space-y-1.5">
                {previewTemplate.blocks.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold">{b.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                      {b.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const t = previewTemplate;
                  setPreviewTemplate(null);
                  handleUseTemplate(t);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
                  previewTemplate.isPro && !isUserPro
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black"
                    : "bg-emerald-600 text-white hover:bg-emerald-500"
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
