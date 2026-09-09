"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store-context";
import { quotaPackages } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { QuotaPackage } from "@/types";
import { PaymentMethodsBanner } from "@/components/payment-methods";
import { PromoBanner } from "@/components/promo-banner";
import { 
  Zap, 
  Check, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  X, 
  CheckCircle2, 
  Info,
  Tag,
  Sparkles,
  Flame,
  Crown,
  Percent,
  ArrowRight
} from "lucide-react";

function QuotaTopupContent() {
  const { store, topupQuota, upgradePlan } = useStore();
  const searchParams = useSearchParams();
  const [selectedPkg, setSelectedPkg] = useState<QuotaPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTierTab, setActiveTierTab] = useState<"PRO" | "NON_PRO">("PRO");

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const isStorePro = store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL";

  useEffect(() => {
    const pkgCode = searchParams.get("pkg");
    if (pkgCode) {
      const match = quotaPackages.find((p) => p.code === pkgCode.toUpperCase());
      if (match) {
        setSelectedPkg(match);
        setActiveTierTab(match.tier);
        setIsModalOpen(true);
      }
    }
  }, [searchParams]);

  const handleSelectPackage = (pkg: QuotaPackage) => {
    setSelectedPkg(pkg);
    setIsSuccess(false);
    setDiscountApplied(false);
    setCouponInput("");
    setCouponError("");
    setIsModalOpen(true);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (code === "KOZACUAN" || code === "DISKON25") {
      setDiscountApplied(true);
      setCouponError("");
    } else {
      setCouponError("Kode kupon tidak valid atau sudah kedaluwarsa.");
      setDiscountApplied(false);
    }
  };

  const calculateFinalPrice = (basePrice: number) => {
    if (discountApplied) {
      return Math.round(basePrice * 0.75); // Diskon 25%
    }
    return basePrice;
  };

  const handleSimulatePayment = () => {
    if (!selectedPkg) return;
    topupQuota(selectedPkg.code);
    setIsSuccess(true);
  };

  const handleUpgradeToPro = () => {
    upgradePlan("PRO_MONTHLY");
    setIsSuccess(true);
  };

  const displayedPackages = quotaPackages.filter((p) => p.tier === activeTierTab);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Promo Announcement Banner */}
      <PromoBanner />

      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto pt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Percent className="h-3.5 w-3.5" />
          <span>Biaya Transaksi Terendah: Rp 250 / order (Hemat 75%)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Isi Ulang Kuota Order & Status Membership
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Setiap paket order laku menggunakan 1 kuota transaksi. Pembeli mentransfer 100% uang belanja langsung ke rekening Anda tanpa potongan persenan.
        </p>
      </div>

      {/* Status Membership & Kuota Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Akun Toko:</span>
            {isStorePro ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-3 py-0.5 text-xs font-black text-slate-950 shadow-sm">
                <Crown className="h-3.5 w-3.5" />
                <span>PRO MEMBER (Aktif)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-300 border border-slate-700">
                <span>NON-PRO (STARTER)</span>
              </span>
            )}
          </div>

          <div className="text-sm sm:text-base text-slate-200">
            {isStorePro ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Tarif Transaksi: <strong>Hanya Rp 250 / order (HEMAT 75%)</strong> • Bebas Watermark
              </span>
            ) : (
              <span className="text-slate-300">
                Tarif Transaksi: <strong>Rp 1.000 / order</strong>. Upgrade ke Pro untuk hemat 75% jadi Rp 250/tx!
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8 text-center sm:text-right shrink-0">
          <div>
            <div className="text-xs text-slate-400 font-medium">Sisa Kuota Order:</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {store.quotaBalance}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Pesanan Tersedia</div>
          </div>

          {!isStorePro && (
            <button
              onClick={handleUpgradeToPro}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Upgrade Pro (Rp 99rb)
            </button>
          )}
        </div>
      </div>

      {/* Tab Filter: Pro (Hemat 75%) vs Non-Pro */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <button
          onClick={() => setActiveTierTab("PRO")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTierTab === "PRO"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Crown className="h-3.5 w-3.5" />
          <span>Paket Pro Member (Rp 250/order - HEMAT 75%)</span>
        </button>

        <button
          onClick={() => setActiveTierTab("NON_PRO")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTierTab === "NON_PRO"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <span>Paket Non-Pro (Rp 1.000/order)</span>
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {displayedPackages.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between space-y-6 transition-all relative ${
                pkg.popular
                  ? "border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/30 to-slate-900 shadow-2xl md:-translate-y-2"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              {/* Badge */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10">
                  <span className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 px-4 py-1.5 text-[11px] font-black text-slate-950 shadow-lg shadow-emerald-500/30 uppercase tracking-wider">
                    ★ PALING LARIS & HEMAT
                  </span>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pkg.name}</span>
                  {pkg.discountPercent && pkg.discountPercent > 0 ? (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                      HEMAT {pkg.discountPercent}%
                    </span>
                  ) : null}
                </div>

                {/* Harga & Strikethrough */}
                <div>
                  <div className="flex items-baseline gap-2">
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatRupiah(pkg.originalPrice)}
                      </span>
                    )}
                    <span className="text-3xl font-black text-white">{formatRupiah(pkg.price)}</span>
                  </div>
                  <div className="mt-1 text-xs text-emerald-400 font-bold">
                    Tarif Cuma {formatRupiah(pkg.pricePerOrder)} per transaksi
                  </div>
                </div>

                {/* Kuota Counter Box */}
                <div className="rounded-2xl bg-slate-950/80 p-4 border border-slate-800/80 text-center space-y-1">
                  <div className="text-3xl font-black text-white">
                    +{pkg.quota}
                  </div>
                  {pkg.bonusOrders ? (
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/20">
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      <span>Termasuk {pkg.bonusOrders} Kuota Bonus</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium">Kuota Transaksi Order</div>
                  )}
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Masa aktif selamanya (tidak pernah hangus)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Uang pembeli 100% langsung cair ke rekening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Perhitungan otomatis laba bersih & buku kas</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPackage(pkg)}
                className={`w-full py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                  pkg.popular
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                <span>Beli via QRIS</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust & Payment Channels Banner */}
      <PaymentMethodsBanner />

      {/* Modal Checkout Simulasi QRIS Midtrans */}
      {isModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {!isSuccess ? (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Midtrans Payment Gateway</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Selesaikan Pembayaran</h3>
                  <p className="text-xs text-slate-400">Scan QRIS resmi di bawah via mobile banking atau e-wallet apa pun.</p>
                </div>

                {/* Box Detail Kuota */}
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Item:</span>
                    <span className="font-bold text-white">{selectedPkg.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Jumlah Kuota:</span>
                    <span className="font-bold text-emerald-400">+{selectedPkg.quota} Order</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Harga Paket:</span>
                    <span className={`font-bold ${discountApplied ? "line-through text-slate-400" : "text-white"}`}>
                      {formatRupiah(selectedPkg.price)}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Diskon Kupon (25%):</span>
                      <span>-{formatRupiah(selectedPkg.price - calculateFinalPrice(selectedPkg.price))}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-white">
                    <span>Total Tagihan:</span>
                    <span className="text-emerald-400 text-lg">
                      {formatRupiah(calculateFinalPrice(selectedPkg.price))}
                    </span>
                  </div>
                </div>

                {/* Form Kupon Diskon */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Punya kode kupon? (Coba: KOZACUAN)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                    >
                      Terapkan
                    </button>
                  </div>
                  {discountApplied && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Kupon KOZACUAN berhasil diterapkan! Hemat 25%.</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-xs text-red-400 font-medium">{couponError}</div>
                  )}
                </form>

                {/* Barcode QRIS */}
                <div className="rounded-2xl border border-slate-800 bg-white p-5 flex flex-col items-center justify-center space-y-3 shadow-inner">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=00020101021226580014ID.LINKAJA.WWW01189360091100212345675204581253033605802ID5911KOZA+BISNIS6007BANDUNG61054013262070703A016304"
                    alt="QRIS Midtrans"
                    className="h-44 w-44 object-contain rounded-lg"
                  />
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">NMID: ID1020039281729</div>
                    <div className="text-[10px] text-slate-500 font-medium">BCA • Mandiri • BRI • BNI • GoPay • OVO • DANA • ShopeePay</div>
                  </div>
                </div>

                {/* Tombol Simulasi Pembayaran Berhasil */}
                <button
                  onClick={handleSimulatePayment}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simulasi: Sudah Scan & Bayar QRIS</span>
                </button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">Pembayaran Berhasil!</h3>
                  <p className="text-xs text-slate-300">
                    Sistem Midtrans telah mengonfirmasi pembayaran Anda. Kuota order toko Anda langsung bertambah secara instan.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Total Kuota Sekarang:</div>
                  <div className="text-3xl font-black text-emerald-400">{store.quotaBalance} Order</div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Tutup & Kembali ke Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat data paket kuota...</div>}>
      <QuotaTopupContent />
    </Suspense>
  );
}
