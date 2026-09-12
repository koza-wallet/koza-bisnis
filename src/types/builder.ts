export type BlockType =
  | "HERO_BANNER"
  | "ANNOUNCEMENT_BAR"
  | "VIDEO_EMBED"
  | "IMAGE_SLIDER"
  | "IMAGE_GALLERY"
  | "RICH_TEXT"
  | "FEATURES_GRID"
  | "TESTIMONIALS"
  | "FAQ_ACCORDION"
  | "SALES_TOAST"
  | "COUNTDOWN_TIMER"
  | "STOCK_COUNTER"
  | "CHECKOUT_FORM"
  | "STICKY_BOTTOM_CTA"
  | "SPACER_DIVIDER";

export type BlockCategory =
  | "HEADER_HERO"
  | "MEDIA_SHOWCASE"
  | "CONTENT_STORY"
  | "TRUST_PROOF"
  | "SCARCITY_URGENCY"
  | "SALES_CHECKOUT";

export interface BlockCatalogItem {
  type: BlockType;
  name: string;
  description: string;
  category: BlockCategory;
  iconName: string;
  badge?: string;
}

// Payload schemas for each block type
export interface HeroBannerSettings {
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  heroImageUrl: string;
  showCountdown: boolean;
  countdownHours: number;
  // Nama Pixel Event custom yang di-fire saat tombol CTA ini diklik (Meta/TikTok/GTM
  // dataLayer sekaligus), independen dari event funnel baku (InitiateCheckout/Purchase).
  pixelEvent?: string;
}

export interface AnnouncementBarSettings {
  text: string;
  highlightText: string;
  bgColor: string;
  textColor: string;
}

export interface VideoEmbedSettings {
  videoUrl: string;
  platform: "YOUTUBE" | "TIKTOK" | "DIRECT";
  aspectRatio: "16:9" | "9:16";
  caption?: string;
  autoPlay?: boolean;
}

export interface ImageSliderSettings {
  images: { url: string; caption?: string }[];
  autoSlide: boolean;
  showDots: boolean;
}

export interface ImageGallerySettings {
  images: { url: string; title?: string }[];
  columns: 2 | 3 | 4;
}

export interface RichTextSettings {
  title?: string;
  content: string;
  alignment: "left" | "center" | "right";
  highlightBox: boolean;
}

export interface FeaturesGridSettings {
  title: string;
  subtitle: string;
  columns: 2 | 3 | 4;
  items: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export interface TestimonialsSettings {
  title: string;
  subtitle: string;
  items: {
    name: string;
    role: string;
    review: string;
    rating: number;
    avatarUrl?: string;
    verified: boolean;
  }[];
}

export interface FAQAccordionSettings {
  title: string;
  subtitle: string;
  items: {
    question: string;
    answer: string;
  }[];
}

export interface SalesToastSettings {
  enabled: boolean;
  intervalSeconds: number;
  sampleNames: string[];
  sampleCities: string[];
  productLabel: string;
}

export interface CountdownTimerSettings {
  title: string;
  hours: number;
  themeColor: string;
}

export interface StockCounterSettings {
  initialStock: number;
  currentStock: number;
  label: string;
  accentColor: string;
}

export interface CheckoutFormSettings {
  title: string;
  subtitle: string;
  productId?: string;
  normalPrice: number;
  promoPrice: number;
  discountPercent: number;
  scarcityText: string;
  showCourier: boolean;
  paymentOptions: ("WHATSAPP" | "QRIS_TOKO")[];
  buttonText: string;
}

export interface StickyBottomCTASettings {
  text: string;
  priceLabel: string;
  targetAnchor: string;
}

export interface SpacerDividerSettings {
  height: number;
  style: "space" | "line" | "wave";
}

// Generic builder block interface
export interface BuilderBlock {
  id: string;
  type: BlockType;
  title: string;
  isVisible: boolean;
  settings: Record<string, any>;
}

export interface BuilderPageDesign {
  fontFamily: "Outfit" | "Plus Jakarta Sans" | "Inter" | "Poppins";
  pageWidth: "FULL" | "CONTAINED" | "BOXED";
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  cardRadius: "sm" | "md" | "lg" | "xl" | "2xl";
  themePreset: "EMERALD" | "MIDNIGHT" | "ROSE" | "ELECTRIC" | "CUSTOM";
}

export interface BuilderPageSEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  noIndex: boolean;
}

export interface BuilderTemplate {
  id: string;
  name: string;
  category: "FASHION" | "BEAUTY" | "FOOD" | "GADGET" | "SERVICES" | "HERBAL" | "VIRAL_TIKTOK";
  thumbnailUrl: string;
  isPro: boolean;
  badge?: string;
  description: string;
  design: BuilderPageDesign;
  blocks: BuilderBlock[];
}
