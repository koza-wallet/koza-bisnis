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

export type OrderStatus = 'MENUNGGU_BAYAR' | 'DIPROSES' | 'DIKIRIM' | 'SELESAI' | 'BATAL';

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
