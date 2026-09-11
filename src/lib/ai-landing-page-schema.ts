import { z } from "zod";

// Skema Zod untuk output terstruktur AI Landing Page Generator.
// Hanya 7 tipe blok yang diizinkan — semuanya sudah punya UI edit visual
// di Canvas Builder (block-settings-form.tsx) sehingga hasil AI selalu
// bisa diedit seller, bukan cuma ditampilkan.

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Harus berupa kode warna hex, contoh: #10b981");

const heroBannerBlock = z.object({
  id: z.string(),
  type: z.literal("HERO_BANNER"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    badge: z.string(),
    headline: z.string(),
    subheadline: z.string(),
    ctaText: z.string(),
    ctaLink: z.string(),
    heroImageUrl: z.string(),
    showCountdown: z.boolean(),
    countdownHours: z.number().int().min(1).max(72),
  }),
});

const announcementBarBlock = z.object({
  id: z.string(),
  type: z.literal("ANNOUNCEMENT_BAR"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    text: z.string(),
    highlightText: z.string(),
    bgColor: hexColor,
    textColor: hexColor,
  }),
});

const featuresGridBlock = z.object({
  id: z.string(),
  type: z.literal("FEATURES_GRID"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    title: z.string(),
    subtitle: z.string(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
    items: z
      .array(
        z.object({
          icon: z.string().max(4).describe("Satu karakter emoji, BUKAN nama ikon (contoh: 🚀, bukan 'Rocket')"),
          title: z.string(),
          description: z.string(),
        })
      )
      .min(2)
      .max(6),
  }),
});

const testimonialsBlock = z.object({
  id: z.string(),
  type: z.literal("TESTIMONIALS"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    title: z.string(),
    subtitle: z.string(),
    items: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().describe("Kota/lokasi pembeli, contoh: 'Jakarta Selatan' — JANGAN pakai kata 'Terverifikasi' di sini"),
          review: z.string(),
          rating: z.number().int().min(1).max(5),
          avatarUrl: z.string().nullable(),
          verified: z.literal(false).describe("Selalu false — ini contoh ulasan, bukan ulasan asli yang sudah diverifikasi"),
        })
      )
      .min(2)
      .max(4),
  }),
});

const faqAccordionBlock = z.object({
  id: z.string(),
  type: z.literal("FAQ_ACCORDION"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    title: z.string(),
    subtitle: z.string(),
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .min(2)
      .max(6),
  }),
});

const countdownTimerBlock = z.object({
  id: z.string(),
  type: z.literal("COUNTDOWN_TIMER"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    title: z.string(),
    hours: z.number().int().min(1).max(72),
    themeColor: hexColor,
  }),
});

const stockCounterBlock = z.object({
  id: z.string(),
  type: z.literal("STOCK_COUNTER"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    initialStock: z.number().int().min(1),
    currentStock: z.number().int().min(1),
    label: z.string(),
    accentColor: hexColor,
  }),
});

const checkoutFormBlock = z.object({
  id: z.string(),
  type: z.literal("CHECKOUT_FORM"),
  title: z.string(),
  isVisible: z.literal(true),
  settings: z.object({
    title: z.string(),
    subtitle: z.string(),
    normalPrice: z.number().min(0),
    promoPrice: z.number().min(0),
    discountPercent: z.number().int().min(0).max(100),
    scarcityText: z.string(),
    showCourier: z.boolean(),
    paymentOptions: z.array(z.enum(["WHATSAPP", "QRIS_TOKO"])).min(1),
    buttonText: z.string(),
  }),
});

export const generatedBlockSchema = z.discriminatedUnion("type", [
  announcementBarBlock,
  heroBannerBlock,
  featuresGridBlock,
  testimonialsBlock,
  faqAccordionBlock,
  countdownTimerBlock,
  stockCounterBlock,
  checkoutFormBlock,
]);

export const generatedLandingPageSchema = z.object({
  title: z.string().min(3).max(100),
  design: z.object({
    fontFamily: z.enum(["Outfit", "Plus Jakarta Sans", "Inter", "Poppins"]),
    pageWidth: z.enum(["FULL", "CONTAINED", "BOXED"]),
    primaryColor: hexColor,
    backgroundColor: hexColor,
    textColor: hexColor,
    cardRadius: z.enum(["sm", "md", "lg", "xl", "2xl"]),
    themePreset: z.enum(["EMERALD", "MIDNIGHT", "ROSE", "ELECTRIC", "CUSTOM"]),
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    metaKeywords: z.string(),
    noIndex: z.literal(true),
  }),
  blocks: z
    .array(generatedBlockSchema)
    .min(3)
    .max(9)
    .describe(
      "Urutan blok landing page. Blok pertama HARUS bertipe HERO_BANNER, blok terakhir HARUS bertipe CHECKOUT_FORM."
    ),
});

export type GeneratedLandingPage = z.infer<typeof generatedLandingPageSchema>;
export type GeneratedBlock = z.infer<typeof generatedBlockSchema>;
