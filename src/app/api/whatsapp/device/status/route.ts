import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkFonnteDeviceStatus } from '@/lib/whatsapp-gateway';
import { serverError } from '@/lib/api-error';

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
      .select('id, whatsapp_bot_settings')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json({ success: false, message: 'Toko tidak ditemukan.' }, { status: 404 });
    }

    const settings = store.whatsapp_bot_settings || {};
    const deviceToken = settings.deviceToken;

    if (!deviceToken) {
      return NextResponse.json({
        success: true,
        status: 'DISCONNECTED',
        connected: false,
      });
    }

    // Periksa status langsung ke gateway
    const statusResult = await checkFonnteDeviceStatus(deviceToken);

    if (statusResult.connected && settings.status !== 'CONNECTED') {
      // Update database toko jika status berubah menjadi CONNECTED
      await supabase
        .from('stores')
        .update({
          whatsapp_bot_settings: {
            ...settings,
            status: 'CONNECTED',
            connectedNumber: statusResult.connectedNumber,
            connectedAt: new Date().toISOString(),
          },
        })
        .eq('id', store.id);
    }

    return NextResponse.json({
      success: true,
      status: statusResult.connected ? 'CONNECTED' : settings.status || 'CONNECTING',
      connected: statusResult.connected,
      connectedNumber: statusResult.connectedNumber || settings.connectedNumber,
    });
  } catch (err: unknown) {
    return serverError("API-WHATSAPP-DEVICE-STATUS", err, {
      userMessage: "Gagal memeriksa status koneksi.",
      fieldName: "message",
    });
  }
}
