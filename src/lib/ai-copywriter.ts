import { LandingPage, LandingPageTheme, LandingPageTone } from "@/types";

export interface GenerateLandingPageInput {
  productName: string;
  category?: string;
  sellingPrice: number;
  normalPrice?: number;
  keyBenefits?: string;
  targetAudience?: string;
  tone?: LandingPageTone;
  theme?: LandingPageTheme;
  imageUrl?: string;
  storeId?: string;
  productId?: string;
}

export function generateAICopy(input: GenerateLandingPageInput): Omit<LandingPage, "id" | "createdAt"> {
  const tone = input.tone || "URGENT";
  const theme = input.theme || "EMERALD";
  const promoPrice = input.sellingPrice;
  const normalPrice = input.normalPrice || Math.round((promoPrice * 1.45) / 1000) * 1000;
  const discountPercent = Math.round(((normalPrice - promoPrice) / normalPrice) * 100);

  const slug = input.productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") + "-promo";

  // Framework Hook & Headline based on Tone
  let headline = "";
  let subheadline = "";
  let badge = "";
  let ctaText = "";

  if (tone === "URGENT") {
    badge = "🔥 FLASH SALE HARI INI • DISKON " + discountPercent + "%";
    headline = `Dapatkan ${input.productName} Asli Sekarang Sebelum Kehabisan Stok!`;
    subheadline = `Telah dipercaya lebih dari 2.400+ pelanggan di seluruh Indonesia. Pesan sekarang dapatkan garansi tukar baru & gratis konsultasi!`;
    ctaText = "KLAIM DISKON " + discountPercent + "% SEKARANG";
  } else if (tone === "LUXURY") {
    badge = "✨ PREMIUM SIGNATURE COLLECTION";
    headline = `Kemewahan & Kualitas Terbaik: Hadirkan ${input.productName} untuk Anda`;
    subheadline = `Diciptakan dengan material pilihan dan standar pengerjaan tertinggi. Tampil percaya diri dan eksklusif di setiap kesempatan.`;
    ctaText = "PESAN EXCLUSIVE EDITION";
  } else if (tone === "EMOTIONAL") {
    badge = "❤️ REKOMENDASI TERBAIK KELUARGA";
    headline = `Akhirnya Menemukan yang Benar-Benar Cocok: ${input.productName}`;
    subheadline = `Jangan biarkan rasa tidak nyaman atau ragu menghalangi hari terbaik Anda. Solusi nyata yang dirasakan sejak hari pertama.`;
    ctaText = "COBA SEKARANG DENGAN TENANG";
  } else {
    // SCIENTIFIC
    badge = "🔬 TERUJI & TERVERIFIKASI KUALITASNYA";
    headline = `Formula & Spesifikasi Akurat: ${input.productName}`;
    subheadline = `Kombinasi formulasi tepat yang telah terbukti secara efektif memberikan hasil nyata tanpa kompromi.`;
    ctaText = "DAPATKAN PRODUK ORIGINAL";
  }

  // Pain Points
  const painPoints = [
    {
      title: "Capek coba produk lain tapi hasilnya zonk?",
      description: "Banyak produk di pasaran harganya murah tapi kualitas mengecewakan, gampang rusak, atau tidak sesuai deskripsi foto."
    },
    {
      title: "Khawatir barang tiruan atau palsu?",
      description: "Di luaran banyak tiruan yang tidak terjamin keasliannya dan membahayakan atau bikin rugi uang Anda."
    },
    {
      title: "Pengiriman lama & CS susah dihubungi?",
      description: "Belanja online sering bikin was-was saat paket lama sampai atau penjual menghilang saat ada komplain."
    }
  ];

  // Features
  const features = [
    {
      title: "100% Original & Terjamin",
      description: "Diproduksi dengan standar mutu ketat. Kami tidak pernah berkompromi soal kualitas bahan dan kepuasan Anda.",
      icon: "ShieldCheck"
    },
    {
      title: "Pengiriman Super Kilat",
      description: "Pesanan sebelum jam 15.00 dikirim di hari yang sama dengan kurir terpercaya (SiCepat, J&T, JNE) dilengkapi no. resi otomatis.",
      icon: "Truck"
    },
    {
      title: "Garansi 100% Tukar Baru",
      description: "Jika produk cacat saat sampai atau tidak sesuai foto, kami ganti baru tanpa biaya tambahan sepeser pun.",
      icon: "Award"
    },
    {
      title: "Pelayanan CS Ramah 24 Jam",
      description: "Tim kami siap melayani tanya jawab seputar produk dan update pengiriman langsung melalui WhatsApp.",
      icon: "HeartHandshake"
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Siti Rahmawati",
      role: "Pembeli Terverifikasi • Jakarta Selatan",
      review: `Awalnya ragu beli ${input.productName} secara online, tapi pas paket datang beneran kaget sama kualitasnya! Bahannya halus banget dan rapi. Bakal repeat order lagi pasti!`,
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      verified: true
    },
    {
      name: "Dewi Anggraini",
      role: "Pembeli Terverifikasi • Surabaya",
      review: `Pengirimannya cepet banget cuma 2 hari sampe Surabaya. Adminnya ramah waktu tanya-tanya di WA. Produknya pas banget sesuai ekspektasi. Makasih seller!`,
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      verified: true
    },
    {
      name: "Rina Kusuma",
      role: "Pembeli Terverifikasi • Bandung",
      review: `Worth it banget dengan harga segini dibanding beli di mall yang harganya bisa 2x lipat. Packing rapi ada bubble wrap tebal. Recommended seller bintang 5!`,
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      verified: true
    }
  ];

  // FAQ
  const faq = [
    {
      question: `Apakah ${input.productName} ini dijamin original?`,
      answer: "Pasti 100% Original. Kami memproduksi dan mendistribusikan langsung dari sumber terpercaya dengan pengawasan kualitas ketat."
    },
    {
      question: "Bagaimana cara pembayarannya?",
      answer: "Anda bisa membayar via QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana) atau checkout langsung via WhatsApp dengan konfirmasi instan dari admin kami."
    },
    {
      question: "Berapa lama paket saya akan sampai?",
      answer: "Untuk wilayah Jabodetabek & kota besar di Pulau Jawa estimasi 1-3 hari kerja. Luar Jawa estimasi 3-5 hari kerja menggunakan ekspedisi terpercaya berresi resmi."
    },
    {
      question: "Bagaimana jika barang rusak atau tidak cocok?",
      answer: "Kami memberikan Garansi 100% Tukar Baru atau Uang Kembali jika barang yang Anda terima rusak atau cacat produksi. Cukup chat admin kami dengan menyertakan video unboxing."
    }
  ];

  return {
    storeId: input.storeId || "store-1",
    productId: input.productId,
    slug,
    title: `Promo Spesial - ${input.productName}`,
    theme,
    tone,
    hero: {
      badge,
      headline,
      subheadline,
      ctaText,
      heroImageUrl: input.imageUrl || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      countdownHours: 12
    },
    problemSection: {
      title: "Apakah Anda Sering Mengalami Hal Ini?",
      subtitle: "Banyak orang membuang waktu & uang karena memilih produk yang salah:",
      painPoints
    },
    solutionSection: {
      title: `Solusi Nyata: ${input.productName}`,
      description: input.keyBenefits || "Diformulasikan khusus untuk memberikan hasil terbaik dan kenyamanan maksimal tanpa repot.",
      highlights: [
        "Terbukti memberikan hasil nyata dan konsisten",
        "Material dan bahan baku kualitas grade premium",
        "Praktis, mudah digunakan, dan awet tahan lama",
        "Hemat hingga ratusan ribu dibanding alternatif lain"
      ]
    },
    features,
    testimonials,
    guarantee: {
      title: "Jaminan Garansi 100% Uang Kembali / Tukar Baru",
      description: "Kami sangat yakin Anda akan puas dengan kualitasnya. Jika produk yang Anda terima cacat atau tidak sesuai deskripsi, kami ganti baru tanpa ribet!"
    },
    faq,
    pricing: {
      normalPrice,
      promoPrice,
      discountPercent,
      scarcityText: "🔥 Stok Terbatas: Sisa 14 Pcs Hari Ini",
      bonusGift: "Gratis Pouch Eksklusif & E-Book Panduan Senilai Rp 50.000"
    },
    pixels: {
      metaPixelId: "",
      tiktokPixelId: ""
    },
    analytics: {
      viewsCount: 142,
      ordersCount: 9,
      conversionRate: 6.3
    },
    isPublished: true
  };
}
