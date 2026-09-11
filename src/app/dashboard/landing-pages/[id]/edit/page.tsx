"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { LandingPageTheme, LandingPageTone } from "@/types";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Sparkles, 
  Eye, 
  Check, 
  ExternalLink,
  Tag,
  Clock,
  ShieldCheck
} from "lucide-react";

export default function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { landingPages, updateLandingPage, deleteLandingPage } = useStore();

  const lp = landingPages.find((p) => p.id === id);

  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [promoPrice, setPromoPrice] = useState(0);
  const [normalPrice, setNormalPrice] = useState(0);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [theme, setTheme] = useState<LandingPageTheme>("EMERALD");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (lp) {
      setTitle(lp.title);
      setHeadline(lp.hero.headline);
      setSubheadline(lp.hero.subheadline);
      setPromoPrice(lp.pricing.promoPrice);
      setNormalPrice(lp.pricing.normalPrice);
      setHeroImageUrl(lp.hero.heroImageUrl || "");
      setTheme(lp.theme);
      setMetaPixelId(lp.pixels?.metaPixelId || "");
      setTiktokPixelId(lp.pixels?.tiktokPixelId || "");
    }
  }, [lp]);

  if (!lp) {
    return (
      <div className="p-8 text-center text-white">
        <p>Landing page tidak ditemukan.</p>
        <Link href="/dashboard/landing-pages" className="text-emerald-400 text-sm underline mt-2 inline-block">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const discountPercent = normalPrice > promoPrice ? Math.round(((normalPrice - promoPrice) / normalPrice) * 100) : 0;

    updateLandingPage(id, {
      title,
      theme,
      hero: {
        ...lp.hero,
        headline,
        subheadline,
        heroImageUrl,
      },
      pricing: {
        ...lp.pricing,
        promoPrice,
        normalPrice,
        discountPercent,
      },
      pixels: {
        metaPixelId,
        tiktokPixelId,
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/landing-pages"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar</span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              lp.isPublished
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {lp.isPublished ? "Terbit" : "Draft"}
          </span>

          <button
            type="button"
            onClick={() => updateLandingPage(id, { isPublished: !lp.isPublished })}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              lp.isPublished
                ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <span>{lp.isPublished ? "Jadikan Draft" : "Terbitkan Sekarang"}</span>
          </button>

          <Link
            href={`/lp/${lp.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 text-emerald-400" />
            <span>Lihat Halaman Publik</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>

          <button
            onClick={() => {
              if (confirm("Hapus landing page ini secara permanen?")) {
                deleteLandingPage(id);
                router.push("/dashboard/landing-pages");
              }
            }}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-white">Edit Landing Page</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                URL: <span className="font-mono text-emerald-400">/lp/{lp.slug}</span>
              </p>
            </div>

            {isSaved && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Check className="h-3.5 w-3.5" />
                Tersimpan!
              </span>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Internal Landing Page
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Hero Headline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Headline Utama (Hook Penjualan)
            </label>
            <textarea
              rows={2}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Subheadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Subheadline (Deskripsi Pembuka)
            </label>
            <textarea
              rows={2}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Harga Promo (Rp)
              </label>
              <input
                type="number"
                value={promoPrice}
                onChange={(e) => setPromoPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Harga Coret Normal (Rp)
              </label>
              <input
                type="number"
                value={normalPrice}
                onChange={(e) => setNormalPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Link Foto Utama (URL Gambar)
            </label>
            <input
              type="text"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tema Visual
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
                  onClick={() => setTheme(th.id as LandingPageTheme)}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-medium transition-all ${
                    theme === th.id
                      ? "border-emerald-500 bg-emerald-500/15 text-white"
                      : "border-slate-800 bg-slate-800/40 text-slate-400"
                  }`}
                >
                  <span className={`h-3.5 w-3.5 rounded-full ${th.color}`} />
                  <span>{th.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tracking Pixels Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Tracking Pixel Iklan (TikTok & Meta Ads)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Otomatis mentrack event <code>PageView</code>, <code>InitiateCheckout</code>, dan <code>Purchase</code> untuk optimasi algoritma iklan Anda.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Meta Pixel ID (Facebook / Instagram)
              </label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="Contoh: 123456789012345"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                TikTok Pixel ID
              </label>
              <input
                type="text"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="Contoh: C8ABCDEF12345678"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/landing-pages"
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
