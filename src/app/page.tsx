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
  HelpCircle,
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const [monthlyOrders, setMonthlyOrders] = useState(200);
  const [averageOrderValue, setAverageOrderValue] = useState(120000);
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(20);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

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

  // Kalkulasi Finansial 2.0
  const totalMonthlyGMV = monthlyOrders * averageOrderValue;
  const marketplaceFeeTotal = totalMonthlyGMV * (marketplaceFeePercent / 100);
  const basicTotalFee = 75000; // Flat Rp 75.000 / bulan, 0% komisi
  const proAITotalFee = 329000; // Flat Rp 329.000 / bulan, 0% komisi + 3 Karyawan AI
  
  // Penghematan riil KoZa Basic terhadap Marketplace
  const basicSavings = Math.max(0, marketplaceFeeTotal - basicTotalFee);
  const basicSavingsPercent = marketplaceFeeTotal > 0 ? Math.round((basicSavings / marketplaceFeeTotal) * 100) : 0;

  // Nilai efisiensi staf AI (Admin CS Rp 1,5 Jt + Desainer Landing Page Rp 1 Jt = Rp 2.500.000/bln)
  const replacedStaffValue = 2500000;
  const proAITotalBenefit = (marketplaceFeeTotal + replacedStaffValue) - proAITotalFee;

  const faqs = [
    {
      category: "Pilihan Paket & Biaya",
      q: "Apa bedanya Paket Basic (Rp 75.000/bln) dan Pro AI (Rp 329.000/bln)?",
      points: [
        {
          title: "Paket Basic (Rp 75.000/bulan):",
          desc: "Toko online bio link mandiri lengkap dengan kalkulator ongkir otomatis se-Indonesia, checkout WhatsApp & QRIS, pembukuan laba bersih, dan 0% komisi transaksi (terdapat watermark micro-branding 'Powered by KoZa').",
        },
        {
          title: "Paket Pro AI (Rp 329.000/bulan):",
          desc: "Solusi autopilot 100% White-Label (tanpa watermark), custom domain (namatoko.com), pixel TikTok & Meta, serta 3 Karyawan AI Otonom: Jaga AI CS WhatsApp 24/7, generator 3 landing page iklan per bulan, dan AI content scheduler.",
        },
      ],
    },
    {
      category: "Filosofi Bisnis",
      q: "Mengapa KoZa mengenakan biaya flat bulanan, bukan potongan komisi per penjualan?",
      points: [
        {
          title: "Bebas Berkembang Tanpa Hukuman:",
          desc: "Di marketplace, saat omset Anda naik ke Rp 20–50 Juta, potongan komisi 15%–25% menyedot Rp 3–12 Juta setiap bulan! Di KoZa, omset berapapun uang pembeli 100% langsung masuk ke rekening atau QRIS Anda detik itu juga.",
        },
      ],
    },
    {
      category: "Branding Toko",
      q: "Apa fungsi watermark 'Powered by KoZa' pada Paket Basic?",
      points: [
        {
          title: "Micro-Branding Elegan:",
          desc: "Pada Paket Basic, bagian footer etalase menyertakan badge kecil bertuliskan 'Powered by KoZa Bisnis • Buka Toko 0% Komisi'. Ini membantu kami menjaga biaya langganan sangat terjangkau (Rp 75.000/bulan). Anda bisa upgrade ke Pro AI kapan saja untuk tampilan 100% merek Anda sendiri.",
        },
      ],
    },
    {
      category: "Amunisi AI",
      q: "Bagaimana cara kerja Add-On AI Tokens (Mulai Rp 49.000)?",
      points: [
        {
          title: "Amunisi Tambahan Tanpa Kadaluarsa:",
          desc: "Token add-on digunakan jika Anda membutuhkan output AI ekstra di luar paket bulanan, seperti:",
        },
      ],
      bullets: [
        "10x Foto Model Studio AI (Rp 50.000) — ubah foto produk HP biasa jadi foto model profesional.",
        "3x AI Landing Page (Rp 49.000) — generate landing page iklan konversi tinggi seketika.",
        "1.000 Kuota Chat Jaga AI (Rp 49.000) — ekstra kuota balasan otomatis CS WhatsApp.",
      ],
    },
    {
      category: "Alur Pembelian",
      q: "Bagaimana cara pembeli menyelesaikan pesanan di toko bio link saya?",
      points: [
        {
          title: "Checkout 3 Langkah Cepat:",
          desc: "Pembeli membuka link toko Anda → memilih varian produk → memilih kecamatan tujuan (ongkir J&T, JNE, SiCepat, dll terhitung otomatis) → langsung bayar via QRIS otomatis atau checkout instan ke WhatsApp toko Anda.",
        },
      ],
    },
    {
      category: "Pembukuan",
      q: "Bagaimana KoZa Bisnis menghitung laba bersih toko secara otomatis?",
      points: [
        {
          title: "HPP Rahasia & Laba Seketika:",
          desc: "Cukup cantumkan harga modal (HPP rahasia) saat mengunggah produk. Setiap ada pesanan masuk, sistem otomatis mengurangkan harga jual dengan modal dan biaya operasional. Laba bersih riil langsung tersaji di Dashboard tanpa rumus Excel rumit.",
        },
      ],
    },
    {
      category: "Keamanan Dana",
      q: "Apakah uang pembayaran dari pembeli ditahan oleh pihak KoZa?",
      points: [
        {
          title: "100% Cair Detik Itu Juga:",
          desc: "Sama sekali tidak. KoZa tidak pernah menahan dana Anda (seperti marketplace yang menahan 3–7 hari). Uang transaksi dari QRIS langsung masuk ke rekening bank atau akun e-wallet Anda sendiri detik itu juga.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans pb-24 md:pb-0 transition-colors">
      {/* 1. Header Navbar — Clean, High-Contrast & Precise */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/60 bg-white/90 dark:bg-[#0B0F17]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-7xl px-4 py-3.5 flex items-center justify-between sm:px-6">
          {/* Brand Mark (Dual Theme Logo) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/koza-logo.svg"
              alt="KoZa Bisnis"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02] block dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/koza-logo-white.svg"
              alt="KoZa Bisnis"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02] hidden dark:block"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#realita" className="hover:text-slate-950 dark:hover:text-white transition-colors">Realita Komisi</a>
            <a href="#keunggulan" className="hover:text-slate-950 dark:hover:text-white transition-colors">Keunggulan</a>
            <a href="#kalkulator" className="hover:text-slate-950 dark:hover:text-white transition-colors">Kalkulator Cuan</a>
            <a href="#harga" className="hover:text-slate-950 dark:hover:text-white transition-colors">Paket & Biaya</a>
            <a href="#faq" className="hover:text-slate-950 dark:hover:text-white transition-colors">Tanya Jawab</a>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 transition-all shadow-2xs hidden sm:flex items-center gap-1.5 cursor-pointer"
            >
              <Store className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Demo Toko</span>
              <ArrowUpRight className="h-3 w-3 opacity-60" />
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-2.5 sm:px-3 py-2 rounded-xl transition-colors hidden sm:inline-block cursor-pointer"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
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
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors ml-1 cursor-pointer"
              aria-label="Toggle Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F17]/98 px-5 py-4 space-y-4 shadow-xl backdrop-blur-md">
            <nav className="flex flex-col space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <a
                href="#realita"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <span>Realita Potongan 25%</span>
                <span className="text-[10px] font-mono font-bold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                  Marketplace vs KoZa
                </span>
              </a>
              <a
                href="#keunggulan"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Keunggulan & Fitur
              </a>
              <a
                href="#kalkulator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Kalkulator Cuan
              </a>
              <a
                href="#harga"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Paket & Biaya Transaksi
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Tanya Jawab (FAQ)
              </a>
              <Link
                href="/toko/hijabcantik"
                target="_blank"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lihat Demo Toko Langsung</span>
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </Link>
            </nav>

            {!isLoggedIn && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
                >
                  <span>Buka Toko Gratis Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white cursor-pointer"
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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_60%,transparent_100%)] pointer-events-none" />

        {/* Eyebrow Kicker */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs shadow-xs backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              Direct Commerce No. 1 di Indonesia
            </span>
          </div>
        </div>

        {/* Master Headline & Sharp Subheadline */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-[62px] font-black tracking-tight text-slate-950 dark:text-white leading-[1.14] sm:leading-[1.06] text-balance">
            <span>Jual Langsung ke Pembeli.</span>{" "}
            <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent drop-shadow-xs">
              0% Potongan Komisi.
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto font-normal text-balance px-2 sm:px-0">
            Hentikan potongan komisi 15%–25% di marketplace. Beralih ke toko mandiri bio link: 100% uang pembeli langsung cair ke rekening bank atau QRIS Anda detik itu juga.
          </p>
        </div>

        {/* 3-Second Visual Hook: Direct Reality Card */}
        <div className="mx-auto max-w-md w-full rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xl shadow-emerald-500/5 backdrop-blur-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
            <span>Simulasi Pesanan Rp 100.000</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Uang yang Anda Bawa Pulang</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Marketplace Card */}
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-500/20 p-2.5 text-left space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-800 dark:text-rose-400">
                <span>Marketplace</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-bold">-25%</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-rose-700 dark:text-rose-300 whitespace-nowrap tabular-nums">
                Rp 75.000
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Uang ditahan 3–7 hari
              </p>
            </div>

            {/* KoZa Bisnis Card */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 p-2.5 text-left space-y-1 relative shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                <span>KoZa Bisnis</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black">0% KOMISI</span>
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap tabular-nums">
                Rp 100.000
              </div>
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold leading-tight">
                Detik itu juga cair utuh!
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Conversion Triggers */}
        <div className="flex flex-col items-center justify-center gap-4 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 text-sm transition-all active:scale-95 shadow-md shadow-emerald-600/15 cursor-pointer"
              >
                <span>Buka Dashboard Penjual</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 text-sm transition-all active:scale-95 shadow-md shadow-emerald-600/15 cursor-pointer"
              >
                <span>Buka Toko Gratis Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium px-6 py-3.5 text-sm transition-all shadow-2xs cursor-pointer"
            >
              <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Lihat Demo Toko Langsung</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>

          {/* Micro Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 pb-2 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>0% Potongan Penjualan</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Dana Langsung Masuk Rekening</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Siap Dipakai dalam 2 Menit</span>
            </span>
          </div>
        </div>

        {/* Realita Finansial: Marketplace vs KoZa Bisnis */}
        <div id="realita" className="mt-8 scroll-mt-20 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/50 p-4 sm:p-7 shadow-sm dark:shadow-2xl backdrop-blur-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Realita Finansial: Ke Mana Perginya 25% Omset Anda di Marketplace?
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Contoh nyata pesanan produk senilai Rp 100.000
            </span>
          </div>

          {/* Two-Perspective Grid: Marketplace Traps vs KoZa Freedom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-left">
            {/* Left Card: Marketplace Reality (Shopee / TikTok Shop) */}
            <div className="rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50/40 dark:bg-slate-950/90 p-3.5 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-rose-200 dark:border-slate-800/70 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-xs font-bold text-rose-700 dark:text-rose-400 shrink-0">
                      MP
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Marketplace (Shopee / TikTok)</div>
                      <div className="text-[10px] text-rose-700 dark:text-rose-400 font-medium truncate">Potongan Komisi Wajib Berlapis</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-800 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/50 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                    ● Terpotong Hingga 25%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-rose-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 gap-2">
                    <span className="font-medium">Harga Jual Produk:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 whitespace-nowrap tabular-nums">Rp 100.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-100/50 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-500/20 space-y-2 text-slate-700 dark:text-slate-300 text-[11px]">
                    <div className="flex items-center justify-between gap-2 text-rose-800 dark:text-rose-300">
                      <span className="min-w-0 leading-tight">Biaya Admin Dasar (Kategori Produk):</span>
                      <span className="font-mono font-bold shrink-0 text-right whitespace-nowrap tabular-nums">-Rp 8.500 <span className="text-[10px] font-normal opacity-80">(8.5%)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-rose-800 dark:text-rose-300">
                      <span className="min-w-0 leading-tight">Biaya Program Gratis Ongkir XTRA:</span>
                      <span className="font-mono font-bold shrink-0 text-right whitespace-nowrap tabular-nums">-Rp 5.000 <span className="text-[10px] font-normal opacity-80">(5.0%)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-rose-800 dark:text-rose-300">
                      <span className="min-w-0 leading-tight">Biaya Program Cashback XTRA:</span>
                      <span className="font-mono font-bold shrink-0 text-right whitespace-nowrap tabular-nums">-Rp 3.500 <span className="text-[10px] font-normal opacity-80">(3.5%)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-rose-800 dark:text-rose-300">
                      <span className="min-w-0 leading-tight">Biaya Layanan & Transaksi:</span>
                      <span className="font-mono font-bold shrink-0 text-right whitespace-nowrap tabular-nums">-Rp 1.500</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-rose-800 dark:text-rose-300">
                      <span className="min-w-0 leading-tight">Komisi Affiliate & Promo:</span>
                      <span className="font-mono font-bold shrink-0 text-right whitespace-nowrap tabular-nums">-Rp 6.500 <span className="text-[10px] font-normal opacity-80">(6.5%)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-rose-700 dark:text-rose-400 font-bold pt-2 border-t border-rose-200/80 dark:border-rose-500/20 text-xs">
                      <span>Total Biaya Disedot Marketplace:</span>
                      <span className="font-mono font-black shrink-0 text-right whitespace-nowrap tabular-nums">-Rp 25.000 <span className="text-[10px] font-bold">(25%)</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-rose-200 dark:border-slate-800/70 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Uang Bersih yang Anda Bawa Pulang:</span>
                  <span className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-300 font-mono shrink-0 whitespace-nowrap tabular-nums">
                    Rp 75.000
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2">
                  <span className="font-medium shrink-0">Status Pencairan:</span>
                  <span className="text-rose-700 dark:text-rose-400 font-medium sm:text-right">Ditahan 3–7 hari di saldo aplikasi</span>
                </div>
              </div>
            </div>

            {/* Right Card: KoZa Bisnis Freedom */}
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-slate-950/90 p-3.5 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-slate-800/70 gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      KZ
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Toko Mandiri KoZa Bisnis</div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium truncate">100% Hak & Uang Milik Anda</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                    ● 0% Potongan Komisi
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-emerald-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 gap-2">
                    <span className="font-medium">Harga Jual Produk:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 whitespace-nowrap tabular-nums">Rp 100.000</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-100/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-2 text-slate-700 dark:text-slate-300 text-[11px]">
                    <div className="flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300">
                      <span className="min-w-0 leading-tight">Potongan Komisi Penjualan:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0 text-right whitespace-nowrap tabular-nums">Rp 0 <span className="text-[10px] font-normal opacity-80">(0%)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300">
                      <span className="min-w-0 leading-tight">Biaya Program XTRA / Paksaan:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0 text-right whitespace-nowrap tabular-nums">Rp 0 <span className="text-[10px] font-normal opacity-80">(0%)</span></span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300">
                      <span className="min-w-0 leading-tight">Biaya Layanan & Penanganan:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 shrink-0 text-right whitespace-nowrap tabular-nums">Rp 0</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
                      <span className="min-w-0 leading-tight">Biaya Kuota Sukses (Paket Pro):</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 shrink-0 text-right whitespace-nowrap tabular-nums">Flat Rp 250</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-emerald-700 dark:text-emerald-400 font-bold pt-2 border-t border-emerald-200/80 dark:border-emerald-500/20 text-xs">
                      <span>Total Biaya Sistem:</span>
                      <span className="font-mono font-black shrink-0 text-right whitespace-nowrap tabular-nums">Hanya Rp 250</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-200 dark:border-slate-800/70 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Uang Bersih yang Anda Bawa Pulang:</span>
                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono shrink-0 whitespace-nowrap tabular-nums block">
                      Rp 99.750
                    </span>
                    <span className="block text-[10px] font-bold text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                      +Rp 24.750 lebih untung per order!
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2">
                  <span className="font-medium shrink-0">Status Pencairan:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 sm:text-right">Detik itu juga langsung masuk Rekening / QRIS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Callout Strip */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                💡 Bayangkan jika toko Anda mengirim 300 paket setiap bulan:
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Di marketplace, Anda membakar <strong className="text-rose-600 dark:text-rose-400 whitespace-nowrap">Rp 7.500.000/bulan</strong> hanya untuk potongan komisi & program. Di KoZa, uang itu 100% jadi laba bersih tabungan Anda.
              </p>
            </div>
            <Link
              href="/register"
              className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Selamatkan Margin Anda →
            </Link>
          </div>

          {/* 3 Value Pillars Strip */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/70 grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span>0% Potongan Komisi</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Uang pembeli utuh masuk langsung ke rekening bank atau QRIS Anda tanpa perantara penahan dana.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <span>Tarif Ekspedisi Otomatis</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Terhubung dengan tarif resmi J&T, JNE, SiCepat, dan Kargo hingga tingkat kecamatan se-Indonesia.
              </p>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <div className="h-6 w-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-500/20">
                  <BarChart3 className="h-3.5 w-3.5" />
                </div>
                <span>Pembukuan Laba Seketika</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sistem otomatis mengurangkan harga modal setiap kali pesanan lunas. Laba bersih langsung tersaji.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Keunggulan & Fitur Unggulan — Anti-Slop Editorial */}
      <section id="keunggulan" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ekosistem Bisnis Mandiri</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Semua yang Anda Butuhkan untuk Lepas dari Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Satu sistem lengkap: bio link siap transaksi, cek ongkir kurir se-Indonesia, hingga pembukuan laba otomatis.
          </p>
        </div>

        {/* 6 Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Feature 1: Bio Link Checkout */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Etalase Bio Link Siap Checkout
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bukan sekadar kumpulan link media sosial biasa. Pembeli dapat memilih produk, menentukan varian warna/ukuran, dan langsung menyelesaikan checkout tanpa perlu balas chat bolak-balik.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                Buka 24 jam nonstop
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                Tanpa admin begadang
              </span>
            </div>
          </div>

          {/* Feature 2: 0% Komisi / Direct Settlement */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                100% Uang Masuk Rekening Sendiri
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uang pembayaran pembeli via QRIS atau Transfer Bank langsung cair detik itu juga ke rekening atau e-wallet Anda sendiri. Tidak ada potongan 15%–25% dan tanpa saldo ditahan 7 hari.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                0% Potongan Komisi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                Hak 100% milik Anda
              </span>
            </div>
          </div>

          {/* Feature 3: Ongkir Otomatis Multi-Kurir */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Tarif Ekspedisi Otomatis Se-Indonesia
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Terhubung ke tarif resmi J&T Express, JNE, SiCepat, dan Anteraja. Pembeli memilih kecamatan tujuan, ongkos kirim otomatis terkalkulasi akurat sesuai berat barang.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                J&T, JNE, SiCepat
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                Hingga seluruh kecamatan
              </span>
            </div>
          </div>

          {/* Feature 4: Lacak Resi Publik */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Halaman Pelacakan Resmi (/lacak)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tingkatkan kepercayaan pelanggan dengan halaman pelacakan bermerek nama toko Anda. Pembeli dapat memantau pergerakan kurir secara live tanpa spam tanya resi di chat.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                Live Timeline Ekspedisi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                Auto-Review Bintang 5
              </span>
            </div>
          </div>

          {/* Feature 5: Buku Kas & HPP Otomatis */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Buku Kas & HPP Rahasia Otomatis
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Cukup masukkan harga modal (HPP). Setiap ada pesanan masuk, sistem otomatis menghitung omset kotor, biaya operasional, dan laba bersih riil tanpa rumus Excel rumit.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                Kalkulasi Laba Riil
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                HPP aman tidak bocor
              </span>
            </div>
          </div>

          {/* Feature 6: WhatsApp Order Flow */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs group">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Notifikasi WhatsApp Siap Kirim
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Rincian produk yang dipesan, alamat pengiriman, dan total pembayaran otomatis terformat rapi ke WhatsApp pembeli. Proses konfirmasi dan follow-up jadi jauh lebih cepat.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-500/20">
                Template Rapi Otomatis
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700">
                Follow-up 1-Klik
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Financial Savings Calculator */}
      <section id="kalkulator" className="py-20 px-4 sm:px-6 bg-slate-100/70 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800/80 scroll-mt-20">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulasi Finansial Riil</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Berapa Uang yang Anda Selamatkan Setiap Bulan?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Bandingkan potongan komisi hingga 25% di marketplace dengan tarif flat hemat KoZa Bisnis.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider 1: Jumlah Order */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Volume Pesanan Bulanan:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm font-mono">{monthlyOrders} Paket</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={1000}
                  step={10}
                  value={monthlyOrders}
                  onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
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
                  <span className="text-slate-700 dark:text-slate-300">Rata-rata Harga Produk:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm font-mono">{formatRupiah(averageOrderValue)}</span>
                </div>
                <input
                  type="range"
                  min={40000}
                  max={400000}
                  step={10000}
                  value={averageOrderValue}
                  onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Rp40.000</span>
                  <span>Rata-rata Olshop</span>
                  <span>Rp400.000</span>
                </div>
              </div>
            </div>

            {/* Pilihan Tingkat Potongan Komisi Marketplace */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  <span>Tingkat Potongan Marketplace Toko Anda:</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Akumulasi komisi admin dasar, program Gratis Ongkir Xtra, Cashback Xtra, dan biaya layanan.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {[15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setMarketplaceFeePercent(pct)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      marketplaceFeePercent === pct
                        ? "bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-950 dark:hover:text-white"
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
              <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 p-5 text-center space-y-1.5 shadow-2xs">
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  Marketplace (~{marketplaceFeePercent}%)
                </div>
                <div className="text-2xl font-black text-rose-800 dark:text-rose-300 font-mono tracking-tight whitespace-nowrap">Rp {formatNumber(marketplaceFeeTotal)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Potongan komisi hilang sia-sia</div>
              </div>

              {/* Kolom 2: KoZa Basic */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-slate-900/80 p-5 text-center space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span>KoZa Basic</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-bold">0% KOMISI</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap">Rp {formatNumber(basicTotalFee)}</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Flat Rp 75rb/bln • Bio Link & Ongkir</div>
              </div>

              {/* Kolom 3: KoZa Pro AI */}
              <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-5 text-center space-y-1.5 relative shadow-xs dark:shadow-xl dark:shadow-emerald-500/10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-xs">
                    ★ AUTONOMOUS AI
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">KoZa Pro AI</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap">Rp {formatNumber(proAITotalFee)}</div>
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Rp 329rb/bln • 0% Komisi + 3 Karyawan AI</div>
              </div>
            </div>

            {/* Smart Summary Banner */}
            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Dampak Finansial & Operasional Toko Anda
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Dengan beralih ke <strong>KoZa Basic</strong>, Anda menyelamatkan omset <strong className="text-emerald-700 dark:text-emerald-400 whitespace-nowrap">Rp {formatNumber(basicSavings)}</strong>/bulan dari potongan komisi. Dan dengan <strong>Pro AI</strong>, Anda juga menggantikan biaya staf CS & desainer hingga <strong className="text-emerald-700 dark:text-emerald-400 whitespace-nowrap">Rp {formatNumber(replacedStaffValue)}</strong>/bulan.
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-emerald-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Uang Anda Diselamatkan</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight whitespace-nowrap my-0.5">
                  +Rp {formatNumber(basicSavings)}
                </div>
                <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">Hemat {basicSavingsPercent}% Pengeluaran!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing & Plans Section */}
      <section id="harga" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-10 scroll-mt-20">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Struktur Biaya Transparan & Adil</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Pilihan Paket Sesuai Skala Bisnis Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Pilih paket sesuai kebutuhan untuk menikmati fitur toko mandiri 0% komisi & karyawan AI otonom 24/7.
          </p>

          {/* Toggle Switcher Bulanan vs Tahunan (Style OrderOnline) */}
          <div className="flex items-center justify-center pt-3">
            <div className="inline-flex items-center p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === "annual"
                    ? "bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <span>Tahunan</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black transition-all ${
                  billingCycle === "annual"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                }`}>
                  Hemat 2 Bulan
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-2">
          {/* Card 1: Basic */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-7 flex flex-col justify-between space-y-6 shadow-xs dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {billingCycle === "monthly" ? "Pilihan Hemat Pemula" : "Pilihan Hemat Tahunan"}
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Paket Basic</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  {billingCycle === "annual" && (
                    <span className="text-xs text-slate-400 line-through font-mono">Rp 900.000</span>
                  )}
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {billingCycle === "monthly" ? "Rp75.000" : "Rp750.000"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {billingCycle === "monthly" ? "/ bulan" : "/ tahun"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  {billingCycle === "monthly"
                    ? "0% Komisi Transaksi • Uang 100% Milik Anda"
                    : "Setara Rp 62.500/bln (Hemat Rp 150.000 • Bayar 10 Bulan Gratis 2 Bulan)"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/80 p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {billingCycle === "monthly" ? "10 Order" : "1.200 Order"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {billingCycle === "monthly" ? "Gratis Kuota Uji Coba Pertama" : "Kuota Starter Setahun Penuh"}
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">0% Komisi Transaksi (Uang 100% Milik Anda)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Katalog toko bio link aktif selamanya</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Kalkulator ongkir kurir otomatis se-Indonesia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Checkout WhatsApp & QRIS Toko Langsung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Buku Kas & Pelacakan Resi Publik (/lacak)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>100% Bebas Watermark (Ada <em>Powered by KoZa</em>)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>Dukungan Custom Domain Toko (namatoko.com)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>TikTok Pixel & Meta Pixel Terintegrasi Siap Iklan</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>Jaga AI CS WhatsApp 24/7 (Closing & Lacak Resi Otomatis)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>{billingCycle === "monthly" ? "3x" : "36x"} AI Landing Page Generator Siap Iklan</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>AI Content & Promo Scheduler Otomatis</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  <span>Server Prioritas Cepat & Dukungan VIP 24/7</span>
                </li>
              </ul>
            </div>

            <Link
              href={
                isLoggedIn 
                  ? billingCycle === "monthly" ? "/dashboard" : "/dashboard/topup?pkg=BASIC_ANNUAL"
                  : billingCycle === "monthly" ? "/register" : "/register?plan=BASIC_ANNUAL"
              }
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs block cursor-pointer"
            >
              {billingCycle === "monthly" ? "Mulai Uji Coba Basic" : "Pilih Basic Tahunan (Hemat Rp 150rb)"}
            </Link>
          </div>

          {/* Card 2: Pro AI (Flagship Centerpiece) */}
          <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 p-7 flex flex-col justify-between space-y-6 shadow-md dark:shadow-2xl relative md:-translate-y-3">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
              <span className="rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-black text-white shadow-md uppercase tracking-wider">
                {billingCycle === "monthly" ? "★ Flagship & Autonomous AI" : "★ Paling Populer & Hemat Maksimal"}
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Paket Pro AI</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through font-mono">
                    {billingCycle === "monthly" ? "Rp 499.000" : "Rp 3.948.000"}
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono">
                    {billingCycle === "monthly" ? "Rp329.000" : "Rp2.990.000"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {billingCycle === "monthly" ? "/ bulan" : "/ tahun"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  {billingCycle === "monthly"
                    ? "Setara Mempekerjakan 3 Staf Digital 24 Jam Non-Stop"
                    : "Setara Rp 249.000/bln (Hemat Rp 958.000 • Bayar 10 Bulan Gratis 2 Bulan)"}
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/60 p-3.5 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-1">
                <div className="text-sm font-black text-emerald-900 dark:text-emerald-300">
                  {billingCycle === "monthly" ? "Pangkas Biaya Staf ~Rp 2.500.000/bln" : "Jumbo: +3.000 Order & 36x AI Landing Page"}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300">
                  {billingCycle === "monthly"
                    ? "CS WhatsApp + Desainer Landing Page Otomatis"
                    : "Kuota order & generator landing page aktif 1 tahun penuh"}
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">0% Komisi Transaksi (Sama seperti Basic)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  <span className="font-bold text-slate-900 dark:text-white">100% Bebas Watermark (White-Label Penuh)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold" />
                  <span className="font-bold text-slate-900 dark:text-white">Dukungan Custom Domain Toko (namatoko.com)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>TikTok Pixel & Meta Pixel</strong> Terintegrasi Siap Iklan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span><strong>Jaga AI CS WhatsApp 24/7</strong> (Closing & Lacak Resi Otomatis)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong>{billingCycle === "monthly" ? "3x" : "36x"} AI Landing Page Generator</strong> Siap Iklan
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span><strong>AI Content & Promo Scheduler</strong> Otomatis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Server Prioritas Cepat & Dukungan VIP 24/7</span>
                </li>
              </ul>
            </div>

            <Link
              href={
                isLoggedIn 
                  ? billingCycle === "monthly" ? "/dashboard/topup?pkg=PRO_AI" : "/dashboard/topup?pkg=PRO_ANNUAL"
                  : billingCycle === "monthly" ? "/register" : "/register?plan=PRO_ANNUAL"
              }
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black text-center transition-all shadow-md active:scale-95 block cursor-pointer"
            >
              {billingCycle === "monthly" ? "Pilih Paket Pro AI (Solusi Autopilot)" : "Pilih Pro AI Tahunan (Hemat Rp 958rb)"}
            </Link>
          </div>

          {/* Card 3: Add-On AI Tokens (Bulanan) ATAU Pro Tahunan Sultan (Tahunan) */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-7 flex flex-col justify-between space-y-6 shadow-xs dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            {billingCycle === "monthly" ? (
              <>
                <div className="space-y-4">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    Amunisi Tambahan Fleksibel
                  </span>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add-On AI Tokens</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mulai</span>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">Rp49.000</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ top-up</span>
                    </div>
                    <div className="mt-1 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
                      Beli token sesuai kebutuhan tanpa langganan mahal
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/80 p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <div className="text-sm font-black text-indigo-700 dark:text-indigo-300">Token Aktif Selamanya</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tanpa Batas Kadaluarsa (No Expiry)</div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">10x Foto Model Studio AI (Rp 50.000)</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ubah foto produk biasa jadi foto model katalog profesional.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">3x AI Landing Page (Rp 49.000)</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Generate copywriting + desain halaman siap iklan.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 dark:text-white">1.000 Kuota Chat Jaga AI (Rp 49.000)</strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Bot AI CS WhatsApp untuk melayani tanya ongkir & closing.</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-2 pt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Top-up instan via QRIS langsung dari Dashboard</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={isLoggedIn ? "/dashboard/topup?tab=addon" : "/register"}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs block cursor-pointer"
                >
                  Lihat Menu Add-On Token
                </Link>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    Paket Sultan Setahun Penuh
                  </span>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pro Tahunan (Sultan)</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xs text-slate-400 line-through font-mono">Rp 1.188.000</span>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">Rp799.000</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ tahun</span>
                    </div>
                    <div className="mt-1 text-xs text-indigo-700 dark:text-indigo-400 font-semibold">
                      Setara Rp 66.500/bulan (Cuma Rp 200/tx)
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/80 p-4 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-mono">+500 BONUS Order</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kuota Starter Jumbo Aktif Setahun</div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Semua fitur Pro Member lengkap</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold text-slate-900 dark:text-white">Biaya Transaksi Terendah: Rp 200 / order</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Dukungan <strong>Custom Domain Sendiri</strong> (tokoanda.com)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>100% Bebas Watermark KoZa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Prioritas Dukungan Teknis 24/7</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={isLoggedIn ? "/dashboard/topup?pkg=PRO_ANNUAL" : "/register?plan=PRO_ANNUAL"}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-xs block cursor-pointer"
                >
                  Pilih Paket Sultan (Rp 799rb)
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-100/70 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800 scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Tanya Jawab & Bantuan</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Semua informasi penting seputar sistem toko mandiri 0% komisi, operasional, dan fitur autopilot KoZa Bisnis.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              const itemNum = String(index + 1).padStart(2, "0");
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-emerald-500/50 bg-white dark:bg-slate-900/90 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 sm:gap-4 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
                        {itemNum}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {faq.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                          {faq.q}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 mt-0.5 ${
                        isOpen
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                      {faq.points.map((pt, pIdx) => (
                        <div key={pIdx} className="space-y-0.5">
                          <strong className="block text-slate-900 dark:text-white font-semibold">
                            {pt.title}
                          </strong>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {pt.desc}
                          </p>
                        </div>
                      ))}

                      {faq.bullets && (
                        <ul className="space-y-1.5 pl-4 list-disc text-slate-600 dark:text-slate-300">
                          {faq.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-relaxed">
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* WhatsApp Support Callout Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Masih memiliki pertanyaan yang belum terjawab?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tim spesialis kami siap membantu menghitung potensi margin dan memulai toko mandiri Anda.
              </p>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20KoZa%20Bisnis,%20saya%20ingin%20tanya%20seputar%20toko%20bio%20link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 text-xs transition-all shrink-0 shadow-xs cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Konsultasi CS WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Closing Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-300 dark:border-emerald-500/30 bg-white dark:bg-slate-900/90 p-8 sm:p-12 text-center space-y-6 shadow-sm dark:shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Mulai Jual Langsung Hari Ini
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Buka toko online bio link Anda dalam hitungan menit. Terima uang penjualan utuh tanpa potongan komisi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white transition-all active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <span>Buka Dashboard Penjual</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-8 py-3.5 text-sm font-bold text-white transition-all active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <span>Buka Toko Gratis Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <span>Sudah Punya Akun? Masuk</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 7. Minimalist Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/koza-icon.png" alt="KoZa Bisnis" className="h-6 w-6 object-contain" />
            <span className="font-bold text-slate-900 dark:text-slate-300">KoZa Bisnis</span>
            <span>• Solusi Toko Bio Link Mandiri & Pembukuan Kas</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
            <Link href="/kebijakan-privasi" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/syarat-ketentuan" className="hover:text-slate-950 dark:hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>© {new Date().getFullYear()} KoZa Bisnis</span>
          </div>
        </div>
      </footer>

      {/* 8. Floating Mobile Quick Action Bar (Conversion Booster) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/92 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-4 py-2.5 flex items-center justify-between shadow-2xl safe-area-bottom">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>0% Potongan Komisi</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Uang 100% langsung ke rekening Anda</p>
        </div>

        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Buka Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Buka Toko Gratis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
