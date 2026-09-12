import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requestFonnteDeviceQR } from '@/lib/whatsapp-gateway';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    const { data: store } = await supabase
      .from('stores')
      .select('id, name, plan, plan_expiry_date, whatsapp_bot_settings')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json({ success: false, message: 'Toko tidak ditemukan.' }, { status: 404 });
    }

    const isPlanPro =
      store.plan === 'PRO_AI' ||
      store.plan === 'PRO_MONTHLY' ||
      store.plan === 'PRO_ANNUAL';
    const isNotExpired =
      !store.plan_expiry_date || new Date(store.plan_expiry_date).getTime() > Date.now();

    if (!isPlanPro || !isNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: 'Fitur Jaga AI WhatsApp hanya tersedia untuk member Pro AI aktif.',
        },
        { status: 403 }
      );
    }

    const currentSettings = store.whatsapp_bot_settings || {};

    // Minta QR Code dari Master Gateway Fonnte
    const qrResult = await requestFonnteDeviceQR({
      storeId: store.id,
      storeName: store.name,
      webhookSecret: currentSettings.webhookSecret,
    });

    if (!qrResult.success) {
      return NextResponse.json(
        { success: false, message: qrResult.error || 'Gagal menghasilkan QR Code.' },
        { status: 500 }
      );
    }

    // Simpan status device dan webhookSecret ke database toko
    await supabase
      .from('stores')
      .update({
        whatsapp_bot_settings: {
          ...currentSettings,
          provider: 'fonnte',
          deviceToken: qrResult.deviceToken,
          deviceId: qrResult.deviceId,
          webhookSecret: qrResult.webhookSecret || currentSettings.webhookSecret,
          status: 'CONNECTING',
          isActive: true,
          updatedAt: new Date().toISOString(),
        },
      })
      .eq('id', store.id);

    return NextResponse.json({
      success: true,
      qrCodeUrl: qrResult.qrCodeUrl,
      qrString: qrResult.qrString,
      status: 'CONNECTING',
    });
  } catch (err: unknown) {
    console.error('[API-DEVICE-QR] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat membuat QR.' },
      { status: 500 }
    );
  }
}
