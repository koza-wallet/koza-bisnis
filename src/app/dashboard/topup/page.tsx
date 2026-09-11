"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useStore } from "@/lib/store-context";
import { quotaPackages, aiTokenPackages } from "@/lib/mock-data";
import { formatRupiah } from "@/lib/utils";
import { QuotaPackage, AITokenPackage } from "@/types";
import { PaymentMethodsBanner } from "@/components/payment-methods";
import { PromoBanner } from "@/components/promo-banner";
import { createClient } from "@/lib/supabase/client";
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
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Plus,
  Minus,
  SlidersHorizontal,
  Lock
} from "lucide-react";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface TopupTransactionRecord {
  id: string;
  order_id: string;
  amount: number;
  package_code: string;
  package_name: string;
  package_type: string;
  quota_amount: number;
  plan_tier?: string;
  status: "PENDING" | "SETTLED" | "EXPIRED" | "FAILED";
  created_at: string;
}

function loadSnapScript(clientKey?: string, isProduction: boolean = false): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.snap) return resolve();

    const scriptId = "midtrans-snap-script";
    const existing = document.getElementById(scriptId) as HTMLScriptElement;
    if (existing) {
      if (window.snap) return resolve();
      existing.onload = () => resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    if (clientKey) {
      script.setAttribute("data-client-key", clientKey);
    }
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat gateway Midtrans Snap"));
    document.body.appendChild(script);
  });
}

function QuotaTopupContent() {
  const { store, refreshStore } = useStore();
  const searchParams = useSearchParams();
  const [selectedPkg, setSelectedPkg] = useState<QuotaPackage | null>(null);
  const [selectedAIToken, setSelectedAIToken] = useState<AITokenPackage | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<{
    code: "BASIC" | "BASIC_ANNUAL" | "PRO_AI" | "PRO_ANNUAL";
    name: string;
    price: number;
    quotaBonus: number;
    duration: string;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isStorePro = store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL";
  const [activeTierTab, setActiveTierTab] = useState<"PRO" | "NON_PRO">(isStorePro ? "PRO" : "NON_PRO");

  // Payment execution state
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [activeOrderId, setActiveOrderId] = useState("");

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Transaction history
  const [transactions, setTransactions] = useState<TopupTransactionRecord[]>([]);
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);

  // Custom Quota input state (for Non-Pro 3rd package option)
  const [customQuotaInput, setCustomQuotaInput] = useState<number>(25);

  useEffect(() => {
    setActiveTierTab(isStorePro ? "PRO" : "NON_PRO");
  }, [isStorePro]);

  const fetchTransactions = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("topup_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setTransactions(data as TopupTransactionRecord[]);
      }
    } catch {
      // Ignored if table not ready yet
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const pkgCode = searchParams.get("pkg");
    if (pkgCode) {
      const codeUpper = pkgCode.toUpperCase();
      if (codeUpper === "PRO_AI" || codeUpper === "PRO_MONTHLY") {
        handleSelectMembership("PRO_AI");
      } else if (codeUpper === "BASIC") {
        handleSelectMembership("BASIC");
      } else if (codeUpper === "BASIC_ANNUAL") {
        handleSelectMembership("BASIC_ANNUAL");
      } else if (codeUpper === "PRO_ANNUAL") {
        handleSelectMembership("PRO_ANNUAL");
      } else {
        const match = quotaPackages.find((p) => p.code === codeUpper);
        if (match) {
          if (match.tier === "PRO" && !isStorePro) {
            handleSelectMembership("PRO_AI");
          } else {
            setSelectedPkg(match);
            setSelectedMembership(null);
            setSelectedAIToken(null);
            setActiveTierTab(match.tier);
            setIsModalOpen(true);
          }
        }
      }
    }
  }, [searchParams, isStorePro]);

  const handleSelectPackage = (pkg: QuotaPackage) => {
    // Proteksi Kuota Pro: Jika user non-pro mencoba beli kuota Pro, wajibkan langganan Pro dulu
    if (pkg.tier === "PRO" && !isStorePro) {
      handleSelectMembership("PRO_AI");
      return;
    }

    setSelectedPkg(pkg);
    setSelectedMembership(null);
    setSelectedAIToken(null);
    setIsSuccess(false);
    setDiscountApplied(false);
    setCouponInput("");
    setCouponError("");
    setPaymentError("");
    setIsModalOpen(true);
  };

  const handleSelectCustomPackage = (quota: number) => {
    const validQuota = Math.max(10, Math.floor(quota || 10));
    const customPkg: QuotaPackage = {
      id: "pkg-nonpro-custom",
      code: "NONPRO_CUSTOM",
      name: `Top-Up Custom (${validQuota} Order)`,
      quota: validQuota,
      price: validQuota * 1000,
      originalPrice: validQuota * 1000,
      pricePerOrder: 1000,
      discountPercent: 0,
      badge: "Suka-Suka",
      tier: "NON_PRO",
    };
    setSelectedPkg(customPkg);
    setSelectedMembership(null);
    setIsSuccess(false);
    setDiscountApplied(false);
    setCouponInput("");
    setCouponError("");
    setPaymentError("");
    setIsModalOpen(true);
  };

  const handleSelectMembership = (tier: "BASIC" | "BASIC_ANNUAL" | "PRO_AI" | "PRO_ANNUAL") => {
    setSelectedPkg(null);
    setSelectedAIToken(null);
    setSelectedMembership({
      code: tier,
      name:
        tier === "PRO_ANNUAL"
          ? "Paket Pro AI Tahunan (1 Tahun)"
          : tier === "BASIC_ANNUAL"
          ? "Paket Basic Tahunan (1 Tahun)"
          : tier === "PRO_AI"
          ? "Paket Pro AI (1 Bulan)"
          : "Paket Basic (1 Bulan)",
      price:
        tier === "PRO_ANNUAL"
          ? 2990000
          : tier === "BASIC_ANNUAL"
          ? 750000
          : tier === "PRO_AI"
          ? 329000
          : 75000,
      quotaBonus:
        tier === "PRO_ANNUAL"
          ? 3000
          : tier === "BASIC_ANNUAL"
          ? 1200
          : tier === "PRO_AI"
          ? 250
          : 100,
      duration: tier === "PRO_ANNUAL" || tier === "BASIC_ANNUAL" ? "365 Hari" : "30 Hari",
    });
    setIsSuccess(false);
    setDiscountApplied(false);
    setCouponInput("");
    setCouponError("");
    setPaymentError("");
    setIsModalOpen(true);
  };

  const handleSelectAIToken = (tokenPkg: AITokenPackage) => {
    setSelectedPkg(null);
    setSelectedMembership(null);
    setSelectedAIToken(tokenPkg);
    setIsSuccess(false);
    setDiscountApplied(false);
    setCouponInput("");
    setCouponError("");
    setPaymentError("");
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

  const getCurrentBasePrice = () => {
    if (selectedPkg) return selectedPkg.price;
    if (selectedMembership) return selectedMembership.price;
    if (selectedAIToken) return selectedAIToken.price;
    return 0;
  };

  const calculateFinalPrice = (basePrice: number) => {
    if (discountApplied) {
      return Math.round(basePrice * 0.75);
    }
    return basePrice;
  };

  const handlePayWithMidtrans = async () => {
    setIsPaying(true);
    setPaymentError("");

    try {
      const packageType = selectedMembership ? "MEMBERSHIP" : selectedAIToken ? "AI_TOKEN" : "QUOTA";
      const packageCode = selectedMembership ? selectedMembership.code : selectedAIToken ? selectedAIToken.code : selectedPkg?.code;

      if (!packageCode) {
        throw new Error("Pilihan paket tidak ditemukan.");
      }

      const res = await fetch("/api/payment/create-snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageCode,
          packageType,
          customQuota: packageCode === "NONPRO_CUSTOM" ? selectedPkg?.quota : undefined,
          couponCode: discountApplied ? couponInput : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Gagal membuat sesi pembayaran Midtrans.");
      }

      setActiveOrderId(data.orderId);

      // Ensure Snap script is ready
      if (!window.snap) {
        await loadSnapScript(data.clientKey, data.isProduction);
      }

      if (!window.snap) {
        throw new Error("SDK Midtrans Snap belum selesai dimuat. Silakan muat ulang halaman.");
      }

      window.snap.pay(data.token, {
        onSuccess: async () => {
          setIsPaying(false);
          await fetch("/api/payment/verify-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId }),
          });
          await refreshStore();
          setIsSuccess(true);
          fetchTransactions();
        },
        onPending: async () => {
          setIsPaying(false);
          fetchTransactions();
        },
        onError: () => {
          setIsPaying(false);
          setPaymentError("Pembayaran gagal diproses oleh gateway.");
          fetchTransactions();
        },
        onClose: async () => {
          setIsPaying(false);
          // Cek status saat ditutup
          try {
            const checkRes = await fetch("/api/payment/verify-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId }),
            });
            const checkData = await checkRes.json();
            if (checkData.settled) {
              await refreshStore();
              setIsSuccess(true);
            }
          } catch {
            // Ignored
          }
          fetchTransactions();
        },
      });
    } catch (err: any) {
      setIsPaying(false);
      setPaymentError(err.message || "Terjadi kesalahan saat memproses pembayaran.");
    }
  };

  const handleVerifyOrder = useCallback(
    async (orderId: string, transactionId?: string) => {
      setCheckingOrderId(orderId);
      try {
        let res = await fetch("/api/payment/verify-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, transactionId }),
        });
        let data = await res.json();

        // Jika belum settled, tunggu 1.5 detik lalu coba sekali lagi (antisipasi lag sinkronisasi gateway)
        if (!data.settled) {
          await new Promise((r) => setTimeout(r, 1500));
          res = await fetch("/api/payment/verify-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, transactionId }),
          });
          data = await res.json();
        }

        if (data.settled) {
          await refreshStore();
          await fetchTransactions();
          setIsSuccess(true);
          setActiveOrderId(orderId);
          setIsModalOpen(true);
        } else {
          await fetchTransactions();
        }
      } catch {
        // Ignored
      } finally {
        setCheckingOrderId(null);
      }
    },
    [refreshStore, fetchTransactions]
  );

  useEffect(() => {
    const orderIdParam = searchParams.get("order_id");
    const txStatusParam = searchParams.get("transaction_status");
    const statusCodeParam = searchParams.get("status_code");
    const txIdParam = searchParams.get("transaction_id");
    const paymentParam = searchParams.get("payment");

    // Jika kembali dari redirect Midtrans (Finish URL)
    if (
      orderIdParam &&
      (txStatusParam || statusCodeParam || paymentParam === "success")
    ) {
      handleVerifyOrder(orderIdParam, txIdParam || undefined);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams, handleVerifyOrder]);

  const displayedPackages = quotaPackages.filter((p) => p.tier === activeTierTab);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Midtrans Snap Preload Script */}
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
      />

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
                <span>PRO AI (Aktif)</span>
              </span>
            ) : store.plan === "BASIC" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold">
                <Check className="h-3.5 w-3.5" />
                <span>BASIC (Aktif)</span>
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
                100% Bebas Watermark • 3 Karyawan AI Otonom • Custom Domain & Pixel Iklan
              </span>
            ) : store.plan === "BASIC" ? (
              <span className="text-slate-300">
                Paket Toko Mandiri: 0% Komisi Transaksi • Upgrade ke Pro AI untuk 3 Karyawan Digital & White-Label!
              </span>
            ) : (
              <span className="text-slate-300">
                Pilih paket Basic (Rp 75rb/bln) atau Pro AI (Rp 329rb/bln) untuk membuka potensi penuh toko Anda.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-8 text-center sm:text-right shrink-0">
          <div>
            <div className="text-xs text-slate-400 font-medium">Sisa Kuota:</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {store.quotaBalance}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Order Tersedia</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Token AI:</div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">
              {store.aiCreditsBalance ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Kredit AI</div>
          </div>

          <div className="flex flex-col gap-1.5">
            {!isStorePro && (
              <button
                onClick={() => handleSelectMembership("PRO_AI")}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
              >
                Upgrade Pro AI (Rp 329rb)
              </button>
            )}
            {store.plan !== "BASIC" && !isStorePro && (
              <button
                onClick={() => handleSelectMembership("BASIC")}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-bold text-[11px] hover:text-white transition-colors whitespace-nowrap"
              >
                Paket Basic (Rp 75rb)
              </button>
            )}
            <button
              onClick={() => handleSelectMembership("PRO_ANNUAL")}
              className="px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-300 font-bold text-[11px] hover:bg-indigo-500/10 transition-colors whitespace-nowrap"
            >
              Pro AI Tahunan (Rp 2.99jt)
            </button>
          </div>
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
          {!isStorePro && (
            <span className="rounded-full bg-slate-950/50 px-2 py-0.5 text-[10px] text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" /> Pro Only
            </span>
          )}
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

      {/* Upsell Banner jika Non-Pro membuka Tab Pro */}
      {activeTierTab === "PRO" && !isStorePro && (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="rounded-2xl bg-amber-500/20 p-2.5 text-amber-400 shrink-0">
              <Crown className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-black text-amber-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Lock className="h-4 w-4" />
                <span>Tarif Kuota Rp 250/order Khusus Member Pro</span>
              </div>
              <div className="text-xs text-slate-300">
                Akun toko Anda saat ini berstatus <strong>NON-PRO</strong>. Berlangganan Pro AI untuk membuka akses kuota super hemat 75% selamanya + 3 Karyawan AI Otonom!
              </div>
            </div>
          </div>
          <button
            onClick={() => handleSelectMembership("PRO_AI")}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Upgrade Pro AI Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

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

              {pkg.tier === "PRO" && !isStorePro ? (
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className="w-full py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-slate-950 hover:brightness-110 shadow-amber-500/20 group"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-900 group-hover:scale-110 transition-transform" />
                  <span>Upgrade Pro untuk Beli (Mulai Rp 99rb)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  }`}
                >
                  <span>Beli Kuota</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {/* Opsi Paket Ke-3 (Khusus Non-Pro): Custom Kuota Bebas (Suka-Suka) */}
        {activeTierTab === "NON_PRO" && (
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 via-slate-900/80 to-emerald-950/20 p-6 flex flex-col justify-between space-y-6 transition-all relative hover:border-emerald-400 shadow-xl">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Custom Kuota Order</span>
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Suka-Suka
                </span>
              </div>

              {/* Harga Realtime Dinamis */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {formatRupiah(Math.max(10, customQuotaInput || 10) * 1000)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-400 font-bold">
                  Tarif Tetap Rp 1.000 per transaksi
                </div>
              </div>

              {/* Kuota Counter & Input Stepper Box */}
              <div className="rounded-2xl bg-slate-950/90 p-4 border border-slate-800 text-center space-y-3">
                <div className="text-xs text-slate-400 font-medium">
                  Tentukan Jumlah Kuota Order:
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomQuotaInput((prev) => Math.max(10, (prev || 10) - 5))}
                    className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors active:scale-95 disabled:opacity-40"
                    disabled={customQuotaInput <= 10}
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      step={5}
                      value={customQuotaInput || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCustomQuotaInput(isNaN(val) ? 0 : val);
                      }}
                      onBlur={() => {
                        if (!customQuotaInput || customQuotaInput < 10) {
                          setCustomQuotaInput(10);
                        }
                      }}
                      className="w-28 text-center py-1.5 px-2 rounded-xl bg-slate-900 border border-emerald-500/40 text-xl font-black text-white focus:outline-none focus:border-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="block text-[10px] text-slate-400 mt-0.5">Order</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCustomQuotaInput((prev) => (prev || 10) + 5)}
                    className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Add Pills */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {[10, 25, 50, 100].map((addVal) => (
                    <button
                      key={addVal}
                      type="button"
                      onClick={() => setCustomQuotaInput(addVal)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        customQuotaInput === addVal
                          ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                      }`}
                    >
                      {addVal} tx
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  *Minimal pembelian custom 10 kuota order
                </div>
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
              onClick={() => handleSelectCustomPackage(customQuotaInput)}
              className="w-full py-3.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 shadow-emerald-500/20"
            >
              <span>Beli Kuota</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Seksi Add-On AI Tokens (Amunisi Tambahan) */}
      <div id="addon" className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span>Katalog Add-On AI Tokens</span>
            </h2>
            <p className="text-xs text-slate-400">
              Beli token kredit ekstra sesuai kebutuhan operasional toko. Token aktif selamanya tanpa kadaluarsa.
            </p>
          </div>
          <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 w-fit">
            Token Aktif Selamanya
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {aiTokenPackages.map((tokenPkg) => (
            <div
              key={tokenPkg.code}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between space-y-5 hover:border-indigo-500/40 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                    {tokenPkg.badge || "Add-On"}
                  </span>
                  <span className="text-xs font-black text-indigo-400 font-mono">+{tokenPkg.tokenAmount} Token</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{tokenPkg.name}</h3>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {formatRupiah(tokenPkg.price)}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {tokenPkg.description}
                </p>
              </div>

              <button
                onClick={() => handleSelectAIToken(tokenPkg)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Beli Token Ini</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Payment Channels Banner */}
      <PaymentMethodsBanner />

      {/* Tabel Riwayat Transaksi Top-Up */}
      {transactions.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">Riwayat Transaksi Top-Up</h3>
              <p className="text-xs text-slate-400">Daftar riwayat transaksi pembayaran dan pembaruan kuota toko.</p>
            </div>
            <button
              onClick={fetchTransactions}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Refresh Riwayat"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Paket</th>
                  <th className="py-3 px-3">Tagihan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{tx.order_id}</td>
                    <td className="py-3 px-3 text-white font-medium">{tx.package_name}</td>
                    <td className="py-3 px-3 font-bold text-white">{formatRupiah(tx.amount)}</td>
                    <td className="py-3 px-3">
                      {tx.status === "SETTLED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Sukses
                        </span>
                      ) : tx.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          Menunggu Bayar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
                          <X className="h-3 w-3" />
                          {tx.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {tx.status === "PENDING" && (
                        <button
                          onClick={() => handleVerifyOrder(tx.order_id)}
                          disabled={checkingOrderId === tx.order_id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          {checkingOrderId === tx.order_id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          <span>Cek Status</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Checkout Midtrans Snap */}
      {isModalOpen && (selectedPkg || selectedMembership || selectedAIToken) && (
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
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Pembayaran Aman & Otomatis</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Konfirmasi Pembayaran</h3>
                  <p className="text-xs text-slate-400">Pilih metode pembayaran (QRIS, Virtual Account Bank, E-Wallet, atau Minimarket).</p>
                </div>

                {/* Box Detail Kuota / Paket */}
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Item:</span>
                    <span className="font-bold text-white">
                      {selectedMembership
                        ? selectedMembership.name
                        : selectedAIToken
                        ? selectedAIToken.name
                        : selectedPkg?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Benefit:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedMembership
                        ? `+${selectedMembership.quotaBonus} Kuota Bonus (${selectedMembership.duration})`
                        : selectedAIToken
                        ? `+${selectedAIToken.tokenAmount} Token Kredit AI`
                        : `+${selectedPkg?.quota} Order`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Harga Paket:</span>
                    <span className={`font-bold ${discountApplied ? "line-through text-slate-400" : "text-white"}`}>
                      {formatRupiah(getCurrentBasePrice())}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Diskon Kupon (25%):</span>
                      <span>-{formatRupiah(getCurrentBasePrice() - calculateFinalPrice(getCurrentBasePrice()))}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-white">
                    <span>Total Tagihan:</span>
                    <span className="text-emerald-400 text-lg">
                      {formatRupiah(calculateFinalPrice(getCurrentBasePrice()))}
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
                      <span>Kupon berhasil diterapkan! Hemat 25%.</span>
                    </div>
                  )}
                  {couponError && (
                    <div className="text-xs text-red-400 font-medium">{couponError}</div>
                  )}
                </form>

                {/* Payment Channels Note */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2 text-[11px] text-slate-400">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Mendukung Semua Metode Pembayaran Populer:</span>
                  </div>
                  <div className="text-slate-400 leading-relaxed">
                    QRIS (GoPay, OVO, DANA, BCA, Mandiri, ShopeePay), Virtual Account Bank (BCA, Mandiri, BNI, BRI, Permata), serta Gerai Ritel.
                  </div>
                </div>

                {paymentError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Tombol Buka Midtrans Snap */}
                <button
                  onClick={handlePayWithMidtrans}
                  disabled={isPaying}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyiapkan Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Bayar Sekarang</span>
                    </>
                  )}
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
                    Pembayaran Anda telah terkonfirmasi. Saldo kuota dan status akun toko telah langsung diperbarui secara otomatis.
                  </p>
                  {activeOrderId && (
                    <div className="text-[11px] font-mono text-slate-500 pt-1">Order ID: {activeOrderId}</div>
                  )}
                </div>
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Total Kuota Sekarang:</div>
                  <div className="text-3xl font-black text-emerald-400">{store.quotaBalance} Order</div>
                  {isStorePro && (
                    <div className="text-xs text-emerald-300 font-bold mt-1">Status: Pro Member Aktif</div>
                  )}
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
