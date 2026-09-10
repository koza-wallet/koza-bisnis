import { Store, Product, Order, OperationalExpense, QuotaPackage, LandingPage, CourierOption } from '@/types';

export const initialStore: Store = {
  id: 'store-1',
  slug: 'hijabcantik',
  name: 'Hijab Cantik Bandung',
  description: 'Pusat Fashion Muslim, Gamis & Pashmina Premium Bandung. Pengiriman Cepat & Garansi 100% Original.',
  logoUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=80',
  whatsappNumber: '6281234567890',
  originCity: 'Kota Bandung',
  originDistrict: 'Coblong',
  quotaBalance: 98,
  plan: 'PRO_MONTHLY',
  planExpiryDate: '2026-10-09T00:00:00.000Z',
  bankName: 'BCA',
  bankAccountNumber: '7720-1234-56',
  bankAccountName: 'Siti Rahmawati (Hijab Cantik)',
  qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226580014ID.LINKAJA.WWW01189360091100212345675204581253033605802ID5919Hijab+Cantik+Bandung6007Bandung61054013262070703A016304',
  enabledCouriers: ['JNT', 'JNE', 'SICEPAT', 'JTR'],
  createdAt: '2026-09-01T08:00:00.000Z',
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    name: 'Gamis Silk Premium Floral Edition',
    slug: 'gamis-silk-premium',
    description: 'Bahan sutra premium super adem, jatuh anggun, tidak menerawang. Jahitan butik rapi dengan kancing mutiara wudhu friendly.',
    sellingPrice: 145000,
    costPrice: 85000,
    weightGrams: 350,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    category: 'Gamis',
    isActive: true,
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    name: 'Pashmina Ceruty Babydoll Anti Kusut',
    slug: 'pashmina-ceruty-babydoll',
    description: 'Pashmina tekstur pasir lembut, mudah dibentuk, adem dipakai seharian. Jahitan tepi rapi khas butik.',
    sellingPrice: 45000,
    costPrice: 22000,
    weightGrams: 150,
    stock: 65,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    category: 'Pashmina',
    isActive: true,
    createdAt: '2026-09-02T10:00:00.000Z',
  },
  {
    id: 'prod-3',
    storeId: 'store-1',
    name: 'Dress Katun Linen Polos A-Line',
    slug: 'dress-katun-linen-polos',
    description: 'Desain minimalis kasual dengan material katun linen organik. Ada saku di kanan-kiri, cocok untuk hangout atau pengajian.',
    sellingPrice: 120000,
    costPrice: 68000,
    weightGrams: 300,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    category: 'Dress',
    isActive: true,
    createdAt: '2026-09-03T11:00:00.000Z',
  },
  {
    id: 'prod-4',
    storeId: 'store-1',
    name: 'Khimar Syari 2 Layer Soft Pad',
    slug: 'khimar-syari-2-layer',
    description: 'Khimar instan langsung slup, pet busa antem (anti tembem), menutup dada sempurna. Nyaman untuk aktivitas harian.',
    sellingPrice: 75000,
    costPrice: 38000,
    weightGrams: 250,
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
    category: 'Hijab',
    isActive: true,
    createdAt: '2026-09-04T12:00:00.000Z',
  },
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'KZ-2609-8421',
    storeId: 'store-1',
    customerName: 'Dewi Lestari',
    customerPhone: '081987654321',
    customerAddress: 'Jl. Margonda Raya No. 45, RT 02/RW 07',
    destinationCity: 'Kota Depok',
    destinationDistrict: 'Beji',
    courierName: 'J&T Express',
    courierService: 'EZ (Reguler 1-2 Hari)',
    shippingCost: 14000,
    itemsTotal: 145000,
    grandTotal: 159000,
    totalCostPrice: 85000,
    netProfit: 60000,
    status: 'SELESAI',
    trackingNumber: 'JT9283741829',
    paymentMethod: 'WHATSAPP',
    items: [
      {
        productId: 'prod-1',
        productName: 'Gamis Silk Premium Floral Edition',
        quantity: 1,
        unitPrice: 145000,
        unitCost: 85000,
        weightGrams: 350,
        subtotal: 145000,
      },
    ],
    createdAt: '2026-09-07T14:20:00.000Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'KZ-2609-5192',
    storeId: 'store-1',
    customerName: 'Anisa Fitriani',
    customerPhone: '081299887766',
    customerAddress: 'Komplek Melati Indah Blok C3 No. 12',
    destinationCity: 'Kota Tangerang Selatan',
    destinationDistrict: 'Pamulang',
    courierName: 'SiCepat',
    courierService: 'REG (1-2 Hari)',
    shippingCost: 13000,
    itemsTotal: 90000,
    grandTotal: 103000,
    totalCostPrice: 44000,
    netProfit: 46000,
    status: 'DIPROSES',
    paymentMethod: 'QRIS_TOKO',
    items: [
      {
        productId: 'prod-2',
        productName: 'Pashmina Ceruty Babydoll Anti Kusut',
        quantity: 2,
        unitPrice: 45000,
        unitCost: 22000,
        weightGrams: 150,
        subtotal: 90000,
      },
    ],
    createdAt: '2026-09-08T09:15:00.000Z',
  },
];

export const initialExpenses: OperationalExpense[] = [
  {
    id: 'exp-1',
    storeId: 'store-1',
    category: 'PACKING',
    description: 'Plastik polymailer 50 pcs + Lakban fragile',
    amount: 35000,
    date: '2026-09-06T10:00:00.000Z',
  },
  {
    id: 'exp-2',
    storeId: 'store-1',
    category: 'BENSIN',
    description: 'Bensin drop paket ke counter J&T',
    amount: 20000,
    date: '2026-09-07T16:00:00.000Z',
  },
];

// Paket Top-Up Kuota: Non-Pro (Rp 1.000/tx) vs Pro Member (Rp 250/tx - HEMAT 75%)
export const quotaPackages: QuotaPackage[] = [
  // Non-Pro Packages
  {
    id: 'pkg-nonpro-50',
    code: 'NONPRO_50',
    name: 'Top-Up 50 Order (Non-Pro)',
    quota: 50,
    originalPrice: 50000,
    price: 50000,
    pricePerOrder: 1000,
    discountPercent: 0,
    badge: 'Starter Non-Pro',
    tier: 'NON_PRO',
  },
  {
    id: 'pkg-nonpro-100',
    code: 'NONPRO_100',
    name: 'Top-Up 100 Order (Non-Pro)',
    quota: 100,
    originalPrice: 100000,
    price: 100000,
    pricePerOrder: 1000,
    discountPercent: 0,
    badge: 'Standar Non-Pro',
    tier: 'NON_PRO',
  },
  // Pro Member Packages (Hemat 75%)
  {
    id: 'pkg-pro-200',
    code: 'PRO_200',
    name: 'Top-Up 200 Order (Pro)',
    quota: 200,
    bonusOrders: 50,
    originalPrice: 200000,
    price: 50000,
    pricePerOrder: 250,
    discountPercent: 75,
    badge: 'Paling Laris',
    popular: true,
    tier: 'PRO',
  },
  {
    id: 'pkg-pro-400',
    code: 'PRO_400',
    name: 'Top-Up 400 Order (Pro)',
    quota: 400,
    bonusOrders: 100,
    originalPrice: 400000,
    price: 100000,
    pricePerOrder: 250,
    discountPercent: 75,
    badge: 'Best Value',
    tier: 'PRO',
  },
  {
    id: 'pkg-pro-1000',
    code: 'PRO_1000',
    name: 'Top-Up 1.000 Order (Pro)',
    quota: 1000,
    bonusOrders: 250,
    originalPrice: 1000000,
    price: 250000,
    pricePerOrder: 250,
    discountPercent: 75,
    badge: 'Sultan Juragan',
    tier: 'PRO',
  },
];

export const destinationOptions = [
  { city: 'Kota Jakarta Selatan', district: 'Kebayoran Baru', baseRate: 11000 },
  { city: 'Kota Jakarta Barat', district: 'Kebon Jeruk', baseRate: 11000 },
  { city: 'Kota Depok', district: 'Beji', baseRate: 13000 },
  { city: 'Kota Tangerang Selatan', district: 'Pamulang', baseRate: 13000 },
  { city: 'Kota Bandung', district: 'Coblong', baseRate: 9000 },
  { city: 'Kota Surabaya', district: 'Gubeng', baseRate: 18000 },
  { city: 'Kota Semarang', district: 'Banyumanik', baseRate: 16000 },
  { city: 'Kota Medan', district: 'Medan Baru', baseRate: 28000 },
  { city: 'Kota Makassar', district: 'Panakkukang', baseRate: 34000 },
];

export const MASTER_COURIERS: CourierOption[] = [
  {
    code: 'JNT',
    name: 'J&T Express',
    service: 'EZ (Reguler 1-2 Hari)',
    category: 'REGULER',
    description: 'Jangkauan luas ke seluruh pelosok Indonesia dengan penjemputan cepat.',
    defaultRateOffset: 2000,
  },
  {
    code: 'JNE',
    name: 'JNE',
    service: 'Reguler (1-2 Hari)',
    category: 'REGULER',
    description: 'Pelopor ekspedisi terpercaya dengan jaringan agen terlengkap.',
    defaultRateOffset: 1000,
  },
  {
    code: 'SICEPAT',
    name: 'SiCepat',
    service: 'REG (1-2 Hari)',
    category: 'REGULER',
    description: 'Tarif bersahabat dan kecepatan pengiriman prima.',
    defaultRateOffset: 0,
  },
  {
    code: 'ANTERAJA',
    name: 'Anteraja',
    service: 'Regular (1-3 Hari)',
    category: 'REGULER',
    description: 'Layanan terintegrasi dengan penjemputan langsung ke lokasi seller.',
    defaultRateOffset: 0,
  },
  {
    code: 'JTR',
    name: 'JTR (JNE Trucking)',
    service: 'Kargo Muatan Berat (3-5 Hari)',
    category: 'KARGO',
    description: 'Spesialis pengiriman barang besar & berat (≥ 10 kg) dengan tarif kargo hemat.',
    defaultRateOffset: 5000,
  },
  {
    code: 'JNTCARGO',
    name: 'J&T Cargo',
    service: 'Kargo Paket Besar (2-4 Hari)',
    category: 'KARGO',
    description: 'Pengiriman paket besar & partai grosir cepat ke seluruh kota di Indonesia.',
    defaultRateOffset: 7000,
  },
  {
    code: 'INDAH',
    name: 'Indah Logistik Cargo',
    service: 'Kargo Partai Besar (3-6 Hari)',
    category: 'KARGO',
    description: 'Pilihan utama distributor dan pabrik untuk muatan koli besar antarpulau.',
    defaultRateOffset: 4000,
  },
];

export const initialLandingPages: LandingPage[] = [
  {
    id: "lp-1",
    storeId: "store-1",
    productId: "prod-1",
    slug: "gamis-silk-premium-promo",
    title: "Promo Gamis Silk Premium Floral",
    theme: "EMERALD",
    tone: "URGENT",
    hero: {
      badge: "🔥 FLASH SALE HARI INI • DISKON 36%",
      headline: "Tampil Anggun & Berkelas dengan Gamis Silk Premium Floral Edition",
      subheadline: "Material sutra premium super adem, jatuh anggun, dan tidak menerawang. Telah dipercaya 2.400+ muslimah di seluruh Indonesia.",
      ctaText: "KLAIM DISKON 36% SEKARANG",
      heroImageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      countdownHours: 8
    },
    problemSection: {
      title: "Pernahkah Anda Mengalami Hal Ini?",
      subtitle: "Banyak wanita mengeluhkan masalah serupa saat membeli gamis online:",
      painPoints: [
        {
          title: "Bahan Panas & Gerah?",
          description: "Sering beli gamis tapi bahannya kaku, bikin keringetan, dan tidak nyaman dipakai seharian di cuaca tropis."
        },
        {
          title: "Menerawang & Kurang Santun?",
          description: "Bahan tipis yang terawang bikin was-was dan harus repot pakai furing atau inner tambahan."
        },
        {
          title: "Jahitan Kasar & Gampang Robek?",
          description: "Baru sekali cuci jahitan sudah lepas atau benang brudul karena kualitas konveksi murahan."
        }
      ]
    },
    solutionSection: {
      title: "Solusi Nyata: Gamis Silk Premium",
      description: "Didesain khusus dengan standar butik premium untuk kenyamanan maksimal Anda tanpa kompromi.",
      highlights: [
        "100% Sutra Silk Halus & Super Adem",
        "Cutting A-Line Anggun Menyamarkan Lekuk Tubuh",
        "Wudhu Friendly dengan Kancing Mutiara Eksklusif",
        "Anti Kusut & Mudah Disetrika"
      ]
    },
    features: [
      {
        title: "Material Sutra Premium",
        description: "Tekstur kain lembut berkarakter jatuh mewah, tidak panas saat dipakai dari pagi sampai malam.",
        icon: "Sparkles"
      },
      {
        title: "Pengiriman Super Kilat",
        description: "Pesanan sebelum 15.00 langsung dikirim hari ini dengan kurir pilihan (SiCepat / J&T / JNE) ber-resi resmi.",
        icon: "Truck"
      },
      {
        title: "Garansi 100% Tukar Baru",
        description: "Salah ukuran atau ada cacat saat diterima? Kami ganti baru tanpa ribet dan tanpa biaya tambahan.",
        icon: "Award"
      },
      {
        title: "Garansi 100% Original",
        description: "Diproduksi langsung oleh pengrajin butik terpercaya di Bandung dengan standar kontrol kualitas tinggi.",
        icon: "ShieldCheck"
      }
    ],
    testimonials: [
      {
        name: "Siti Rahmawati",
        role: "Pembeli Terverifikasi • Jakarta",
        review: "Kaget banget pas barang dateng, bahannya lembuttt banget dan beneran gak nerawang! Dipake ke kondangan banyak yang muji. Rekomen parah!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        verified: true
      },
      {
        name: "Dewi Anggraini",
        role: "Pembeli Terverifikasi • Surabaya",
        review: "Pengiriman cepat 2 hari nyampe Surabaya. Packing rapi wangi, ukurannya pas banget. Bakal koleksi warna lainnya!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        verified: true
      },
      {
        name: "Rina Marlina",
        role: "Pembeli Terverifikasi • Bandung",
        review: "Jahitannya sekelas butik mall yang harganya 400 ribuan keatas. Worth it parah cuma seratus ribuan di KoZa!",
        rating: 5,
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        verified: true
      }
    ],
    guarantee: {
      title: "Garansi Kepuasan 100% Tanpa Risiko",
      description: "Kami mengutamakan kepuasan Anda. Jika produk yang Anda terima cacat atau tidak sesuai foto, kami siap ganti baru atau uang kembali utuh!"
    },
    faq: [
      {
        question: "Apakah bahannya menerawang?",
        answer: "Sama sekali tidak. Silk Premium kami memiliki gramasi benang yang rapat sehingga tidak tembus pandang namun tetap ringan dan adem."
      },
      {
        question: "Bagaimana cara pembayaran?",
        answer: "Bisa bayar langsung via QRIS instan otomatis atau checkout WhatsApp langsung terhubung ke admin kami."
      },
      {
        question: "Berapa lama estimasi pengiriman?",
        answer: "Untuk Pulau Jawa 1-3 hari kerja. Luar Pulau Jawa 3-5 hari kerja menggunakan SiCepat / J&T / JNE."
      },
      {
        question: "Bisa tukar kalau ukuran kebesaran/kekecilan?",
        answer: "Bisa! Cukup hubungi WhatsApp admin kami maksimal 2x24 jam setelah paket diterima."
      }
    ],
    pricing: {
      normalPrice: 225000,
      promoPrice: 145000,
      discountPercent: 36,
      scarcityText: "🔥 Stok Terbatas: Sisa 12 Pcs Hari Ini",
      bonusGift: "Bonus Bros Jilbab Mutiara Eksklusif Senilai Rp 25.000"
    },
    pixels: {
      metaPixelId: "",
      tiktokPixelId: ""
    },
    analytics: {
      viewsCount: 384,
      ordersCount: 26,
      conversionRate: 6.8
    },
    isPublished: true,
    createdAt: "2026-09-05T10:00:00.000Z"
  }
];
