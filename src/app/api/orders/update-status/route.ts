import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notifyShippingResiOnWhatsApp } from '@/lib/whatsapp-order-notifier';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { orderId, status, trackingNumber } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: 'orderId dan status wajib diisi.' },
        { status: 400 }
      );
    }

    // Ambil toko milik user
    const { data: store } = await supabase
      .from('stores')
      .select('id, name, slug, whatsapp_number, whatsapp_bot_settings')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json({ success: false, message: 'Toko tidak ditemukan.' }, { status: 404 });
    }

    // Ambil order yang bersangkutan dan verifikasi kepemilikan
    const { data: order, error: orderFetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('store_id', store.id)
      .maybeSingle();

    if (orderFetchErr || !order) {
      return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan.' }, { status: 404 });
    }

    // Siapkan payload update
    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    };

    const cleanResi = trackingNumber ? String(trackingNumber).trim() : undefined;
    if (cleanResi !== undefined) {
      updatePayload.tracking_number = cleanResi;
    }

    const { error: updateErr } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (updateErr) {
      console.error('[UPDATE-ORDER-STATUS] Error updating order:', updateErr);
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui status pesanan.' },
        { status: 500 }
      );
    }

    // Picu Notifikasi WhatsApp Otomatis jika status DIKIRIM dan ada resi
    let notificationSent = false;
    const finalResi = cleanResi || order.tracking_number;

    if (status === 'DIKIRIM' && finalResi && store.whatsapp_bot_settings?.status === 'CONNECTED') {
      try {
        notificationSent = await notifyShippingResiOnWhatsApp({
          order: {
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerPhone: order.customer_phone,
            courierName: order.courier_name,
            grandTotal: order.grand_total,
            paymentMethod: order.payment_method,
          },
          store: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            whatsapp_bot_settings: store.whatsapp_bot_settings,
          },
          trackingNumber: finalResi,
        });
      } catch (notifErr) {
        console.warn('[UPDATE-ORDER-STATUS] Error sending resi WA notification:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Status pesanan berhasil diperbarui.',
      status,
      trackingNumber: finalResi,
      notificationSent,
    });
  } catch (err: unknown) {
    console.error('[UPDATE-ORDER-STATUS] Server error:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan internal server.' },
      { status: 500 }
    );
  }
}
