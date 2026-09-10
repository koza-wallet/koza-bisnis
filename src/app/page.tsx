"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Store,
  Sparkles,
  Calculator,
  ChevronDown,
  Check,
  Zap,
  BarChart3,
  DollarSign,
  Crown,
  Shield,
  Layers,
  ArrowUpRight,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [monthlyOrders, setMonthlyOrders] = useState(200);
  const [averageOrderValue, setAverageOrderValue] = useState(120000);
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(20);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setIsLoggedIn(true);
      });
    } catch {
      // pass through if client not ready
    }
  }, []);

  // Kalkulasi Finansial
  const totalMonthlyGMV = monthlyOrders * averageOrderValue;
  const marketplaceFeeTotal = totalMonthlyGMV * (marketplaceFeePercent / 100);
  const nonProTotalFee = monthlyOrders * 1000;
  const proTotalFee = 99000 + (monthlyOrders * 250); // Rp99rb sewa + Rp250/tx (HEMAT 75%)
  
  const isProBetter = monthlyOrders >= 132;
  const bestKozaFee = isProBetter ? proTotalFee : nonProTotalFee;
  const totalSavings = marketplaceFeeTotal - bestKozaFee;
  const savingsPercent = Math.round(((marketplaceFeeTotal - bestKozaFee) / marketplaceFeeTotal) * 100);
  const proSavingsOverNonPro = Math.max(0, nonProTotalFee - proTotalFee);

  const faqs = [
    {
      q: "Apa bedanya Paket Non-Pro dan Pro Member?",
      a: "Paket Non-Pro tanpa biaya sewa bulanan (Rp 0/bulan) dengan biaya per transaksi Rp 1.000/order, sangat ideal untuk toko yang baru merintis. Sedangkan Pro Member (Rp 99.000/bulan) memberikan diskon biaya transaksi 75% (hanya Rp 250/order), bebas watermark, akses bot WhatsApp Jaga AI 24/7, integrasi TikTok/Meta Pixel untuk iklan, dan bonus 100 kuota order pertama.",
    },
    {
      q: "Kapan waktu yang paling tepat untuk upgrade ke Pro Member?",
      a: "Begitu penjualan toko Anda mencapai minimal 132 pesanan per bulan (hanya sekitar 4-5 paket per hari). Di titik ini, penghematan transaksi Rp 750/order sudah langsung menutupi seluruh biaya sewa Rp 99.000. Langganan Pro Anda langsung balik modal dan keuntungan bersih Anda jauh lebih besar.",
    },
    {
      q: "Apakah uang hasil penjualan pembeli dipotong persenan oleh KoZa Bisnis?",
      a: "Sama sekali tidak ada potongan persenan. Berbeda dari marketplace konvensional yang memotong 8% hingga 12% dari omset kotor, di KoZa Bisnis uang pembeli 100% langsung masuk ke rekening bank, QRIS, atau WhatsApp Anda sendiri. Sistem hanya mengenakan biaya kuota flat yang sangat terjangkau.",
    },
    {
      q: "Bagaimana cara pembeli menyelesaikan pesanan di bio link saya?",
      a: "Sangat mudah dan cepat. Pembeli membuka link bio toko Anda, memilih produk dan varian, memasukkan kota/kecamatan pengiriman (tarif ongkir kurir J&T, JNE, SiCepat langsung terhitung otomatis), lalu membayar via QRIS toko Anda atau checkout instan ke WhatsApp.",
    },
    {
      q: "Apakah kuota transaksi yang sudah dibeli bisa hangus di akhir bulan?",
      a: "Tidak pernah hangus. Seluruh kuota transaksi yang Anda miliki aktif selamanya sampai habis terpakai untuk melayani pesanan pembeli.",
    },
    {
      q: "Bagaimana KoZa Bisnis menghitung laba bersih toko secara otomatis?",
      a: "Anda cukup mencantumkan harga modal (HPP rahasia) saat mengunggah produk. Setiap ada pesanan masuk, sistem otomatis mengurangkan harga jual dengan HPP dan biaya operasional. Anda langsung dapat melihat laba bersih riil tanpa perlu rumus Excel rumit.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans pb-24 md:pb-0">
      {/* 1. Header Navbar — Clean, High-Contrast & Precise */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3.5 flex items-center justify-between sm:px-6">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black text-sm shadow-sm transition-transform group-hover:scale-105">
              K
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">KoZa</span>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Bisnis
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#realita" className="hover:text-white transition-colors">Realita Komisi</a>
            <a href="#keunggulan" className="hover:text-white transition-colors">Keunggulan</a>
            <a href="#kalkulator" className="hover:text-white transition-colors">Kalkulator Cuan</a>
            <a href="#harga" className="hover:text-white transition-colors">Paket & Biaya</a>
            <a href="#faq" className="hover:text-white transition-colors">Tanya Jawab</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/50 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <span>Demo Toko</span>
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 sm:px-4 py-2 text-xs font-bold text-slate-950 transition-all active:scale-95 shadow-sm"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 sm:px-3 py-2 rounded-lg transition-colors hidden sm:inline-block"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3 sm:px-4 py-2 text-xs font-bold text-slate-950 transition-all active:scale-95 shadow-sm"
                >
                  <span className="hidden sm:inline">Buka Toko Gratis</span>
                  <span className="sm:hidden">Daftar Toko</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-colors ml-1"
              aria-label="Toggle Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/98 px-5 py-4 space-y-4 shadow-2xl">
            <nav className="flex flex-col space-y-2.5 text-xs font-medium text-slate-300">
              <a
                href="#realita"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-slate-900 hover:text-emerald-400 transition-colors"
              >
                <span>Realita Potongan 25%</span>
                <span className="text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                  Marketplace vs KoZa
                </span>
              </a>
              <a
                href="#keunggulan"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-900 hover:text-emerald-400 transition-colors"
              >
                Keunggulan & Fitur
              </a>
              <a
                href="#kalkulator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-900 hover:text-emerald-400 transition-colors"
              >
                Kalkulator Cuan
              </a>
              <a
                href="#harga"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-900 hover:text-emerald-400 transition-colors"
              >
                Paket & Biaya Transaksi
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-900 hover:text-emerald-400 transition-colors"
              >
                Tanya Jawab (FAQ)
              </a>
              <Link
                href="/toko/hijabcantik"
                target="_blank"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <Store className="h-4 w-4 text-emerald-400" />
                <span>Lihat Demo Toko Langsung</span>
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </Link>
            </nav>

            {!isLoggedIn && (
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-slate-950 transition-all shadow"
                >
                  <span>Buka Toko Gratis Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  <span>Sudah Punya Akun? Masuk</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* 2. Master Hero Section — Modern, Minimalist, Elegant, Impeccable */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
        {/* Subtle Architectural Atmosphere */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_60%,transparent_100%)] pointer-events-none" />

        {/* Eyebrow Kicker */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs text-slate-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Direct Commerce
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-medium text-slate-200">
              Toko Bio Link Khusus Penjual Mandiri
            </span>
          </div>
        </div>

        {/* Master Headline & Sharp Subheadline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-[1.12]">
            Jual langsung ke pembeli.{" "}
            <span className="text-slate-400 font-semibold block sm:inline">
              Tanpa potongan komisi sepeser pun.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Hentikan potongan komisi marketplace 15% hingga 25% yang menggerus margin usaha Anda. Beralih ke toko mandiri bio link: 100% uang pembeli langsung masuk rekening Anda detik itu juga tanpa perantara.
          </p>
        </div>

        {/* Action Buttons & Conversion Triggers */}
        <div className="flex flex-col items-center justify-center gap-4 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 text-sm transition-all active:scale-95 shadow-md shadow-emerald-500/15"
              >
                <span>Buka Dashboard Penjual</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 text-sm transition-all active:scale-95 shadow-md shadow-emerald-500/15"
              >
                <span>Buka Toko Gratis Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white font-medium px-6 py-3.5 text-sm transition-all"
            >
              <Store className="h-4 w-4 text-emerald-400" />
              <span>Lihat Demo Toko Langsung</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>

          {/* Micro Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>0% Potongan Penjualan</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Dana Langsung Masuk Rekening</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Siap Dipakai dalam 2 Menit</span>
            </span>
          </div>
        </div>

        {/* Realita Finansial: Marketplace vs KoZa Bisnis */}
        <div id="realita" className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-4 sm:p-7 shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Realita Finansial: Ke Mana Perginya 25% Omset Anda di Marketplace?
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Contoh nyata pesanan produk senilai Rp 100.000
            </span>
          </div>

          {/* Two-Perspective Grid: Marketplace Traps vs KoZa Freedom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
            {/* Left Card: Marketplace Reality (Shopee / TikTok Shop) */}
            <div className="rounded-2xl border border-rose-500/30 bg-slate-950/90 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-400">
                      MP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Marketplace (Shopee / TikTok Shop)</div>
                      <div className="text-[10px] text-rose-400 font-medium">Potongan Komisi & Program Wajib Berlapis</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded-full">
                    ● Terpotong Hingga 25%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-300">
                    <span>Harga Jual Produk:</span>
                    <span className="font-mono font-bold text-white">Rp 100.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/15 border border-rose-500/20 space-y-1.5 text-slate-300 text-[11px]">
                    <div className="flex justify-between text-rose-300">
                      <span>Biaya Admin Dasar (Kategori Produk):</span>
                      <span className="font-mono font-bold">-Rp 8.500 (8.5%)</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>Biaya Program Gratis Ongkir XTRA:</span>
                      <span className="font-mono font-bold">-Rp 5.000 (5.0%)</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>Biaya Program Cashback XTRA:</span>
                      <span className="font-mono font-bold">-Rp 3.500 (3.5%)</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>Biaya Layanan / Penanganan Transaksi:</span>
                      <span className="font-mono font-bold">-Rp 1.500</span>
                    </div>
                    <div className="flex justify-between text-rose-300">
                      <span>Komisi Affiliate / Promo Kampanye:</span>
                      <span className="font-mono font-bold">-Rp 6.500 (6.5%)</span>
                    </div>
                    <div className="flex justify-between text-rose-400 font-bold pt-1.5 border-t border-rose-500/20 text-xs">
                      <span>Total Biaya Disedot Marketplace:</span>
                      <span className="font-mono font-black">-Rp 25.000 (25%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/70 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">Uang Bersih yang Anda Bawa Pulang:</span>
                  <span className="text-lg font-black text-rose-300 font-mono">Rp 75.000</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Status Pencairan:</span>
                  <span className="text-rose-400 font-medium">Ditahan 3–7 hari di saldo aplikasi</span>
                </div>
              </div>
            </div>

            {/* Right Card: KoZa Bisnis Freedom */}
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/90 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                      KZ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Toko Mandiri KoZa Bisnis</div>
                      <div className="text-[10px] text-emerald-400 font-medium">100% Hak & Uang Milik Anda</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                    ● 0% Potongan Komisi
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-300">
                    <span>Harga Jual Produk:</span>
                    <span className="font-mono font-bold text-white">Rp 100.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-slate-300 text-[11px]">
                    <div className="flex justify-between text-emerald-300">
                      <span>Potongan Komisi Penjualan:</span>
                      <span className="font-mono font-bold text-emerald-400">Rp 0 (0%)</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Biaya Program XTRA / Paksaan:</span>
                      <span className="font-mono font-bold text-emerald-400">Rp 0 (0%)</span>
                    </div>
                    <div className="flex justify-between text-emerald-300">
                      <span>Biaya Layanan & Penanganan:</span>
                      <span className="font-mono font-bold text-emerald-400">Rp 0</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Biaya Kuota Sukses KoZa (Paket Pro):</span>
                      <span className="font-mono text-slate-300">Flat Rp 250</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 font-bold pt-1.5 border-t border-emerald-500/20 text-xs">
                      <span>Total Biaya Sistem:</span>
                      <span className="font-mono font-black">Hanya Rp 250</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/70 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-400">Uang Bersih yang Anda Bawa Pulang:</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400 font-mono">Rp 99.750</span>
                    <span className="block text-[10px] font-bold text-emerald-300">+Rp 24.750 lebih untung per order!</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between">
                  <span>Status Pencairan:</span>
                  <span className="font-bold text-emerald-400">Detik itu juga langsung masuk Rekening / QRIS Anda</span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Callout Strip */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">
                💡 Bayangkan jika toko Anda mengirim 300 paket setiap bulan:
              </div>
              <p className="text-xs text-slate-400">
                Di marketplace, Anda membakar <strong className="text-rose-400">Rp 7.500.000/bulan</strong> hanya untuk potongan komisi & program. Di KoZa, uang itu 100% jadi laba bersih tabungan Anda.
              </p>
            </div>
            <Link
              href="/register"
              className="shrink-0 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-xs font-bold transition-all shadow-sm"
            >
              Selamatkan Margin Anda →
            </Link>
          </div>

          {/* 3 Value Pillars Strip */}
          <div className="pt-4 border-t border-slate-800/70 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>0% Potongan Komisi</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uang pembeli utuh masuk langsung ke rekening bank atau QRIS Anda tanpa perantara penahan dana.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Tarif Ekspedisi Otomatis</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Terhubung dengan tarif resmi J&T, JNE, SiCepat, dan Kargo hingga tingkat kecamatan se-Indonesia.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <BarChart3 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Pembukuan Laba Seketika</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sistem otomatis mengurangkan harga modal setiap kali pesanan lunas. Laba bersih langsung tersaji.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Keunggulan & Fitur Unggulan — Anti-Slop Editorial */}
      <section id="keunggulan" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ekosistem Bisnis Mandiri</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Semua yang Anda Butuhkan untuk Lepas dari Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Satu sistem lengkap: bio link siap transaksi, cek ongkir kurir se-Indonesia, hingga pembukuan laba otomatis.
          </p>
        </div>

        {/* 6 Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1: Bio Link Checkout */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Etalase Bio Link Siap Checkout
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bukan sekadar kumpulan link media sosial biasa. Pembeli dapat memilih produk, menentukan varian warna/ukuran, dan langsung menyelesaikan checkout tanpa perlu balas chat bolak-balik.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>Buka 24 jam nonstop</span>
              <span>• Tanpa admin begadang</span>
            </div>
          </div>

          {/* Feature 2: 0% Komisi / Direct Settlement */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                100% Uang Masuk Rekening Sendiri
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uang pembayaran pembeli via QRIS atau Transfer Bank langsung cair detik itu juga ke rekening atau e-wallet Anda sendiri. Tidak ada potongan 15%–25% dan tanpa saldo ditahan 7 hari.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>0% Potongan Komisi</span>
              <span>• Hak 100% milik Anda</span>
            </div>
          </div>

          {/* Feature 3: Ongkir Otomatis Multi-Kurir */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Tarif Ekspedisi Otomatis Se-Indonesia
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Terhubung ke tarif resmi J&T Express, JNE, SiCepat, dan Anteraja. Pembeli memilih kecamatan tujuan, ongkos kirim otomatis terkalkulasi akurat sesuai berat barang.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>J&T, JNE, SiCepat</span>
              <span>• Hingga pelosok kecamatan</span>
            </div>
          </div>

          {/* Feature 4: Lacak Resi Publik */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Halaman Pelacakan Resmi (/lacak)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tingkatkan kepercayaan pelanggan dengan halaman pelacakan bermerek nama toko Anda. Pembeli dapat memantau pergerakan kurir secara live tanpa spam tanya resi di chat.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>Live Timeline Ekspedisi</span>
              <span>• Auto-Review Bintang 5</span>
            </div>
          </div>

          {/* Feature 5: Buku Kas & HPP Otomatis */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Buku Kas & HPP Rahasia Otomatis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cukup masukkan harga modal (HPP). Setiap ada pesanan masuk, sistem otomatis menghitung omset kotor, biaya operasional, dan laba bersih riil tanpa rumus Excel rumit.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>Kalkulasi Laba Riil</span>
              <span>• HPP aman tidak bocor</span>
            </div>
          </div>

          {/* Feature 6: WhatsApp Order Flow */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Notifikasi WhatsApp Siap Kirim
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rincian produk yang dipesan, alamat pengiriman, dan total pembayaran otomatis terformat rapi ke WhatsApp pembeli. Proses konfirmasi dan follow-up jadi jauh lebih cepat.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>Template Rapi Otomatis</span>
              <span>• Follow-up 1-Klik</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Financial Savings Calculator */}
      <section id="kalkulator" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulasi Finansial Riil</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Berapa Uang yang Anda Selamatkan Setiap Bulan?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Bandingkan potongan komisi hingga 25% di marketplace dengan tarif flat hemat KoZa Bisnis.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider 1: Jumlah Order */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Volume Pesanan Bulanan:</span>
                  <span className="text-emerald-400 font-extrabold text-sm font-mono">{monthlyOrders} Paket</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={1000}
                  step={10}
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>20 order/bln</span>
                  <span>~{Math.round(monthlyOrders / 30)} paket/hari</span>
                  <span>1.000 order/bln</span>
                </div>
              </div>

              {/* Slider 2: Rata-rata Harga Produk */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Rata-rata Harga Produk:</span>
                  <span className="text-emerald-400 font-extrabold text-sm font-mono">{formatRupiah(averageOrderValue)}</span>
                </div>
                <input
                  type="range"
                  min={40000}
                  max={400000}
                  step={10000}
                  value={averageOrderValue}
                  onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Rp40.000</span>
                  <span>Rata-rata Olshop</span>
                  <span>Rp400.000</span>
                </div>
              </div>
            </div>

            {/* Pilihan Tingkat Potongan Komisi Marketplace */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>Tingkat Potongan Marketplace Toko Anda:</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Akumulasi komisi admin dasar, program Gratis Ongkir Xtra, Cashback Xtra, dan biaya layanan.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {[15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setMarketplaceFeePercent(pct)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      marketplaceFeePercent === pct
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {pct}% Potongan
                  </button>
                ))}
              </div>
            </div>

            {/* Perbandingan 3 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Kolom 1: Marketplace */}
              <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 text-center space-y-1.5">
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Marketplace (~{marketplaceFeePercent}%)
                </div>
                <div className="text-2xl font-black text-rose-300 font-mono">{formatRupiah(marketplaceFeeTotal)}</div>
                <div className="text-xs text-slate-400">Potongan komisi hilang sia-sia</div>
              </div>

              {/* Kolom 2: KoZa Non-Pro */}
              <div className={`rounded-2xl border p-5 text-center space-y-1.5 transition-all ${
                !isProBetter 
                  ? "border-emerald-500/50 bg-emerald-950/20 shadow-lg" 
                  : "border-slate-800 bg-slate-950/60 opacity-70"
              }`}>
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span>KoZa Non-Pro</span>
                  {!isProBetter && <span className="rounded bg-emerald-500/20 text-emerald-400 px-1 text-[9px]">TEPAT</span>}
                </div>
                <div className="text-2xl font-black text-white font-mono">{formatRupiah(nonProTotalFee)}</div>
                <div className="text-xs text-slate-400">Rp0 sewa + Rp1.000/tx</div>
              </div>

              {/* Kolom 3: KoZa Pro */}
              <div className={`rounded-2xl border-2 p-5 text-center space-y-1.5 relative transition-all ${
                isProBetter 
                  ? "border-emerald-500 bg-gradient-to-b from-emerald-950/40 to-slate-900 shadow-xl shadow-emerald-500/10" 
                  : "border-slate-800 bg-slate-950/60"
              }`}>
                {isProBetter && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider shadow">
                      ★ PALING HEMAT 75%
                    </span>
                  </div>
                )}
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">KoZa Pro Member</div>
                <div className="text-2xl font-black text-white font-mono">{formatRupiah(proTotalFee)}</div>
                <div className="text-xs text-emerald-300 font-semibold">Rp99rb sewa + Cuma Rp250/tx</div>
              </div>
            </div>

            {/* Smart Summary Banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {isProBetter ? "Rekomendasi: Upgrade ke Pro Member" : "Rekomendasi: Mulai dari Paket Non-Pro"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isProBetter ? (
                    <>
                      Dengan volume <strong>{monthlyOrders} pesanan/bulan</strong>, penghematan biaya transaksi Anda mencapai <strong className="text-emerald-400 font-mono">{formatRupiah(proSavingsOverNonPro)}</strong> per bulan.
                    </>
                  ) : (
                    <>
                      Karena toko masih di bawah 132 pesanan/bulan, paket Non-Pro tanpa biaya bulanan adalah langkah awal tanpa risiko.
                    </>
                  )}
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Uang Anda Diselamatkan</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">+{formatRupiah(totalSavings)}</div>
                <div className="text-xs text-emerald-300 font-semibold">Hemat {savingsPercent}% Pengeluaran!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing & Plans Section */}
      <section id="harga" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Struktur Biaya Transparan</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pilihan Paket Sesuai Skala Bisnis Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Mulai gratis di paket Non-Pro tanpa sewa, atau pilih Pro Member untuk hemat 75% biaya transaksi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-2">
          {/* Card 1: Non-Pro Starter */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between space-y-6 shadow-xl hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-300 border border-slate-700">
                Bebas Sewa Bulanan
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Non-Pro (Starter)</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono">Rp0</span>
                  <span className="text-xs text-slate-400 font-semibold">/ bulan</span>
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Tarif Transaksi: <strong className="text-emerald-400 font-bold font-mono">Rp 1.000</strong> / order
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-center space-y-1">
                <div className="text-2xl font-black text-white font-mono">10 Order</div>
                <div className="text-xs text-slate-400 font-medium">Gratis Kuota Uji Coba Pertama</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Katalog toko bio link aktif selamanya</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Kalkulator ongkir kurir otomatis se-Indonesia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Checkout WhatsApp & QRIS Toko Langsung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Halaman Lacak Resi Publik (/lacak)</span>
                </li>
              </ul>
            </div>

            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-700 transition-colors shadow-sm block"
            >
              {isLoggedIn ? "Buka Dashboard" : "Mulai Gratis Sekarang"}
            </Link>
          </div>

          {/* Card 2: Pro Member (HEMAT 75%) */}
          <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 p-7 flex flex-col justify-between space-y-6 shadow-2xl relative md:-translate-y-3">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
              <span className="rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-black text-slate-950 shadow-lg uppercase tracking-wider">
                ★ Paling Populer & Hemat 75%
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-2xl font-black text-white">Pro Member</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 line-through font-mono">Rp 199.000</span>
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">Rp99.000</span>
                  <span className="text-xs text-slate-400 font-semibold">/ bulan</span>
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <span>Biaya Transaksi:</span>
                  <span className="line-through text-slate-500 font-mono text-[11px]">Rp 1.000</span>
                  <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black text-xs font-mono">Rp 250 / tx</span>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-950/60 p-4 border border-emerald-500/30 text-center space-y-1">
                <div className="text-2xl font-black text-emerald-300 font-mono">+100 BONUS Order</div>
                <div className="text-xs text-slate-300 font-medium">Langsung Aktif Saat Upgrade</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 font-bold" />
                  <span className="font-semibold text-emerald-300">Hemat 75% Biaya Transaksi (Rp 250/order)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Asisten Bot AI WhatsApp & Human Takeover</strong> 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>100% Bebas Watermark</strong> (Branding toko eksklusif)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>TikTok Pixel & Meta Pixel</strong> Terintegrasi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Buku Kas Lengkap (Omset, HPP & Biaya Ops)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/topup?pkg=PRO_MONTHLY"
              className="w-full py-3.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black text-center hover:bg-emerald-400 transition-all shadow-lg active:scale-95 block"
            >
              Pilih Pro Member (Hemat 75%)
            </Link>
          </div>

          {/* Card 3: Pro Tahunan (Sultan) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between space-y-6 shadow-xl hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                Paket Setahun Penuh
              </span>

              <div>
                <h3 className="text-xl font-bold text-white">Pro Tahunan (Sultan)</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 line-through font-mono">Rp 1.188.000</span>
                  <span className="text-3xl font-extrabold text-white font-mono">Rp799.000</span>
                  <span className="text-xs text-slate-400 font-semibold">/ tahun</span>
                </div>
                <div className="mt-1 text-xs text-indigo-400 font-semibold">Setara Rp 66.500/bulan (Cuma Rp 200/tx)</div>
              </div>

              <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-center space-y-1">
                <div className="text-2xl font-black text-indigo-300 font-mono">+500 BONUS Order</div>
                <div className="text-xs text-slate-400 font-medium">Kuota Starter Jumbo Aktif Setahun</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Semua fitur Pro Member lengkap</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white">Biaya Transaksi Terendah: Rp 200 / order</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dukungan <strong>Custom Domain Sendiri</strong> (tokoanda.com)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Prioritas Dukungan Teknis 24/7</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/topup?pkg=PRO_ANNUAL"
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-700 transition-colors shadow-sm block"
            >
              Pilih Paket Tahunan
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <p className="text-xs sm:text-sm text-slate-400">Segala informasi yang Anda butuhkan seputar operasional KoZa Bisnis.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-emerald-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Closing Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mulai Jual Langsung Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Buka toko online bio link Anda dalam hitungan menit. Terima uang penjualan utuh tanpa potongan komisi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <span>Buka Dashboard Penjual</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                >
                  <span>Buka Toko Gratis Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
                >
                  <span>Sudah Punya Akun? Masuk</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. Minimalist Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">K</div>
            <span className="font-bold text-slate-300">KoZa Bisnis</span>
            <span>• Solusi Toko Bio Link Mandiri & Pembukuan Kas</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <span className="text-slate-700">•</span>
            <span>© {new Date().getFullYear()} KoZa Bisnis</span>
          </div>
        </div>
      </footer>

      {/* 8. Floating Mobile Quick Action Bar (Conversion Booster) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/92 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2.5 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>0% Potongan Komisi</span>
          </div>
          <p className="text-[10px] text-slate-400">Uang 100% langsung ke rekening Anda</p>
        </div>

        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all active:scale-95"
          >
            <span>Buka Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all active:scale-95"
          >
            <span>Buka Toko Gratis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
