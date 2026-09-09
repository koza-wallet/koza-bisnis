"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { generateAICopy } from "@/lib/ai-copywriter";
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
  AlertCircle
} from "lucide-react";

export default function CreateLandingPage() {
  const router = useRouter();
  const { products, createLandingPage, store } = useStore();

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

  // If user selects an existing product
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

    setGeneratedLP(result);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    if (!generatedLP) return;
    const newPage = createLandingPage(generatedLP);
    router.push("/dashboard/landing-pages");
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

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/landing-pages"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar</span>
        </Link>

        {generatedLP && (
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Simpan & Publikasikan</span>
          </button>
        )}
      </div>

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

            {/* Image URL */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Link Foto Produk (URL Image)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Tone of Voice */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gaya Bahasa / Tone Copywriting
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "URGENT", label: "⚡ Urgent (Flash Sale)", desc: "FOMO tinggi, cocok iklan TikTok" },
                  { id: "LUXURY", label: "✨ Luxury (Eksklusif)", desc: "Elegan, cocok produk premium" },
                  { id: "EMOTIONAL", label: "❤️ Storytelling", desc: "Menyentuh perasaan & solusi" },
                  { id: "SCIENTIFIC", label: "🔬 Edukatif / Fakta", desc: "Spesifikasi & uji klinis" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as LandingPageTone)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      tone === t.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{t.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Picker */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tema Warna Desain
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "EMERALD", name: "Emerald", color: "bg-emerald-500" },
                  { id: "MIDNIGHT", name: "Midnight", color: "bg-amber-400" },
                  { id: "ROSE", name: "Rose Glow", color: "bg-pink-400" },
                  { id: "ELECTRIC", name: "Electric", color: "bg-red-500" },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => {
                      setTheme(th.id as LandingPageTheme);
                      if (generatedLP) {
                        setGeneratedLP({ ...generatedLP, theme: th.id as LandingPageTheme });
                      }
                    }}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-medium transition-all ${
                      theme === th.id
                        ? "border-emerald-500 bg-emerald-500/15 text-white"
                        : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className={`h-3.5 w-3.5 rounded-full ${th.color}`} />
                    <span className="truncate">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:opacity-95 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>
                {isGenerating ? "Sedang Menggenerate AI Copy..." : "Generate Landing Page (15 Detik)"}
              </span>
            </button>

            {isGenerating && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>{generationStep}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mobile Preview */}
        <div className="lg:col-span-6 sticky top-20">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Preview
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
              <button
                onClick={() => setDevicePreview("MOBILE")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  devicePreview === "MOBILE" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => setDevicePreview("DESKTOP")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  devicePreview === "DESKTOP" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
            </div>
          </div>

          {/* Smartphone Mockup Frame */}
          <div className="mx-auto max-w-[390px] rounded-[40px] border-[8px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden relative">
            {/* Speaker bar & Dynamic Island */}
            <div className="h-6 w-full bg-slate-950 flex items-center justify-center pt-1 z-30 relative">
              <div className="h-3.5 w-24 bg-slate-800 rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="h-[620px] overflow-y-auto select-none font-sans text-xs scrollbar-thin">
              {generatedLP ? (
                <div className={`min-h-full pb-16 ${currentTheme.bg}`}>
                  {/* Top Notification Bar */}
                  <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-bold text-center py-1.5 px-3">
                    {generatedLP.hero.badge}
                  </div>

                  {/* Hero Section */}
                  <div className="p-4 text-center">
                    <h1 className="text-base font-extrabold leading-tight">
                      {generatedLP.hero.headline}
                    </h1>
                    <p className="text-xs opacity-80 mt-2">
                      {generatedLP.hero.subheadline}
                    </p>

                    {/* Product Image */}
                    {generatedLP.hero.heroImageUrl && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                        <img
                          src={generatedLP.hero.heroImageUrl}
                          alt="Hero Product"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Price Tag Box */}
                    <div className={`mt-4 p-3 rounded-xl border ${currentTheme.cardBg}`}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs line-through opacity-60">
                          Rp {generatedLP.pricing.normalPrice.toLocaleString("id-ID")}
                        </span>
                        <span className={`text-lg font-black ${currentTheme.accentText}`}>
                          Rp {generatedLP.pricing.promoPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <p className="text-[10px] text-rose-400 font-bold mt-1">
                        {generatedLP.pricing.scarcityText}
                      </p>
                    </div>

                    <a
                      href="#order-form"
                      className={`mt-3 block w-full py-3 rounded-xl text-center shadow-lg active:scale-95 transition-all text-xs font-bold ${currentTheme.buttonBg}`}
                    >
                      {generatedLP.hero.ctaText}
                    </a>
                  </div>

                  {/* Problem Agitation */}
                  <div className="p-4 bg-slate-900/40 border-t border-b border-slate-800/80 my-2">
                    <p className="text-center font-bold text-rose-400 text-xs">
                      {generatedLP.problemSection.title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {generatedLP.problemSection.painPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[11px] text-slate-200">{pt.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{pt.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features Highlights */}
                  <div className="p-4">
                    <p className={`text-center font-bold text-xs mb-3 ${currentTheme.accentText}`}>
                      Keunggulan & Jaminan Kualitas
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {generatedLP.features.map((feat, i) => (
                        <div key={i} className={`p-2.5 rounded-xl border ${currentTheme.cardBg}`}>
                          <ShieldCheck className={`h-4 w-4 ${currentTheme.accentText} mb-1`} />
                          <p className="font-bold text-[11px]">{feat.title}</p>
                          <p className="text-[9px] opacity-70 mt-0.5 line-clamp-2">{feat.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Proof */}
                  <div className="p-4 bg-slate-900/30">
                    <p className="text-center font-bold text-xs mb-2">⭐ Ulasan Pembeli Terverifikasi</p>
                    <div className="space-y-2">
                      {generatedLP.testimonials.slice(0, 2).map((t, i) => (
                        <div key={i} className={`p-2.5 rounded-xl border ${currentTheme.cardBg}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, si) => (
                                <Star key={si} className="h-2.5 w-2.5 fill-current" />
                              ))}
                            </div>
                            <span className="font-bold text-[10px]">{t.name}</span>
                          </div>
                          <p className="text-[10px] opacity-80 italic">"{t.review}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Checkout Form */}
                  <div id="order-form" className={`m-4 p-4 rounded-2xl border ${currentTheme.cardBg}`}>
                    <p className="font-bold text-center text-xs mb-2">
                      📝 Form Pemesanan Cepat
                    </p>
                    <div className="space-y-2 text-[10px]">
                      <input
                        type="text"
                        disabled
                        placeholder="Nama Lengkap Anda"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-slate-300"
                      />
                      <input
                        type="text"
                        disabled
                        placeholder="Nomor WhatsApp Aktif"
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-slate-300"
                      />
                      <div className="flex justify-between items-center bg-slate-800/40 p-2 rounded-lg border border-slate-700/60 font-semibold">
                        <span>Total Pembayaran:</span>
                        <span className={`${currentTheme.accentText} font-bold`}>
                          Rp {generatedLP.pricing.promoPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-bold ${currentTheme.buttonBg}`}
                      >
                        Pesan Sekarang (WhatsApp / QRIS)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Sparkles className="h-10 w-10 text-slate-700 mb-3" />
                  <p className="font-semibold text-slate-400 text-xs">Preview Belum Dibuat</p>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-[200px]">
                    Isi data produk di sebelah kiri lalu klik tombol "Generate Landing Page" untuk melihat live preview di sini.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Home Indicator bar */}
            <div className="h-4 w-full bg-slate-950 flex items-center justify-center pb-1">
              <div className="h-1 w-28 bg-slate-700 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
