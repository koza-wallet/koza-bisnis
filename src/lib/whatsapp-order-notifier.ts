import { sendWhatsAppMessage } from './whatsapp-gateway';

export interface OrderItemPayload {
  name?: string;
  productName?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface OrderPayload {
  id?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  courierName?: string;
  shippingCost?: number;
  grandTotal: number;
  paymentMethod: string;
  items?: OrderItemPayload[];
}

export interface StorePayload {
  id: string;
  name: string;
  slug: string;
  whatsappNumber?: string;
  whatsapp_bot_settings?: {
    status?: string;
    isActive?: boolean;
    deviceToken?: string;
    provider?: 'fonnte' | 'wablas' | 'custom';
    serverUrl?: string;
    enableAICustomerService?: boolean;
    notifyBuyerOrder?: boolean;
    notifyBuyerShipping?: boolean;
    notifySellerOrderAlert?: boolean;
  } | null;
}

/**
 * Mengirim notifikasi otomatis saat ada pesanan baru:
 * 1. Ke WhatsApp Pembeli (rincian pesanan & tautan lacak).
 * 2. Ke WhatsApp Penjual (alert pesanan masuk agar segera diproses).
 */
export async function notifyNewOrderOnWhatsApp({
  order,
  store,
}: {
  order: OrderPayload;
  store: StorePayload;
}): Promise<{ buyerSent: boolean; sellerSent: boolean }> {
  const botSettings = store.whatsapp_bot_settings;
  const isBotActive =
    botSettings?.status === 'CONNECTED' &&
    botSettings?.isActive !== false &&
    Boolean(botSettings?.deviceToken);

  if (!isBotActive || !botSettings?.deviceToken) {
    return { buyerSent: false, sellerSent: false };
  }

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kozabisnis.com';
  const trackingUrl = `${appOrigin}/lacak/${order.orderNumber}`;

  let buyerSent = false;
  let sellerSent = false;

  // 1. Kirim Notifikasi ke Pembeli (hanya jika saklar notifyBuyerOrder !== false)
  if (order.customerPhone && botSettings.notifyBuyerOrder !== false) {
    const itemsListText = (order.items || [])
      .map((item, idx) => {
        const itemName = item.name || item.productName || 'Produk';
        const itemPrice = item.price ?? item.unitPrice ?? 0;
        const total = item.subtotal ?? itemPrice * item.quantity;
        return `  ${idx + 1}. ${itemName} (${item.quantity}x) — Rp ${Number(total).toLocaleString('id-ID')}`;
      })
      .join('\n');

    const buyerMessage = `Halo Kak *${order.customerName}*! 👋
Terima kasih sudah berbelanja di *${store.name}* 🙏

Pesanan kakak telah kami terima dengan rincian:
📦 *No. Pesanan*: #${order.orderNumber}
${itemsListText ? `📋 *Produk*:\n${itemsListText}\n` : ''}💰 *Total Pembayaran*: Rp ${Number(order.grandTotal).toLocaleString('id-ID')}
🚚 *Metode Kirim*: ${order.courierName || 'Kurir Pilihan'}
💳 *Pembayaran*: ${order.paymentMethod === 'QRIS_TOKO' ? 'QRIS / Transfer' : 'WhatsApp / COD'}

Pantau status pesanan kakak di sini:
👉 ${trackingUrl}

Pesanan kakak akan segera disiapkan oleh tim kami. Terima kasih banyak ya kak! 😊`;

    try {
      const res = await sendWhatsAppMessage({
        provider: botSettings.provider || 'fonnte',
        token: botSettings.deviceToken,
        targetPhone: order.customerPhone,
        message: buyerMessage,
        serverUrl: botSettings.serverUrl,
      });
      buyerSent = res.success;
    } catch (err) {
      console.warn('[NOTIFIER] Gagal mengirim WhatsApp pesanan baru ke pembeli:', err);
    }
  }

  // 2. Kirim Alert ke Penjual (Owner Toko) (hanya jika saklar notifySellerOrderAlert !== false)
  if (store.whatsappNumber && botSettings.notifySellerOrderAlert !== false) {
    const sellerAlertMessage = `🔔 *ADA PESANAN BARU MASUK!*
Toko: *${store.name}*

📋 *No. Pesanan*: #${order.orderNumber}
👤 *Pembeli*: ${order.customerName} (${order.customerPhone})
💰 *Total Transaksi*: Rp ${Number(order.grandTotal).toLocaleString('id-ID')}
🚚 *Ekspedisi*: ${order.courierName || 'Kurir Pilihan'}

Buka dan proses pesanan sekarang di Dashboard:
👉 ${appOrigin}/dashboard/pesanan`;

    try {
      const res = await sendWhatsAppMessage({
        provider: botSettings.provider || 'fonnte',
        token: botSettings.deviceToken,
        targetPhone: store.whatsappNumber,
        message: sellerAlertMessage,
        serverUrl: botSettings.serverUrl,
      });
      sellerSent = res.success;
    } catch (err) {
      console.warn('[NOTIFIER] Gagal mengirim alert pesanan baru ke seller:', err);
    }
  }

  return { buyerSent, sellerSent };
}

/**
 * Mengirim notifikasi otomatis ke WhatsApp Pembeli saat nomor resi diinput oleh penjual.
 */
export async function notifyShippingResiOnWhatsApp({
  order,
  store,
  trackingNumber,
}: {
  order: OrderPayload;
  store: StorePayload;
  trackingNumber: string;
}): Promise<boolean> {
  const botSettings = store.whatsapp_bot_settings;
  const isBotActive =
    botSettings?.status === 'CONNECTED' &&
    botSettings?.isActive !== false &&
    Boolean(botSettings?.deviceToken);

  if (
    !isBotActive ||
    !botSettings?.deviceToken ||
    !order.customerPhone ||
    botSettings.notifyBuyerShipping === false
  ) {
    return false;
  }

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kozabisnis.com';
  const trackingUrl = `${appOrigin}/lacak/${order.orderNumber}`;

  const message = `Halo Kak *${order.customerName}*! 🚚📦
Kabar gembira! Paket pesananmu *#${order.orderNumber}* dari *${store.name}* telah dikirimkan.

📋 *Detail Pengiriman*:
- Ekspedisi: *${order.courierName || 'Kurir Ekspedisi'}*
- No. Resi: *${trackingNumber}*

Lacak pergerakan paket secara langsung di tautan resmi ini:
👉 ${trackingUrl}

Mohon pastikan nomor telepon aktif ya kak saat kurir mengantar paket. Terima kasih banyak sudah berbelanja di toko kami! 🙏✨`;

  try {
    const res = await sendWhatsAppMessage({
      provider: botSettings.provider || 'fonnte',
      token: botSettings.deviceToken,
      targetPhone: order.customerPhone,
      message,
      serverUrl: botSettings.serverUrl,
    });
    return res.success;
  } catch (err) {
    console.warn('[NOTIFIER] Gagal mengirim notifikasi resi ke pembeli:', err);
    return false;
  }
}
