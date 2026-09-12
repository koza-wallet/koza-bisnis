import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { deleteFonnteDevice } from '@/lib/whatsapp-gateway';
import { serverError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function POST() {
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

    if (deviceToken) {
      // Hapus device di gateway agar tidak ditagih
      await deleteFonnteDevice({ deviceToken });
    }

    // Set status menjadi DISCONNECTED di database toko
    await supabase
      .from('stores')
      .update({
        whatsapp_bot_settings: {
          ...settings,
          status: 'DISCONNECTED',
          deviceToken: undefined,
          deviceId: undefined,
          isActive: false,
          disconnectedAt: new Date().toISOString(),
        },
      })
      .eq('id', store.id);

    return NextResponse.json({
      success: true,
      message: 'Koneksi WhatsApp berhasil diputuskan dan slot dinonaktifkan.',
      status: 'DISCONNECTED',
    });
  } catch (err: unknown) {
    return serverError("API-WHATSAPP-DEVICE-DISCONNECT", err, {
      userMessage: "Gagal memutuskan koneksi WhatsApp.",
      fieldName: "message",
    });
  }
}
