"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, Wallet, Zap, ArrowRight, ShieldCheck, TrendingUp, Truck,
  QrCode, CheckCircle2, ExternalLink, Store, Sparkles, Calculator,
  ChevronDown, Check, Smartphone, Layers, Clock, DollarSign,
  MessageSquare, HelpCircle, BarChart3, Flame, Award, Crown, Percent
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const [monthlyOrders, setMonthlyOrders] = useState(200);
  const [averageOrderValue, setAverageOrderValue] = useState(120000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
  const marketplaceFeeTotal = totalMonthlyGMV * 0.10; // Rata-rata fee Shopee / TikTok 10%
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
      a: "Paket Non-Pro tanpa biaya sewa bulanan (Rp 0/bulan) dengan biaya per transaksi Rp 1.000/order, cocok untuk toko yang baru mulai. Sedangkan Pro Member (Rp 99.000/bulan) memberikan diskon transaksi 75% (hanya Rp 250/order), bebas watermark, bisa pasang TikTok/Meta Pixel untuk iklan, dan dapat bonus 100 kuota order pertama!",
    },
    {
      q: "Kapan waktu yang tepat untuk upgrade ke Pro Member?",
      a: "Begitu penjualan toko Anda mencapai minimal 132 pesanan per bulan (hanya sekitar 4-5 paket baju per hari). Di titik ini, penghematan biaya transaksi Rp 750/order sudah langsung menutupi seluruh biaya sewa Rp 99.000. Artinya langganan Pro Anda 100% BALIK MODAL dan selebihnya Anda untung lebih banyak!",
    },
    {
      q: "Apakah uang hasil penjualan pembeli dipotong persenan oleh KoZa Bisnis?",
      a: "SAMA SEKALI TIDAK! Berbeda dari marketplace atau platform lain yang memotong 3% - 12% dari omset kotor, di KoZa Bisnis uang pembeli 100% langsung masuk ke rekening bank, QRIS, atau WhatsApp Anda sendiri. Kami hanya mengenakan biaya sistem flat yang sangat murah (Rp 1.000 untuk Non-Pro atau Rp 250 untuk Pro).",
    },
    {
      q: "Bagaimana cara pembeli belanja baju di toko bio link saya?",
      a: "Sangat simpel! Pembeli klik link bio toko Anda, pilih varian baju/produk, masukkan kecamatan alamat kirim (ongkir kurir J&T, JNE, SiCepat langsung terhitung otomatis), lalu klik tombol bayar via QRIS toko Anda atau checkout instan ke WhatsApp Anda.",
    },
    {
      q: "Apakah kuota order saya bisa hangus di akhir bulan?",
      a: "TIDAK PERNAH HANGUS! Seluruh kuota transaksi yang Anda beli aktif selamanya sampai habis terpakai untuk memproses pesanan pembeli.",
    },
    {
      q: "Bagaimana KoZa Bisnis menghitung laba bersih toko saya secara otomatis?",
      a: "Anda cukup memasukkan harga modal (HPP rahasia) saat upload produk. Setiap kali ada pesanan masuk, sistem otomatis mengurangi Omset dengan HPP dan Biaya Operasional (seperti packing/ongkir/iklan). Anda langsung tahu keuntungan bersih murni toko tanpa perlu rumus Excel!",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-3.5 flex items-center justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
              K
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">KoZa</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20 tracking-wider">
                BISNIS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#kalkulator" className="hover:text-emerald-400 transition-colors">Kalkulator Penghematan</a>
            <a href="#harga" className="hover:text-emerald-400 transition-colors">Paket & Harga</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">Tanya Jawab</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors hidden md:flex items-center gap-1.5"
            >
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <span>Demo Toko</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all active:scale-95"
              >
                <span>Dashboard Penjual</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-slate-200 hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-slate-800/80 border border-slate-700/80 transition-all"
                >
                  Masuk
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 sm:px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all active:scale-95"
                >
                  <span>Daftar Toko</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section — Anti-Slop Minimalist & Editorial Architecture */}
      <section className="relative pt-6 sm:pt-14 pb-14 sm:pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-5 sm:space-y-8">
        {/* Subtle dot grid pattern background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_25%,#000_70%,transparent_100%)]" />

        {/* Eyebrow Beacon */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 sm:px-3.5 py-1.5 text-xs text-slate-300 shadow-sm backdrop-blur max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider text-slate-400">Sistem Toko Mandiri</span>
            <span className="hidden sm:inline h-3 w-px bg-slate-700/80" />
            <span className="text-[11px] sm:text-xs text-slate-200 font-medium whitespace-nowrap">
              0% Potongan Omset • Uang Langsung ke Rekening
            </span>
          </div>
        </div>

        {/* Headline & Body Copy */}
        <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.18] sm:leading-[1.12]">
            Toko bio link untuk penjual mandiri.{" "}
            <span className="text-slate-400 font-semibold block sm:inline">
              Terima pesanan langsung, simpan 100% omset.
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto px-1 sm:px-0">
            Tinggalkan potongan komisi marketplace 8–12%. Terima pesanan dari TikTok & Instagram langsung ke rekening atau WhatsApp Anda — lengkap dengan tarif kurir otomatis se-Indonesia dan rekap laba bersih per produk.
          </p>
        </div>

        {/* High-Converting CTAs */}
        <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3 pt-1">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-7 py-3 sm:py-3.5 text-sm transition-all active:scale-95 shadow-sm"
              >
                <span>Buka Dashboard Penjual</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-7 py-3 sm:py-3.5 text-sm transition-all active:scale-95 shadow-sm"
                >
                  <span>Buka Toko Gratis</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {/* Desktop-only secondary Masuk button (on mobile, Masuk is already in the sticky header) */}
                <Link
                  href="/login"
                  className="hidden sm:inline-flex w-auto items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-5 py-3.5 text-sm transition-all"
                >
                  <span>Masuk</span>
                </Link>
              </>
            )}

            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800/90 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white font-medium px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm transition-all"
            >
              <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              <span>Lihat Live Demo Toko</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-300 pt-0.5">
            <span className="flex items-center gap-1.5">
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" /> 10 order uji coba gratis
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" /> Tanpa kartu kredit
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" /> Siap dalam 2 menit
            </span>
          </div>
        </div>

        {/* Centerpiece Showcase: Real Product Flow & Financial Ledger */}
        <div className="mt-6 sm:mt-8 rounded-2xl border border-slate-800/90 bg-slate-900/40 p-3.5 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-sm">
          {/* Frame Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pb-4 sm:pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-700" />
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-700" />
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-slate-700" />
              </div>
              <span className="text-xs font-semibold text-slate-300 ml-1 sm:ml-2">Simulasi Nyata Transaksi Toko</span>
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-emerald-400 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Uang Penjualan 100% Langsung Masuk ke Rekening</span>
            </div>
          </div>

          {/* Dual Perspective Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 pt-4 sm:pt-6 text-left">
            {/* Left Perspective: Buyer Checkout Experience */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 sm:p-5 flex flex-col justify-between space-y-3.5 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                      HC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">hijabcantik.id</div>
                      <div className="text-[11px] text-slate-300">Katalog Resmi Toko Bio Link</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    ONLINE
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/70">
                    <div className="text-xs">
                      <div className="font-semibold text-slate-100">Pashmina Silk Premium (Espresso)</div>
                      <div className="text-[11px] text-slate-300">1x varian Espresso • 180x75cm</div>
                    </div>
                    <div className="text-xs font-mono font-bold text-white">Rp 89.000</div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <div className="text-xs">
                        <div className="text-slate-200 font-medium">J&T Express (Regular)</div>
                        <div className="text-[11px] text-slate-300">Kec. Gambir, Jakarta Pusat (Otomatis)</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-200 font-medium">Rp 9.000</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/70 space-y-2">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-slate-300 font-medium">Total Pembayaran Pembeli</span>
                  <span className="text-sm font-bold text-white font-mono">Rp 98.000</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dibayar via QRIS Langsung ke Rekening Pemilik Toko</span>
                </div>
              </div>
            </div>

            {/* Right Perspective: Real Financial Comparison per Order */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 sm:p-5 flex flex-col justify-between space-y-3.5 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Simulasi Untung Bersih per Paket
                  </span>
                  <span className="text-[11px] text-slate-300">Contoh 1 Paket Hijab</span>
                </div>

                <div className="mt-3 space-y-2">
                  {/* Marketplace comparison */}
                  <div className="p-2.5 rounded-lg bg-red-950/15 border border-red-900/30 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Marketplace Biasa (Potongan Fee ~10% + Layanan)</span>
                      <span className="text-red-400 font-mono font-semibold">-Rp 10.800</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-red-950/40">
                      <span className="text-slate-200">Penjual Terima Bersih:</span>
                      <span className="font-mono font-semibold text-slate-200">Rp 87.200 <span className="text-[10px] text-slate-400">(Uang ditahan 3-5 hari)</span></span>
                    </div>
                  </div>

                  {/* KoZa comparison */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200 font-medium">KoZa Bisnis Pro (Biaya Flat Hanya Rp 250)</span>
                      <span className="text-emerald-400 font-mono font-bold">-Rp 250</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-emerald-900/30">
                      <span className="text-emerald-300 font-semibold">Penjual Terima Bersih:</span>
                      <span className="font-mono font-bold text-emerald-400">Rp 97.750 <span className="text-[10px] text-emerald-400 font-medium">(Langsung Masuk Rekening)</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/70">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">Keuntungan Tambahan Anda:</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    +Rp 10.550 Lebih Banyak per Paket
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Architectural 4-Value Pillar Strip */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>0% Potongan Omset</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Uang pembeli 100% langsung masuk ke rekening bank atau QRIS pribadi tanpa potongan persenan.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Ongkir Kurir Otomatis</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Tarif resmi J&T, JNE, dan SiCepat terhitung otomatis hingga tingkat kecamatan se-Indonesia.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <BarChart3 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Hitung Laba Otomatis</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Sistem otomatis mengurangkan harga modal setiap ada pesanan masuk, keuntungan bersih langsung tercatat.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Checkout 3 Ketukan</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Pembeli langsung pesan lewat link bio ke WhatsApp atau QRIS tanpa wajib bikin akun yang rumit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section id="kalkulator" className="py-16 px-4 sm:px-6 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Calculator className="h-3.5 w-3.5" />
              <span>Simulasi Finansial Riil</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Berapa Uang yang Anda Selamatkan Setiap Bulan?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Bandingkan potongan kejam 10% di marketplace dengan KoZa Bisnis Non-Pro (Rp 1.000/tx) dan Pro Member (Rp 250/tx).
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slider 1: Jumlah Order */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Jumlah Pesanan per Bulan:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{monthlyOrders} Paket</span>
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

              {/* Slider 2: Rata-rata Harga Baju */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Rata-rata Harga Jual Produk:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">{formatRupiah(averageOrderValue)}</span>
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
                  <span>Standar Olshop Baju</span>
                  <span>Rp400.000</span>
                </div>
              </div>
            </div>

            {/* Perbandingan 3 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* Kolom 1: Marketplace */}
              <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-4 text-center space-y-1">
                <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Marketplace (Fee 10%)</div>
                <div className="text-xl sm:text-2xl font-black text-red-300">{formatRupiah(marketplaceFeeTotal)}</div>
                <div className="text-[11px] text-slate-400">Potongan hilang sia-sia</div>
              </div>

              {/* Kolom 2: KoZa Non-Pro */}
              <div className={`rounded-2xl border p-4 text-center space-y-1 transition-all ${
                !isProBetter 
                  ? "border-emerald-500/50 bg-emerald-950/20 shadow-lg" 
                  : "border-slate-800 bg-slate-950/60 opacity-80"
              }`}>
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span>KoZa Non-Pro</span>
                  {!isProBetter && <span className="rounded bg-emerald-500/20 text-emerald-400 px-1 text-[9px]">PILIHAN TEPAT</span>}
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-200">{formatRupiah(nonProTotalFee)}</div>
                <div className="text-[11px] text-slate-400">Rp0 sewa + Rp1.000/tx</div>
              </div>

              {/* Kolom 3: KoZa Pro (HEMAT 75%) */}
              <div className={`rounded-2xl border-2 p-4 text-center space-y-1 relative transition-all ${
                isProBetter 
                  ? "border-emerald-500 bg-gradient-to-b from-emerald-950/40 to-slate-900 shadow-xl shadow-emerald-500/10" 
                  : "border-slate-800 bg-slate-950/60"
              }`}>
                {isProBetter && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[9px] font-black text-slate-950 uppercase tracking-wider shadow">
                      ★ PALING CUAN & HEMAT 75%
                    </span>
                  </div>
                )}
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider pt-1">KoZa Pro Member</div>
                <div className="text-xl sm:text-2xl font-black text-white">{formatRupiah(proTotalFee)}</div>
                <div className="text-[11px] text-emerald-300 font-semibold">Rp99rb sewa + Cuma Rp250/tx</div>
              </div>
            </div>

            {/* Rekomendasi Pintar Titik Impas */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/50 via-slate-950 to-emerald-950/50 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    {isProBetter ? "Rekomendasi Cerdas: Upgrade ke Pro Member!" : "Rekomendasi Cerdas: Mulai dari Non-Pro!"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isProBetter ? (
                    <>
                      Dengan volume <strong>{monthlyOrders} order/bulan</strong>, Anda hemat tambahan <strong className="text-emerald-400">{formatRupiah(proSavingsOverNonPro)}</strong> dibanding Non-Pro. 
                      Biaya sewa Rp 99.000 Anda <span className="underline decoration-emerald-400 font-bold">100% sudah balik modal</span> hanya dari penghematan biaya transaksi!
                    </>
                  ) : (
                    <>
                      Karena toko Anda masih di bawah 132 order/bulan, paket <strong>Non-Pro (Rp 0 sewa)</strong> adalah pilihan paling hemat untuk merintis toko tanpa risiko biaya bulanan.
                    </>
                  )}
                </p>
              </div>

              <div className="text-center sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Uang Diselamatkan vs Marketplace</div>
                <div className="text-2xl font-black text-emerald-400">+{formatRupiah(totalSavings)}</div>
                <div className="text-[10px] text-emerald-300 font-semibold">Hemat {savingsPercent}% Keuntungan Bersih!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Non-Pro Rp1.000 vs Pro Rp99rb + Rp250) */}
      <section id="harga" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Pilihan Paket Fleksibel</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Pilih Paket Sesuai Skala Penjualan Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Mulai dari Non-Pro tanpa biaya sewa bulanan, atau upgrade ke Pro Member untuk menghemat 75% biaya transaksi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-4">
          {/* Card 1: Non-Pro Starter */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between space-y-6 shadow-xl hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-300 border border-slate-700">
                Bebas Biaya Bulanan
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">Non-Pro (Starter)</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">Rp0</span>
                  <span className="text-xs text-slate-400 font-semibold">/ bulan</span>
                </div>
                <div className="mt-1 text-xs text-slate-300 font-semibold">Biaya Transaksi: <strong className="text-emerald-400 font-bold">Rp 1.000</strong> / order</div>
              </div>

              <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-center space-y-1">
                <div className="text-2xl font-black text-white">10 Order</div>
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
                  <span>Checkout WhatsApp & QRIS Toko Sendiri</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Pencatatan omset & laba kotor dasar</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500">
                  <span>Watermark "Powered by KoZa Bisnis"</span>
                </li>
              </ul>
            </div>

            <Link
              href={isLoggedIn ? "/dashboard" : "/register"}
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-700 transition-colors shadow-sm block"
            >
              {isLoggedIn ? "Buka Dashboard (Non-Pro)" : "Mulai Gratis (Daftar Toko)"}
            </Link>
          </div>

          {/* Card 2: Pro Member (HEMAT 75%) - Paling Populer */}
          <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-900 p-7 flex flex-col justify-between space-y-6 shadow-2xl relative md:-translate-y-3">
            {/* Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 flex items-center gap-1.5">
              <span className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-4 py-1.5 text-[11px] font-black text-slate-950 shadow-lg shadow-emerald-500/30 uppercase tracking-wider">
                ★ Paling Populer & Terlaris
              </span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-black text-emerald-400 border border-emerald-500/40">
                  🔥 HEMAT 75% BIAYA TRANSAKSI
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Pro Member</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">Rp 199.000</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">Rp99.000</span>
                  <span className="text-xs text-slate-400 font-semibold">/ bulan</span>
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <span>Biaya Transaksi:</span>
                  <span className="line-through text-slate-500 text-[11px]">Rp 1.000</span>
                  <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black text-xs">Rp 250 / tx</span>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-950/60 p-4 border border-emerald-500/30 text-center space-y-1">
                <div className="text-2xl font-black text-emerald-300">+100 BONUS Order</div>
                <div className="text-xs text-slate-300 font-medium">Langsung Aktif Saat Upgrade Pro</div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 font-bold" />
                  <span className="font-semibold text-emerald-300">Hemat 75% Biaya Transaksi (Rp 250/order)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>100% Bebas Watermark</strong> (Brand toko Anda sendiri)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>TikTok Pixel & Meta Pixel</strong> Aktif (Wajib untuk Iklan)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Buku Kas Lengkap (Omset, HPP & Biaya Ops)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Ekspor Laporan Keuangan Excel / CSV</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Prioritas Dukungan CS WhatsApp 24/7</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                href="/dashboard/topup?pkg=PRO_MONTHLY"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black text-center hover:brightness-110 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 block"
              >
                Pilih Pro Member (Diskon 75%)
              </Link>
              <div className="text-center text-[10px] text-slate-400">
                Balik modal hanya butuh 4 paket/hari!
              </div>
            </div>
          </div>

          {/* Card 3: Pro Tahunan (Sultan) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-7 flex flex-col justify-between space-y-6 shadow-xl hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[11px] font-bold text-purple-300 border border-purple-500/30">
                  SUPER HEMAT 80%
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Pro Tahunan (Sultan)</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xs text-slate-500 line-through">Rp 1.188.000</span>
                  <span className="text-3xl font-extrabold text-white">Rp799.000</span>
                  <span className="text-xs text-slate-400 font-semibold">/ tahun</span>
                </div>
                <div className="mt-1 text-xs text-purple-400 font-semibold">Setara cuma Rp 66.500/bulan (Cuma Rp 200/tx)</div>
              </div>

              <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800 text-center space-y-1">
                <div className="text-2xl font-black text-purple-300">+500 BONUS Order</div>
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
                  <span>Konsultasi 1-on-1 Optimasi Iklan & Konversi Toko</span>
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

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            <p className="text-xs sm:text-sm text-slate-400">Segala hal yang perlu Anda ketahui tentang KoZa Bisnis & skema hemat 75%.</p>
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

      {/* Bottom Final Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Siap Menghemat Jutaan Rupiah dari Potongan Marketplace?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Buka toko online bio link Anda sekarang. Mulai gratis tanpa sewa di Non-Pro, atau nikmati hemat 75% biaya transaksi di Pro Member.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/30 hover:brightness-110 transition-all active:scale-95"
              >
                <span>Buka Dashboard Toko Anda</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/30 hover:brightness-110 transition-all active:scale-95"
                >
                  <span>Daftar Toko Gratis Sekarang</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
                >
                  <span>Sudah Punya Akun? Masuk</span>
                </Link>
              </>
            )}

            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            >
              <span>Lihat Demo Toko</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">K</div>
            <span className="font-bold text-slate-300">KoZa Bisnis</span>
            <span>• Solusi Toko Bio Link & Pembukuan UMKM Indonesia</span>
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
    </div>
  );
}
