"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Award, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  QrCode, 
  ArrowRight, 
  Flame, 
  Check, 
  ShoppingBag, 
  Play, 
  Zap, 
  HelpCircle,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { BuilderBlock, BuilderPageDesign } from "@/types/builder";
import { destinationOptions } from "@/lib/mock-data";
import { trackPixelCustomEvent } from "@/components/pixel-tracker";

interface BlockRendererProps {
  block: BuilderBlock;
  design?: BuilderPageDesign;
  isPreview?: boolean;
  onSelect?: (blockId: string) => void;
  isSelected?: boolean;
  onCheckoutSubmit?: (data: any) => void;
  storeName?: string;
  storePhone?: string;
}

export function BlockRenderer({
  block,
  design,
  isPreview = false,
  onSelect,
  isSelected = false,
  onCheckoutSubmit,
  storeName = "KoZa Store",
  storePhone = "6281234567890",
}: BlockRendererProps) {
  if (!block.isVisible) return null;

  const primaryColor = design?.primaryColor || "#10b981";
  const textColor = design?.textColor || "#f8fafc";
  const radius = design?.cardRadius || "xl";

  const radiusClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  }[radius] || "rounded-xl";

  return (
    <div
      onClick={(e) => {
        if (onSelect) {
          e.stopPropagation();
          onSelect(block.id);
        }
      }}
      className={`relative transition-all duration-200 ${
        isSelected
          ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 z-10"
          : isPreview
          ? "hover:ring-1 hover:ring-emerald-500/50 cursor-pointer"
          : ""
      }`}
    >
      {/* Visual Block Indicator in Editor */}
      {isSelected && (
        <div className="absolute -top-3 left-4 z-20 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 uppercase tracking-wider">
          <span>Active: {block.title}</span>
        </div>
      )}

      {renderBlockContent(block, {
        primaryColor,
        textColor,
        radiusClass,
        isPreview,
        onCheckoutSubmit,
        storeName,
        storePhone,
      })}
    </div>
  );
}

function renderBlockContent(
  block: BuilderBlock,
  ctx: {
    primaryColor: string;
    textColor: string;
    radiusClass: string;
    isPreview: boolean;
    onCheckoutSubmit?: (data: any) => void;
    storeName: string;
    storePhone: string;
  }
) {
  const { settings } = block;

  switch (block.type) {
    case "HERO_BANNER":
      return <HeroBannerBlock settings={settings} ctx={ctx} />;

    case "ANNOUNCEMENT_BAR":
      return <AnnouncementBarBlock settings={settings} ctx={ctx} />;

    case "VIDEO_EMBED":
      return <VideoEmbedBlock settings={settings} ctx={ctx} />;

    case "IMAGE_SLIDER":
      return <ImageSliderBlock settings={settings} ctx={ctx} />;

    case "IMAGE_GALLERY":
      return <ImageGalleryBlock settings={settings} ctx={ctx} />;

    case "RICH_TEXT":
      return <RichTextBlock settings={settings} ctx={ctx} />;

    case "FEATURES_GRID":
      return <FeaturesGridBlock settings={settings} ctx={ctx} />;

    case "TESTIMONIALS":
      return <TestimonialsBlock settings={settings} ctx={ctx} />;

    case "FAQ_ACCORDION":
      return <FAQAccordionBlock settings={settings} ctx={ctx} />;

    case "SALES_TOAST":
      return <SalesToastBlock settings={settings} ctx={ctx} />;

    case "COUNTDOWN_TIMER":
      return <CountdownTimerBlock settings={settings} ctx={ctx} />;

    case "STOCK_COUNTER":
      return <StockCounterBlock settings={settings} ctx={ctx} />;

    case "CHECKOUT_FORM":
      return <CheckoutFormBlock settings={settings} ctx={ctx} />;

    case "STICKY_BOTTOM_CTA":
      return <StickyBottomCTABlock settings={settings} ctx={ctx} />;

    case "SPACER_DIVIDER":
      return <SpacerDividerBlock settings={settings} ctx={ctx} />;

    default:
      return (
        <div className="p-4 border border-dashed border-slate-700 text-center text-xs text-slate-400">
          Block [{block.type}] siap dikustomisasi
        </div>
      );
  }
}

// 1. HERO BANNER
function HeroBannerBlock({ settings, ctx }: { settings: any; ctx: any }) {
  return (
    <section className="relative overflow-hidden py-8 px-4 md:py-14 md:px-6 lg:px-8 text-center md:text-left">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 lg:gap-10">
        <div className="flex-1 min-w-0 space-y-4">
          {settings.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{settings.badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight leading-tight text-white break-words">
            {settings.headline || "Headline Menarik Produk Anda"}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {settings.subheadline || "Tuliskan subheadline yang menjelaskan manfaat utama produk."}
          </p>

          {settings.showCountdown && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Promo Berakhir Hari Ini — Sisa Waktu Terbatas!</span>
            </div>
          )}

          <div className="pt-2">
            <a
              href={settings.ctaLink || "#checkout-section"}
              onClick={() => {
                if (settings.pixelEvent) {
                  trackPixelCustomEvent(settings.pixelEvent, { title: settings.headline || settings.ctaText || "" });
                }
              }}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 ${ctx.radiusClass} font-bold text-slate-950 shadow-lg hover:brightness-110 transition-all active:scale-95`}
              style={{ backgroundColor: ctx.primaryColor }}
            >
              <span>{settings.ctaText || "Pesan Sekarang"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {settings.heroImageUrl && (
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md shrink-0 flex-1 min-w-0">
            <div className={`relative aspect-square overflow-hidden ${ctx.radiusClass} border border-slate-800 shadow-2xl group`}>
              <img
                src={settings.heroImageUrl}
                alt="Hero"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// 2. ANNOUNCEMENT BAR
function AnnouncementBarBlock({ settings }: { settings: any; ctx: any }) {
  return (
    <div
      className="py-2.5 px-4 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
      style={{
        backgroundColor: settings.bgColor || "#10b981",
        color: settings.textColor || "#022c22",
      }}
    >
      <Flame className="w-4 h-4 animate-bounce" />
      <span>{settings.text || "PENGUMUMAN SPESIAL TOKO"}</span>
      {settings.highlightText && (
        <span className="bg-black/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold">
          {settings.highlightText}
        </span>
      )}
    </div>
  );
}

// 3. VIDEO EMBED
function VideoEmbedBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(settings.videoUrl);
  const isPortrait = settings.aspectRatio === "9:16";

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto text-center">
      <div
        className={`relative overflow-hidden ${ctx.radiusClass} border border-slate-800 shadow-xl bg-slate-900 mx-auto ${
          isPortrait ? "max-w-xs aspect-[9/16]" : "w-full aspect-video"
        }`}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Video Preview"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4">
            <Play className="w-12 h-12 text-slate-600 mb-2" />
            <p className="text-xs">Masukkan link YouTube di pengaturan video</p>
          </div>
        )}
      </div>
      {settings.caption && (
        <p className="text-xs text-slate-400 mt-2 italic">{settings.caption}</p>
      )}
    </div>
  );
}

// 4. IMAGE SLIDER
function ImageSliderBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = settings.images || [];

  if (images.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 max-w-md mx-auto my-4 rounded-xl">
        Belum ada gambar slider. Tambahkan melalui pengaturan blok.
      </div>
    );
  }

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="py-6 px-4 max-w-2xl mx-auto">
      <div className={`relative overflow-hidden ${ctx.radiusClass} border border-slate-800 aspect-[4/3] bg-slate-900`}>
        <img
          src={images[currentIdx]?.url}
          alt={images[currentIdx]?.caption || `Slide ${currentIdx + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
          }}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {settings.showDots && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIdx ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {images[currentIdx]?.caption && (
        <p className="text-center text-xs text-slate-400 mt-2">{images[currentIdx].caption}</p>
      )}
    </div>
  );
}

// 5. IMAGE GALLERY
function ImageGalleryBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const images = settings.images || [];
  const cols = settings.columns || 3;

  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[cols as 2 | 3 | 4] || "grid-cols-3";

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <div className={`grid ${colClass} gap-3 sm:gap-4`}>
        {images.map((item: any, idx: number) => (
          <div
            key={idx}
            className={`group relative overflow-hidden ${ctx.radiusClass} border border-slate-800 bg-slate-900 aspect-square`}
          >
            <img
              src={item.url}
              alt={item.title || `Gallery ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";
              }}
            />
            {item.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center text-xs text-white font-medium">
                {item.title}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 6. RICH TEXT
function RichTextBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[settings.alignment as "left" | "center" | "right"] || "text-center";

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto">
      <div
        className={`${alignClass} ${
          settings.highlightBox
            ? `p-6 ${ctx.radiusClass} bg-slate-900/60 border border-slate-800/80 shadow-md`
            : ""
        }`}
      >
        {settings.title && (
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
            {settings.title}
          </h2>
        )}
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-2">
          {settings.content}
        </div>
      </div>
    </div>
  );
}

// 7. FEATURES GRID
function FeaturesGridBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const items = settings.items || [];
  const cols = settings.columns || 3;

  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  }[cols as 2 | 3 | 4] || "grid-cols-3";

  return (
    <section className="py-10 px-4 max-w-4xl mx-auto">
      {(settings.title || settings.subtitle) && (
        <div className="text-center mb-8 space-y-2">
          {settings.title && (
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {settings.title}
            </h2>
          )}
          {settings.subtitle && (
            <p className="text-sm text-slate-400 max-w-xl mx-auto">{settings.subtitle}</p>
          )}
        </div>
      )}

      <div className={`grid ${colClass} gap-4`}>
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className={`p-5 ${ctx.radiusClass} bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5`}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-base">
              {item.icon || "✨"}
            </div>
            <h3 className="font-bold text-white text-base">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// 8. TESTIMONIALS
function TestimonialsBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const items = settings.items || [];

  return (
    <section className="py-10 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {settings.title || "Apa Kata Pembeli Kami?"}
        </h2>
        {settings.subtitle && (
          <p className="text-sm text-slate-400">{settings.subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item: any, idx: number) => (
          <div
            key={idx}
            className={`p-5 ${ctx.radiusClass} bg-slate-900/90 border border-slate-800/90 flex flex-col justify-between space-y-4`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "{item.review}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {item.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-xs truncate">{item.name}</span>
                  {item.verified && (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">{item.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// 9. FAQ ACCORDION
function FAQAccordionBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const items = settings.items || [];

  return (
    <section className="py-10 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {settings.title || "Pertanyaan yang Sering Diajukan"}
        </h2>
        {settings.subtitle && (
          <p className="text-sm text-slate-400">{settings.subtitle}</p>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item: any, idx: number) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`overflow-hidden ${ctx.radiusClass} border border-slate-800 bg-slate-900/60 transition-all`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-emerald-400 transition-colors"
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// 10. SALES TOAST (Simulated Social Proof)
function SalesToastBlock({ settings }: { settings: any; ctx: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const names = settings.sampleNames || ["Budi", "Siti", "Ahmad", "Dewi"];
  const cities = settings.sampleCities || ["Jakarta", "Surabaya", "Bandung", "Medan"];
  const label = settings.productLabel || "paket promo";

  useEffect(() => {
    if (!settings.enabled) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % names.length);
    }, (settings.intervalSeconds || 8) * 1000);
    return () => clearInterval(interval);
  }, [settings.enabled, settings.intervalSeconds, names.length]);

  if (!settings.enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-xs">
      <div className="bg-slate-900/95 border border-emerald-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="text-xs min-w-0">
          <p className="font-semibold text-white truncate">
            {names[currentIndex]} dari {cities[currentIndex % cities.length]}
          </p>
          <p className="text-[11px] text-slate-300">
            Baru saja memesan <span className="text-emerald-400 font-medium">{label}</span>
          </p>
          <span className="text-[10px] text-slate-500">1 menit lalu</span>
        </div>
      </div>
    </div>
  );
}

// 11. COUNTDOWN TIMER
function CountdownTimerBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: settings.hours || 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: settings.hours || 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.hours]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="py-6 px-4 max-w-xl mx-auto">
      <div
        className={`p-6 ${ctx.radiusClass} border border-rose-500/30 bg-gradient-to-b from-rose-950/40 to-slate-900/90 text-center space-y-4 shadow-xl`}
      >
        <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Flame className="w-4 h-4 animate-bounce" />
          <span>{settings.title || "Flash Sale Berakhir Dalam:"}</span>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-lg bg-slate-950 border border-rose-500/40 flex items-center justify-center text-2xl sm:text-3xl font-black text-rose-400 shadow-inner">
              {pad(timeLeft.hours)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Jam</span>
          </div>
          <span className="text-2xl font-black text-rose-400 mb-4">:</span>
          <div className="flex flex-col items-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-lg bg-slate-950 border border-rose-500/40 flex items-center justify-center text-2xl sm:text-3xl font-black text-rose-400 shadow-inner">
              {pad(timeLeft.minutes)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Menit</span>
          </div>
          <span className="text-2xl font-black text-rose-400 mb-4">:</span>
          <div className="flex flex-col items-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-lg bg-slate-950 border border-rose-500/40 flex items-center justify-center text-2xl sm:text-3xl font-black text-rose-400 shadow-inner">
              {pad(timeLeft.seconds)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Detik</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 12. STOCK COUNTER
function StockCounterBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const current = settings.currentStock || 7;
  const initial = settings.initialStock || 50;
  const percent = Math.min(100, Math.round((current / initial) * 100));

  return (
    <div className="py-4 px-4 max-w-lg mx-auto">
      <div className={`p-4 ${ctx.radiusClass} bg-slate-900/80 border border-amber-500/30 space-y-2`}>
        <div className="flex items-center justify-between text-xs font-bold text-amber-400">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            {settings.label || "Stok Hampir Habis!"}
          </span>
          <span>Sisa {current} unit lagi</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 13. CHECKOUT FORM (Full Order Integration)
function CheckoutFormBlock({ settings, ctx }: { settings: any; ctx: any }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(destinationOptions[0]);
  const [selectedCourier, setSelectedCourier] = useState<"SICEPAT" | "JNT" | "JNE">("SICEPAT");
  const [paymentMethod, setPaymentMethod] = useState<"WHATSAPP" | "QRIS_TOKO">("WHATSAPP");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const promoPrice = settings.promoPrice || 149000;
  const normalPrice = settings.normalPrice || 249000;
  const discountPercent = normalPrice > promoPrice ? Math.round(((normalPrice - promoPrice) / normalPrice) * 100) : 40;

  const itemsTotal = promoPrice * quantity;
  const shippingCost = selectedDestination?.baseRate || 10000;
  const grandTotal = itemsTotal + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert("Harap lengkapi Nama, WhatsApp, dan Alamat pengiriman!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        destination: `${selectedDestination.city} (${selectedDestination.district})`,
        courier: selectedCourier,
        paymentMethod,
        quantity,
        itemsTotal,
        shippingCost,
        grandTotal,
        promoPrice,
      };

      if (ctx.onCheckoutSubmit) {
        ctx.onCheckoutSubmit(orderData);
      }

      setOrderSuccess(orderData);
      setIsSubmitting(false);

      if (paymentMethod === "WHATSAPP") {
        const text = encodeURIComponent(
          `Halo Admin ${ctx.storeName}, saya ingin pesan:\n\n` +
          `• Nama: ${customerName}\n` +
          `• No WA: ${customerPhone}\n` +
          `• Alamat: ${customerAddress} (${selectedDestination.city})\n` +
          `• Kurir: ${selectedCourier}\n` +
          `• Jumlah: ${quantity} pcs\n` +
          `• Total Bayar: Rp ${grandTotal.toLocaleString("id-ID")}\n\n` +
          `Mohon segera diproses ya!`
        );
        window.open(`https://wa.me/${ctx.storePhone}?text=${text}`, "_blank");
      }
    }, 600);
  };

  return (
    <section id="checkout-section" className="py-12 px-4 max-w-xl mx-auto">
      <div className={`p-6 sm:p-8 ${ctx.radiusClass} bg-slate-900 border border-slate-800 shadow-2xl space-y-6`}>
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Formulir Pemesanan Resmi</span>
          </div>
          <h2 className="text-2xl font-black text-white">{settings.title || "Ambil Promo Spesial Sekarang"}</h2>
          <p className="text-xs text-slate-400">{settings.subtitle || "Isi form di bawah ini untuk mengunci diskon hari ini."}</p>
        </div>

        {/* Pricing Banner */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 line-through block">
              Rp {normalPrice.toLocaleString("id-ID")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                Rp {promoPrice.toLocaleString("id-ID")}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
                HEMAT {discountPercent}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Garansi</span>
            <p className="text-xs text-white font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Original
            </p>
          </div>
        </div>

        {orderSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-lg">Pesanan Berhasil Dicatat!</h3>
            <p className="text-xs text-slate-300">
              Terima kasih {orderSuccess.customerName}. Pesanan sebesar{" "}
              <span className="font-bold text-emerald-400">
                Rp {orderSuccess.grandTotal.toLocaleString("id-ID")}
              </span>{" "}
              sedang disiapkan untuk pengiriman ke {orderSuccess.customerAddress}.
            </p>
            {paymentMethod === "QRIS_TOKO" && (
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 inline-block mt-2">
                <QrCode className="w-32 h-32 mx-auto text-white mb-2" />
                <p className="text-[11px] text-slate-400">Scan QRIS Toko untuk menyelesaikan pembayaran</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setOrderSuccess(null)}
              className="text-xs text-emerald-400 underline block mx-auto mt-2"
            >
              Buat pesanan baru
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Penerima <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kota / Wilayah Tujuan <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedDestination.city}
                onChange={(e) => {
                  const found = destinationOptions.find((d) => d.city === e.target.value);
                  if (found) setSelectedDestination(found);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {destinationOptions.map((opt) => (
                  <option key={opt.city} value={opt.city}>
                    {opt.city} ({opt.district}) — Ongkir Rp {opt.baseRate.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Lengkap Pengiriman <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Nama Jalan, RT/RW, No. Rumah, Kelurahan, Kecamatan"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pilihan Kurir</label>
                <select
                  value={selectedCourier}
                  onChange={(e: any) => setSelectedCourier(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="SICEPAT">SiCepat REG</option>
                  <option value="JNT">J&T Express</option>
                  <option value="JNE">JNE Reguler</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah Paket</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 py-2 bg-slate-800 text-white rounded-l-lg text-xs font-bold"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center py-2 bg-slate-950 border-y border-slate-800 text-xs font-bold text-white">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 py-2 bg-slate-800 text-white rounded-r-lg text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("WHATSAPP")}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    paymentMethod === "WHATSAPP"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">WhatsApp</p>
                    <p className="text-[10px] text-slate-500">Konfirmasi langsung</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("QRIS_TOKO")}
                  className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    paymentMethod === "QRIS_TOKO"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">QRIS Toko</p>
                    <p className="text-[10px] text-slate-500">Scan instan</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Produk ({quantity} pcs)</span>
                <span>Rp {itemsTotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ongkir ke {selectedDestination.city}</span>
                <span>Rp {shippingCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1.5 border-t border-slate-800 text-sm">
                <span>Total Pembayaran</span>
                <span className="text-emerald-400">Rp {grandTotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 ${ctx.radiusClass} font-black text-slate-950 text-base shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50`}
              style={{ backgroundColor: ctx.primaryColor }}
            >
              {isSubmitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <span>{settings.buttonText || "KIRIM PESANAN SEKARANG"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

// 14. STICKY BOTTOM CTA
function StickyBottomCTABlock({ settings, ctx }: { settings: any; ctx: any }) {
  return (
    <div className="sticky bottom-0 inset-x-0 z-30 p-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Harga Promo</span>
          <span className="text-sm font-bold text-emerald-400">
            {settings.priceLabel || "Rp 149.000"}
          </span>
        </div>
        <a
          href={settings.targetAnchor || "#checkout-section"}
          className={`flex-1 py-2.5 px-4 ${ctx.radiusClass} font-bold text-slate-950 text-xs sm:text-sm text-center shadow-lg hover:brightness-110 transition-all`}
          style={{ backgroundColor: ctx.primaryColor }}
        >
          {settings.text || "Beli Sekarang (Diskon Terbatas)"}
        </a>
      </div>
    </div>
  );
}

// 15. SPACER / DIVIDER
function SpacerDividerBlock({ settings }: { settings: any; ctx: any }) {
  const height = settings.height || 32;
  const style = settings.style || "space";

  if (style === "line") {
    return (
      <div className="max-w-4xl mx-auto px-4" style={{ paddingTop: height / 2, paddingBottom: height / 2 }}>
        <hr className="border-t border-slate-800" />
      </div>
    );
  }

  return <div style={{ height: `${height}px` }} />;
}
