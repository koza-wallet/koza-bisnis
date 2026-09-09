"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag, Wallet, Zap, ArrowRight, ShieldCheck, TrendingUp, Truck,
  QrCode, CheckCircle2, ExternalLink, Store, Sparkles, Calculator,
  ChevronDown, Check, Smartphone, Layers, Clock, DollarSign,
  MessageSquare, HelpCircle, BarChart3, Flame, Award, Crown, Percent
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function LandingPage() {
  const [monthlyOrders, setMonthlyOrders] = useState(200);
  const [averageOrderValue, setAverageOrderValue] = useState(120000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

          <div className="flex items-center gap-3">
            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <span>Demo Toko Bio Link</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all active:scale-95"
            >
              <span>Dashboard Penjual</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-slate-900 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-xl">
          <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
          <span>Stop Terkena Potongan Admin Marketplace 8% – 12%!</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
          Bikin Toko Online Bio Link & <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">Otomatis Catat Laba Bersih</span> dalam 30 Detik
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Katalog kilat untuk bio TikTok & Instagram Anda. Lengkap dengan kalkulator ongkir kurir otomatis (J&T, JNE, SiCepat), checkout WhatsApp/QRIS tanpa dipotong persenan, dan pembukuan laba bersih otomatis.
        </p>

        {/* Highlight Banner Diskon 75% */}
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/10 text-xs sm:text-sm">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider">
            HEMAT 75%
          </span>
          <span className="text-slate-200 font-medium">
            Biaya transaksi Pro cuma <strong className="text-emerald-400 font-extrabold">Rp 250/order</strong> (dibanding Non-Pro Rp 1.000/order)!
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 px-7 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/30 hover:brightness-110 transition-all active:scale-95"
          >
            <span>Mulai Gratis (Dapat 10 Order Uji Coba)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/toko/hijabcantik"
            target="_blank"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
          >
            <Store className="h-4 w-4 text-emerald-400" />
            <span>Lihat Contoh Toko Baju</span>
          </Link>
        </div>

        {/* Micro Value Proposition Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-xs text-slate-400 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Uang 100% Langsung Cair</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Ongkir Otomatis Se-Indonesia</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <Percent className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Pro Hemat 75% Biaya Tx</span>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/40">
            <BarChart3 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Laba Bersih Otomatis</span>
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
              href="/dashboard"
              className="w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-bold text-center hover:bg-slate-700 transition-colors shadow-sm block"
            >
              Mulai Gratis (Non-Pro)
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
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/30 hover:brightness-110 transition-all active:scale-95"
            >
              <span>Daftar Sekarang (10 Order Uji Coba Gratis)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/toko/hijabcantik"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
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
          <div>© {new Date().getFullYear()} KoZa Bisnis. Hak cipta dilindungi.</div>
        </div>
      </footer>
    </div>
  );
}
