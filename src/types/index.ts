export type MembershipPlan = 'NON_PRO' | 'PRO_MONTHLY' | 'PRO_ANNUAL';

export interface Store {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string;
  whatsappNumber: string;
  originCity: string;
  originDistrict: string;
  quotaBalance: number;
  plan?: MembershipPlan;
  planExpiryDate?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  qrisImageUrl?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number; // Harga jual ke pembeli
  costPrice: number;    // Harga modal / HPP rahasia
  weightGrams: number;  // Berat untuk kalkulasi ongkir
  stock: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  weightGrams: number;
  subtotal: number;
}

export type OrderStatus = 'MENUNGGU_BAYAR' | 'TERKUNCI_KUOTA' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI' | 'BATAL';

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  destinationCity: string;
  destinationDistrict: string;
  courierName: string;
  courierService: string;
  shippingCost: number;
  itemsTotal: number;
  grandTotal: number;
  totalCostPrice: number; // Total HPP
  netProfit: number;      // itemsTotal - totalCostPrice
  status: OrderStatus;
  trackingNumber?: string;
  paymentMethod: 'WHATSAPP' | 'QRIS_TOKO';
  items: OrderItem[];
  createdAt: string;
}

export interface OperationalExpense {
  id: string;
  storeId: string;
  category: 'PACKING' | 'BENSIN' | 'IKLAN' | 'ADMIN' | 'LAINNYA';
  description: string;
  amount: number;
  date: string;
}

export interface QuotaPackage {
  originalPrice?: number;
  discountPercent?: number;
  bonusOrders?: number;
  id: string;
  code: string;
  name: string;
  quota: number;
  price: number;
  pricePerOrder: number;
  badge?: string;
  popular?: boolean;
  tier: 'NON_PRO' | 'PRO';
}

export type LandingPageTheme = "EMERALD" | "MIDNIGHT" | "ROSE" | "ELECTRIC";
export type LandingPageTone = "URGENT" | "LUXURY" | "EMOTIONAL" | "SCIENTIFIC";

export interface LandingPage {
  id: string;
  storeId: string;
  productId?: string;
  slug: string;
  title: string;
  theme: LandingPageTheme;
  tone: LandingPageTone;
  // Mode pembuatan halaman: AI otomatis, manual modular blok, atau dari template
  builderMode?: "AI" | "MANUAL" | "MANUAL_BERDU" | "TEMPLATE";
  // Daftar blok seksi modular jika dibuat menggunakan manual builder / template
  blocks?: import("./builder").BuilderBlock[];
  // Desain kustom jika menggunakan modular builder
  design?: import("./builder").BuilderPageDesign;
  // Pengaturan SEO
  seo?: import("./builder").BuilderPageSEO;
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    heroImageUrl: string;
    countdownHours: number;
  };
  problemSection: {
    title: string;
    subtitle: string;
    painPoints: {
      title: string;
      description: string;
    }[];
  };
  solutionSection: {
    title: string;
    description: string;
    highlights: string[];
  };
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  testimonials: {
    name: string;
    role: string;
    review: string;
    rating: number;
    avatarUrl: string;
    verified: boolean;
  }[];
  guarantee: {
    title: string;
    description: string;
  };
  faq: {
    question: string;
    answer: string;
  }[];
  pricing: {
    normalPrice: number;
    promoPrice: number;
    discountPercent: number;
    scarcityText: string;
    bonusGift?: string;
  };
  pixels?: {
    metaPixelId?: string;
    tiktokPixelId?: string;
  };
  analytics: {
    viewsCount: number;
    ordersCount: number;
    conversionRate: number;
  };
  isPublished: boolean;
  createdAt: string;
}

export * from "./builder";

