import { BlockCatalogItem, BuilderBlock, BuilderTemplate, BlockType } from "@/types/builder";

// Katalog Pilihan Blok untuk Modal "+ Tambah Seksi"
export const BLOCK_CATALOG: BlockCatalogItem[] = [
  // 1. Header & Hero
  {
    type: "HERO_BANNER",
    name: "Hero Banner",
    description: "Headline memikat, gambar utama produk, tombol CTA, dan hitung mundur promo.",
    category: "HEADER_HERO",
    iconName: "Flame",
    badge: "Wajib",
  },
  {
    type: "ANNOUNCEMENT_BAR",
    name: "Bar Pengumuman Urgensi",
    description: "Pita teks mendesak di bagian paling atas (misal: Gratis Ongkir Hari Ini Saja!).",
    category: "HEADER_HERO",
    iconName: "Zap",
  },

  // 2. Media & Showcase
  {
    type: "VIDEO_EMBED",
    name: "Video TikTok / YouTube",
    description: "Sematkan video review produk berformat vertikal 9:16 atau horizontal 16:9.",
    category: "MEDIA_SHOWCASE",
    iconName: "PlayCircle",
    badge: "Viral",
  },
  {
    type: "IMAGE_SLIDER",
    name: "Slider Foto Produk",
    description: "Galeri foto interaktif yang bisa digeser dengan mudah di layar smartphone.",
    category: "MEDIA_SHOWCASE",
    iconName: "Images",
  },
  {
    type: "IMAGE_GALLERY",
    name: "Grid Foto Detail / Before-After",
    description: "Grid 2 atau 3 kolom untuk menampilkan detail bahan, jahitan, atau testimoni visual.",
    category: "MEDIA_SHOWCASE",
    iconName: "LayoutGrid",
  },

  // 3. Konten & Edukasi
  {
    type: "RICH_TEXT",
    name: "Teks Cerita / Storytelling",
    description: "Paragraf cerita mendalam untuk membangun empati masalah pembeli.",
    category: "CONTENT_STORY",
    iconName: "Type",
  },
  {
    type: "FEATURES_GRID",
    name: "Kartu Keunggulan Produk",
    description: "Daftar 4 keunggulan kompetitif produk lengkap dengan ikon elegan.",
    category: "CONTENT_STORY",
    iconName: "CheckCircle2",
  },
  {
    type: "SPACER_DIVIDER",
    name: "Pemisah Seksi Estetis",
    description: "Ruang kosong atau tirai garis lengkung untuk memisahkan konten antar seksi.",
    category: "CONTENT_STORY",
    iconName: "Divide",
  },

  // 4. Kepercayaan & Social Proof
  {
    type: "TESTIMONIALS",
    name: "Ulasan Pembeli Bintang 5",
    description: "Review pembeli autentik dengan foto profil dan badge 'Pembeli Terverifikasi'.",
    category: "TRUST_PROOF",
    iconName: "Star",
    badge: "Konversi Tinggi",
  },
  {
    type: "FAQ_ACCORDION",
    name: "Tanya Jawab (FAQ)",
    description: "Daftar pertanyaan yang paling sering diajukan pembeli dengan efek buka-tutup.",
    category: "TRUST_PROOF",
    iconName: "HelpCircle",
  },
  {
    type: "SALES_TOAST",
    name: "Notifikasi Pembeli Real-time",
    description: "Pop-up mengambang otomatis pembeli yang baru saja checkout (Social Proof).",
    category: "TRUST_PROOF",
    iconName: "BellRing",
    badge: "PRO",
  },

  // 5. Urgensi & Kelangkaan
  {
    type: "COUNTDOWN_TIMER",
    name: "Jam Hitung Mundur Promo",
    description: "Timer mundur detik demi detik untuk memicu aksi beli sekarang tanpa menunda.",
    category: "SCARCITY_URGENCY",
    iconName: "Clock",
  },
  {
    type: "STOCK_COUNTER",
    name: "Indikator Sisa Stok",
    description: "Bar visual persentase sisa stok promosi (misal: Sisa 12 pcs lagi!).",
    category: "SCARCITY_URGENCY",
    iconName: "Layers",
  },

  // 6. Penjualan & Checkout
  {
    type: "CHECKOUT_FORM",
    name: "Form Checkout 1-Klik",
    description: "Formulir pemesanan langsung terintegrasi kurir, WhatsApp closing, dan QRIS Toko.",
    category: "SALES_CHECKOUT",
    iconName: "ShoppingCart",
    badge: "Closing Engine",
  },
  {
    type: "STICKY_BOTTOM_CTA",
    name: "Tombol Sticky Beli di HP",
    description: "Tombol melayang di bagian bawah smartphone yang selalu terlihat saat di-scroll.",
    category: "SALES_CHECKOUT",
    iconName: "CreditCard",
  },
];

// Helper membuat default settings blok baru
export function createDefaultBlock(type: BlockType): BuilderBlock {
  const id = "blk-" + Math.random().toString(36).substring(2, 9);
  
  switch (type) {
    case "HERO_BANNER":
      return {
        id,
        type,
        title: "Hero Banner",
        isVisible: true,
        settings: {
          badge: "🔥 PROMO TERBATAS HARI INI",
          headline: "Tampil Percaya Diri dengan Produk Berkualitas Premium",
          subheadline: "Solusi terbaik yang telah dipercaya lebih dari 8.500+ pelanggan di seluruh Indonesia.",
          ctaText: "Pesan Sekarang (Diskon 50%)",
          ctaLink: "#order-form",
          heroImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          showCountdown: true,
          countdownHours: 3,
        },
      };

    case "ANNOUNCEMENT_BAR":
      return {
        id,
        type,
        title: "Bar Pengumuman Urgensi",
        isVisible: true,
        settings: {
          text: "KHUSUS HARI INI: Gratis Ongkir Seluruh Indonesia + Garansi 100% Uang Kembali!",
          highlightText: "FLASH SALE",
          bgColor: "#dc2626",
          textColor: "#ffffff",
        },
      };

    case "VIDEO_EMBED":
      return {
        id,
        type,
        title: "Video TikTok / YouTube",
        isVisible: true,
        settings: {
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          platform: "YOUTUBE",
          aspectRatio: "16:9",
          caption: "Lihat testimoni & unboxing langsung dari pembeli",
          autoPlay: false,
        },
      };

    case "IMAGE_SLIDER":
      return {
        id,
        type,
        title: "Slider Foto Produk",
        isVisible: true,
        settings: {
          images: [
            { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", caption: "Tampak Depan" },
            { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", caption: "Detail Bahan" },
            { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80", caption: "Varian Lengkap" },
          ],
          autoSlide: true,
          showDots: true,
        },
      };

    case "IMAGE_GALLERY":
      return {
        id,
        type,
        title: "Grid Foto Detail",
        isVisible: true,
        settings: {
          columns: 3,
          images: [
            { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80", title: "Kualitas Premium" },
            { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80", title: "Nyaman Digunakan" },
            { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80", title: "Packaging Mewah" },
          ],
        },
      };

    case "RICH_TEXT":
      return {
        id,
        type,
        title: "Teks Cerita / Storytelling",
        isVisible: true,
        settings: {
          title: "Pernahkah Anda Mengalami Masalah Ini?",
          content: "Seringkali kita merasa kecewa saat membeli barang yang ternyata tidak sesuai ekspektasi. Kualitas mengecewakan dan pelayanan lambat.\n\nKini hadir solusi praktis yang dirancang khusus untuk memenuhi ekspektasi Anda tanpa kompromi.",
          alignment: "center",
          highlightBox: true,
        },
      };

    case "FEATURES_GRID":
      return {
        id,
        type,
        title: "Kartu Keunggulan Produk",
        isVisible: true,
        settings: {
          title: "Mengapa Harus Memilih Produk Kami?",
          subtitle: "4 alasan kuat mengapa produk ini jadi pilihan favorit ribuan orang",
          columns: 2,
          items: [
            { icon: "ShieldCheck", title: "Bahan 100% Berkualitas", description: "Diproduksi dengan standar kontrol mutu ketat bergaransi." },
            { icon: "Truck", title: "Pengiriman Cepat & Aman", description: "Bekerjasama dengan kurir resmi terpercaya langsung ke rumah Anda." },
            { icon: "Award", title: "Garansi Kepuasan 100%", description: "Tidak puas? Uang kembali atau ganti baru tanpa ribet." },
            { icon: "Headphones", title: "Layanan Pelanggan 24/7", description: "Admin ramah siap mendampingi proses pesanan kapan pun." },
          ],
        },
      };

    case "TESTIMONIALS":
      return {
        id,
        type,
        title: "Ulasan Pembeli Bintang 5",
        isVisible: true,
        settings: {
          title: "Apa Kata Mereka yang Sudah Mencobanya?",
          subtitle: "Ulasan nyata dari pelanggan setia kami di berbagai kota",
          items: [
            {
              name: "Nadia Putri",
              role: "Jakarta Selatan",
              review: "Awalnya ragu karena sering kecewa beli online. Pas barang sampai beneran takjub, packing rapi dan kualitasnya melebihi harganya!",
              rating: 5,
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
              verified: true,
            },
            {
              name: "Dimas Pratama",
              role: "Surabaya",
              review: "Pengiriman cepet banget cuma 2 hari. Barangnya awet dan pas banget dipakai harian. Sangat recommended!",
              rating: 5,
              avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
              verified: true,
            },
            {
              name: "Rina Kusuma",
              role: "Bandung",
              review: "Adminnya ramah banget ngejelasinnya sabar. Barangnya original dan garansinya beneran amanah. Bintang 5 pokoknya!",
              rating: 5,
              avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
              verified: true,
            },
          ],
        },
      };

    case "FAQ_ACCORDION":
      return {
        id,
        type,
        title: "Tanya Jawab (FAQ)",
        isVisible: true,
        settings: {
          title: "Pertanyaan yang Sering Diajukan",
          subtitle: "Semua jawaban lengkap sebelum Anda memesan",
          items: [
            { question: "Berapa lama proses pengiriman?", answer: "Pesanan dikirim pada hari yang sama. Estimasi 1-3 hari kerja tergantung kota tujuan Anda." },
            { question: "Metode pembayaran apa saja yang didukung?", answer: "Bisa bayar langsung via QRIS instan semua e-wallet/m-banking atau konfirmasi via WhatsApp." },
            { question: "Apakah ada garansi jika barang rusak?", answer: "Tentu ada! Kami beri garansi tukar baru gratis 100% jika terjadi cacat produksi." },
          ],
        },
      };

    case "SALES_TOAST":
      return {
        id,
        type,
        title: "Notifikasi Pembeli Real-time",
        isVisible: true,
        settings: {
          enabled: true,
          intervalSeconds: 6,
          sampleNames: ["Budi", "Siti", "Ahmad", "Dewi", "Reza", "Fitri"],
          sampleCities: ["Bandung", "Surabaya", "Jakarta", "Semarang", "Medan", "Makassar"],
          productLabel: "Paket Promo Spesial",
        },
      };

    case "COUNTDOWN_TIMER":
      return {
        id,
        type,
        title: "Jam Hitung Mundur Promo",
        isVisible: true,
        settings: {
          title: "⚡ PENAWARAN BERAKHIR DALAM:",
          hours: 2,
          themeColor: "#10b981",
        },
      };

    case "STOCK_COUNTER":
      return {
        id,
        type,
        title: "Indikator Sisa Stok",
        isVisible: true,
        settings: {
          initialStock: 100,
          currentStock: 14,
          label: "Peringatan: Stok promo tersisa hanya 14 pcs lagi!",
          accentColor: "#f59e0b",
        },
      };

    case "CHECKOUT_FORM":
      return {
        id,
        type,
        title: "Form Checkout 1-Klik",
        isVisible: true,
        settings: {
          title: "Formulir Pemesanan Resmi",
          subtitle: "Isi data dengan lengkap agar kurir dapat mengantar tepat ke pintu Anda",
          normalPrice: 285000,
          promoPrice: 149000,
          discountPercent: 48,
          scarcityText: "Hemat Rp 136.000 Khusus Pembelian Hari Ini!",
          showCourier: true,
          paymentOptions: ["WHATSAPP", "QRIS_TOKO"],
          buttonText: "Konfirmasi Pesanan Saya Sekarang ➔",
        },
      };

    case "STICKY_BOTTOM_CTA":
      return {
        id,
        type,
        title: "Tombol Sticky Beli di HP",
        isVisible: true,
        settings: {
          text: "Beli Sekarang (Diskon 48%)",
          priceLabel: "Rp 149.000",
          targetAnchor: "#order-form",
        },
      };

    case "SPACER_DIVIDER":
      return {
        id,
        type,
        title: "Pemisah Seksi",
        isVisible: true,
        settings: {
          height: 32,
          style: "line",
        },
      };

    default:
      return {
        id,
        type,
        title: "Seksi Baru",
        isVisible: true,
        settings: {},
      };
  }
}

// 10 Pustaka Template (5 Gratis Non-PRO + 5 Khusus PRO)
export const BUILDER_TEMPLATES: BuilderTemplate[] = [
  // ==================== 5 TEMPLATE GRATIS (NON-PRO) ====================
  {
    id: "tpl-simple-fashion",
    name: "Simple Fashion & Hijab",
    category: "FASHION",
    thumbnailUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
    isPro: false,
    badge: "Starter Gratis",
    description: "Desain anggun bernuansa earth-tone, cocok untuk jualan gamis, hijab, dress, dan busana muslim.",
    design: {
      fontFamily: "Plus Jakarta Sans",
      pageWidth: "CONTAINED",
      primaryColor: "#059669",
      backgroundColor: "#064e3b",
      textColor: "#ffffff",
      cardRadius: "xl",
      themePreset: "EMERALD",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("IMAGE_SLIDER"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-daily-skincare",
    name: "Daily Skincare Basic",
    category: "BEAUTY",
    thumbnailUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    isPro: false,
    badge: "Starter Gratis",
    description: "Layout bersih dan menenangkan, fokus pada hasil kulit glowing dan review bintang 5.",
    design: {
      fontFamily: "Outfit",
      pageWidth: "CONTAINED",
      primaryColor: "#db2777",
      backgroundColor: "#831843",
      textColor: "#ffffff",
      cardRadius: "2xl",
      themePreset: "ROSE",
    },
    blocks: [
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("RICH_TEXT"),
      createDefaultBlock("IMAGE_GALLERY"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("FAQ_ACCORDION"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-kuliner-food",
    name: "Kuliner & Frozen Food",
    category: "FOOD",
    thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
    isPro: false,
    badge: "Starter Gratis",
    description: "Pilihan warna hangat yang menggugah selera untuk sambal kemasan, rendang instan, dan frozen food.",
    design: {
      fontFamily: "Plus Jakarta Sans",
      pageWidth: "CONTAINED",
      primaryColor: "#ea580c",
      backgroundColor: "#7c2d12",
      textColor: "#ffffff",
      cardRadius: "xl",
      themePreset: "ELECTRIC",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("IMAGE_SLIDER"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-gadget-acc",
    name: "Gadget & Aksesoris Murah",
    category: "GADGET",
    thumbnailUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
    isPro: false,
    badge: "Starter Gratis",
    description: "Spesifikasi produk to-the-point dengan countdown jam mundur promo hemat smartwatch dan TWS.",
    design: {
      fontFamily: "Inter",
      pageWidth: "CONTAINED",
      primaryColor: "#0284c7",
      backgroundColor: "#082f49",
      textColor: "#ffffff",
      cardRadius: "lg",
      themePreset: "MIDNIGHT",
    },
    blocks: [
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("COUNTDOWN_TIMER"),
      createDefaultBlock("IMAGE_GALLERY"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-jasa-portfolio",
    name: "Jasa & Portofolio Bisnis",
    category: "SERVICES",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    isPro: false,
    badge: "Starter Gratis",
    description: "Halaman landing elegan untuk jasa fotografi, konsultan, desain grafis, dan jasa periklanan.",
    design: {
      fontFamily: "Outfit",
      pageWidth: "CONTAINED",
      primaryColor: "#10b981",
      backgroundColor: "#022c22",
      textColor: "#ffffff",
      cardRadius: "xl",
      themePreset: "EMERALD",
    },
    blocks: [
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("RICH_TEXT"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("FAQ_ACCORDION"),
      createDefaultBlock("CHECKOUT_FORM"),
    ],
  },

  // ==================== 5 TEMPLATE EKSKLUSIF PRO ====================
  {
    id: "tpl-viral-tiktok",
    name: "Viral TikTok Direct-Response",
    category: "VIRAL_TIKTOK",
    thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80",
    isPro: true,
    badge: "👑 PRO Exclusive",
    description: "Format vertikal dioptimalkan untuk lalu lintas iklan TikTok Ads, dilengkapi video player dan social proof aktif.",
    design: {
      fontFamily: "Plus Jakarta Sans",
      pageWidth: "CONTAINED",
      primaryColor: "#f43f5e",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      cardRadius: "2xl",
      themePreset: "ELECTRIC",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("VIDEO_EMBED"),
      createDefaultBlock("STOCK_COUNTER"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("SALES_TOAST"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-midnight-luxe",
    name: "Midnight Luxe Skincare",
    category: "BEAUTY",
    thumbnailUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
    isPro: true,
    badge: "👑 PRO Exclusive",
    description: "Estetika hitam emas (*Dark Luxury*) untuk kosmetik premium dengan sertifikasi BPOM dan ulasan berfoto.",
    design: {
      fontFamily: "Outfit",
      pageWidth: "CONTAINED",
      primaryColor: "#f59e0b",
      backgroundColor: "#0a0a0a",
      textColor: "#ffffff",
      cardRadius: "2xl",
      themePreset: "MIDNIGHT",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("RICH_TEXT"),
      createDefaultBlock("IMAGE_SLIDER"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("COUNTDOWN_TIMER"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-herbal-suplemen",
    name: "Formula AIDA Herbal & Kesehatan",
    category: "HERBAL",
    thumbnailUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
    isPro: true,
    badge: "👑 PRO Exclusive",
    description: "Struktur copywriting AIDA medis: hook masalah kesehatan, edukasi herbal alami, legalitas izin BPOM, dan garansi uang kembali.",
    design: {
      fontFamily: "Plus Jakarta Sans",
      pageWidth: "CONTAINED",
      primaryColor: "#10b981",
      backgroundColor: "#062e24",
      textColor: "#ffffff",
      cardRadius: "xl",
      themePreset: "EMERALD",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("RICH_TEXT"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("IMAGE_GALLERY"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("FAQ_ACCORDION"),
      createDefaultBlock("STOCK_COUNTER"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-flash-sale-cyber",
    name: "Flash Sale Cyber Urgency",
    category: "GADGET",
    thumbnailUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&auto=format&fit=crop&q=80",
    isPro: true,
    badge: "👑 PRO Exclusive",
    description: "Template agresif untuk clearance sale, stok terbatas, dan batas waktu 2 jam dengan indikator kuota pembeli.",
    design: {
      fontFamily: "Inter",
      pageWidth: "CONTAINED",
      primaryColor: "#ef4444",
      backgroundColor: "#180606",
      textColor: "#ffffff",
      cardRadius: "xl",
      themePreset: "ELECTRIC",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("COUNTDOWN_TIMER"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("STOCK_COUNTER"),
      createDefaultBlock("IMAGE_SLIDER"),
      createDefaultBlock("SALES_TOAST"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
  {
    id: "tpl-multi-bundle",
    name: "Multi-Bundle Paket Hemat",
    category: "FASHION",
    thumbnailUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
    isPro: true,
    badge: "👑 PRO Exclusive",
    description: "Pilihan paket berjenjang: Beli 1 (Harga Normal), Beli 2 (Diskon 30%), Beli 3 (Gratis 1 + Gratis Ongkir).",
    design: {
      fontFamily: "Outfit",
      pageWidth: "CONTAINED",
      primaryColor: "#6366f1",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      cardRadius: "2xl",
      themePreset: "MIDNIGHT",
    },
    blocks: [
      createDefaultBlock("ANNOUNCEMENT_BAR"),
      createDefaultBlock("HERO_BANNER"),
      createDefaultBlock("IMAGE_GALLERY"),
      createDefaultBlock("FEATURES_GRID"),
      createDefaultBlock("TESTIMONIALS"),
      createDefaultBlock("FAQ_ACCORDION"),
      createDefaultBlock("CHECKOUT_FORM"),
      createDefaultBlock("STICKY_BOTTOM_CTA"),
    ],
  },
];
