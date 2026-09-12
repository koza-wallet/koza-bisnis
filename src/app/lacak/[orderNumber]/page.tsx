"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicOrderTracking } from "@/types";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Navigation,
  Star,
  Calendar,
  Sparkles,
  Send,
  Heart,
  ThumbsUp,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const REVIEW_PRESET_TAGS = [
  "Pengiriman Cepat",
  "Packing Rapi & Aman",
  "Produk Sesuai Deskripsi",
  "Pelayanan Ramah",
  "Kualitas Memuaskan",
];

export default function PublicOrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params?.orderNumber as string;
  const isAutoReviewPrompt = searchParams?.get("review") === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<PublicOrderTracking | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);

  // Review Form State (Phase 2)
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Pengiriman Cepat", "Produk Sesuai Deskripsi"]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    async function fetchTracking() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tracking?orderNumber=${encodeURIComponent(orderNumber)}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          const suffix = json.errorRef ? ` (Kode Referensi: ${json.errorRef})` : "";
          setError((json.message || "Pesanan tidak ditemukan.") + suffix);
          return;
        }

        setTracking(json.data);

        // Jika sudah pernah memberikan review sebelumnya
        if (json.data.customerRating) {
          setRating(json.data.customerRating);
          setReviewText(json.data.customerReview || "");
          setSelectedTags(json.data.customerReviewTags || []);
          setReviewSuccess(true);
        }
      } catch (err: any) {
        setError("Gagal memuat informasi pelacakan. Silakan coba beberapa saat lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchTracking();
  }, [orderNumber]);

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber) return;

    try {
      setSubmittingReview(true);
      setReviewError(null);

      const res = await fetch("/api/tracking/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          rating,
          review: reviewText,
          tags: selectedTags,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const suffix = json.errorRef ? ` (Kode Referensi: ${json.errorRef})` : "";
        setReviewError((json.message || "Gagal menyimpan ulasan.") + suffix);
        return;
      }

      setReviewSuccess(true);
      if (tracking) {
        setTracking({
          ...tracking,
          customerRating: rating,
          customerReview: reviewText,
          customerReviewTags: selectedTags,
        });
      }
    } catch (err: any) {
      setReviewError("Terjadi kendala jaringan saat menyimpan ulasan.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return 4;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "IN_TRANSIT":
        return 2;
      case "PICKED_UP":
        return 1;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Menghubungkan ke server ekspedisi...</p>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 text-center shadow-xl space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pesanan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || "Pastikan tautan nomor pesanan yang Anda masukkan sudah benar."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(tracking.lastTrackingStatus || "");
  const isDelivered = tracking.lastTrackingStatus === "DELIVERED" || tracking.status === "SELESAI";
  const cleanWA = tracking.storeWhatsappNumber.startsWith("0")
    ? "62" + tracking.storeWhatsappNumber.slice(1)
    : tracking.storeWhatsappNumber;

  const waHelpText = encodeURIComponent(
    `Halo ${tracking.storeName}, saya ingin menanyakan pesanan saya #${tracking.orderNumber} dengan resi ${tracking.trackingNumber || "-"}`
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-200 pb-16 font-sans transition-colors">
      {/* Header Toko */}
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-md px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {tracking.storeLogoUrl ? (
              <img
                src={tracking.storeLogoUrl}
                alt={tracking.storeName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600/15 dark:bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                {tracking.storeName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{tracking.storeName}</span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Pelacakan Resmi Pesanan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={`https://wa.me/${cleanWA}?text=${waHelpText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-600/15 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-600/25 transition-all shadow-sm"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat Toko</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Status Card Highlight */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gradient-to-b dark:from-slate-900/90 dark:to-slate-900/50 p-5 shadow-lg dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/70">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Nomor Pesanan
              </span>
              <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                #{tracking.orderNumber}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Kurir Pilihan
              </span>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {tracking.courierName} — {tracking.courierService}
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 p-4 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl mt-0.5 ${
              isDelivered
                ? "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : tracking.lastTrackingStatus === "OUT_FOR_DELIVERY"
                ? "bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                : "bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
            }`}>
              {isDelivered ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : tracking.lastTrackingStatus === "OUT_FOR_DELIVERY" ? (
                <Truck className="h-6 w-6 animate-pulse" />
              ) : (
                <Package className="h-6 w-6" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {isDelivered
                  ? "Paket Telah Tiba & Diterima"
                  : tracking.lastTrackingStatus === "OUT_FOR_DELIVERY"
                  ? "Kurir Sedang Mengantar ke Rumah Anda"
                  : tracking.lastTrackingStatus === "IN_TRANSIT"
                  ? "Paket Sedang Dalam Transit Antar Kota"
                  : "Paket Telah Diserahkan ke Gerai Kurir"}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {tracking.trackingHistory[0]?.description || "Pesanan sedang dalam proses pengiriman oleh ekspedisi."}
              </p>
            </div>
          </div>

          {/* PHASE 2: ESTIMATED TIME OF ARRIVAL (ETA) BANNER */}
          {tracking.estimatedDeliveryDate && !isDelivered && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 px-3.5 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Perkiraan Tiba di Tujuan:</span>
              </div>
              <div className="font-extrabold text-indigo-900 dark:text-white font-mono bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                {formatDate(tracking.estimatedDeliveryDate)}
              </div>
            </div>
          )}

          {/* Tracking Number Bar */}
          {tracking.trackingNumber && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/50 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
                  Nomor Resi Pengiriman
                </span>
                <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  {tracking.trackingNumber}
                </span>
              </div>
              <button
                onClick={() => handleCopyResi(tracking.trackingNumber!)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              >
                {copiedResi ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Resi</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Stepper Progress Visual */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-1.5 text-center">
              {[
                { label: "Diterima Kurir", step: 1 },
                { label: "Dalam Transit", step: 2 },
                { label: "Diantar Kurir", step: 3 },
                { label: "Paket Tiba", step: 4 },
              ].map((s) => (
                <div key={s.step} className="space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      currentStep >= s.step
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/20"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold block leading-tight ${
                      currentStep >= s.step ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PHASE 2: CUSTOMER RATING & REVIEW CARD (SHOWN WHEN DELIVERED) */}
        {isDelivered && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/40 dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 p-5 shadow-lg dark:shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {reviewSuccess ? "Ulasan & Penilaian Anda" : "Beri Ulasan Kepuasan Pembeli"}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Bantu {tracking.storeName} memberikan pelayanan yang lebih baik
                  </p>
                </div>
              </div>

              {reviewSuccess && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" /> Terkirim
                </span>
              )}
            </div>

            {reviewSuccess ? (
              /* Review Result View */
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (tracking.customerRating || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
                    {tracking.customerRating || rating}/5 Bintang
                  </span>
                </div>

                {tracking.customerReviewTags && tracking.customerReviewTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tracking.customerReviewTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {tracking.customerReview && (
                  <div className="rounded-xl bg-white dark:bg-slate-950/60 p-3 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 italic shadow-sm">
                    "{tracking.customerReview}"
                  </div>
                )}

                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                  <span>Terima kasih! Ulasan Anda telah diterima oleh toko {tracking.storeName}.</span>
                </div>
              </div>
            ) : (
              /* Review Form */
              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                {/* Interactive Star Picker */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Tingkat Kepuasan:</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 text-slate-300 dark:text-slate-600 hover:scale-115 transition-transform active:scale-95"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              isFilled
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1.5 min-w-[70px]">
                      {rating === 5
                        ? "Sangat Puas"
                        : rating === 4
                        ? "Puas"
                        : rating === 3
                        ? "Cukup Baik"
                        : rating === 2
                        ? "Kurang Puas"
                        : "Kecewa"}
                    </span>
                  </div>
                </div>

                {/* Preset Feedback Tags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Pilih Pujian Cepat:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {REVIEW_PRESET_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-sm"
                              : "bg-white dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Text Field */}
                <div className="space-y-1">
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tulis ulasan produk atau kesan Anda di sini (opsional)..."
                    maxLength={500}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-sm"
                  />
                  <div className="flex justify-end text-[10px] text-slate-400 dark:text-slate-600">
                    {reviewText.length}/500
                  </div>
                </div>

                {reviewError && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg p-2">
                    {reviewError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs py-2.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submittingReview ? "Mengirim Ulasan..." : "Kirim Ulasan & Penilaian"}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Timeline Stepper */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Navigation className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Riwayat Perjalanan Paket</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {tracking.trackingHistory.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950 ${
                    idx === 0
                      ? "bg-emerald-500 dark:bg-emerald-400 ring-4 ring-emerald-500/20"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                    <span className={`font-bold ${idx === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.location || "Pusat Transit"}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items & Shipping Address Info */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Detail Pesanan & Alamat</span>
          </h3>

          {/* Address */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3.5 border border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              <MapPin className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
              <span>Tujuan Pengiriman</span>
            </div>
            <div className="text-slate-900 dark:text-white font-bold">{tracking.customerName}</div>
            <div className="text-slate-600 dark:text-slate-400">
              {tracking.destinationDistrict ? `${tracking.destinationDistrict}, ` : ""}
              {tracking.destinationCity}
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">
              Produk yang Dibeli
            </span>
            <div className="space-y-2">
              {tracking.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/40 p-2.5 border border-slate-200 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{item.productName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.quantity} barang</div>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Ongkir Kurir:</span>
              <span>{formatRupiah(tracking.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Total Pesanan:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatRupiah(tracking.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-4 pb-8 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
          <p>
            Didukung oleh infrastruktur pelacakan logistik resmi{" "}
            <strong className="text-slate-600 dark:text-slate-400">KoZa Bisnis</strong>.
          </p>
          <p>Update status kurir disinkronisasi secara berkala.</p>
        </div>
      </main>
    </div>
  );
}
