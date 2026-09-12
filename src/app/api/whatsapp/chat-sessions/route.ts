import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BotChatStatus } from '@/types';
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

    // Ambil riwayat percakapan terbaru
    const { data: sessions, error: sessionErr } = await supabase
      .from('chat_sessions')
      .select('id, store_id, buyer_phone, bot_status, paused_until, turn_count, last_buyer_message, last_bot_reply, updated_at')
      .eq('store_id', store.id)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (sessionErr) {
      console.warn('[API-CHAT-SESSIONS] chat_sessions table pending or query error, returning empty state:', sessionErr.message);
      return NextResponse.json({
        success: true,
        sessions: [],
        quotaUsage: { usedToday: 0, dailyLimit: 150, percentage: 0 },
        botSettings: store.whatsapp_bot_settings || {},
      });
    }

    // Hitung estimasi chat terpakai hari ini (UTC start of day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let chatsToday = 0;
    (sessions || []).forEach((s) => {
      if (s.updated_at && new Date(s.updated_at).getTime() >= todayStart.getTime()) {
        chatsToday += Math.max(1, s.turn_count || 1);
      }
    });

    const dailyLimit = 150;

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
      quotaUsage: {
        usedToday: Math.min(dailyLimit, chatsToday),
        dailyLimit,
        percentage: Math.min(100, Math.round((chatsToday / dailyLimit) * 100)),
      },
      botSettings: store.whatsapp_bot_settings || {},
    });
  } catch (err: unknown) {
    return serverError("API-WHATSAPP-CHAT-SESSIONS", err, {
      userMessage: "Terjadi kesalahan server.",
      fieldName: "message",
    });
  }
}

export async function PATCH(req: NextRequest) {
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
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json({ success: false, message: 'Toko tidak ditemukan.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { buyerPhone, botStatus } = body as { buyerPhone?: string; botStatus?: BotChatStatus };

    if (!buyerPhone || !botStatus) {
      return NextResponse.json({ success: false, message: 'buyerPhone dan botStatus wajib diisi.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      bot_status: botStatus,
      updated_at: new Date().toISOString(),
    };

    if (botStatus === 'ACTIVE') {
      updatePayload.paused_until = null;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('chat_sessions')
      .update(updatePayload)
      .eq('store_id', store.id)
      .eq('buyer_phone', buyerPhone)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error('[API-CHAT-SESSIONS] Error updating status:', updateErr);
      return NextResponse.json({ success: false, message: 'Gagal memperbarui status sesi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Status sesi berhasil diubah menjadi ${botStatus}.`,
      session: updated,
    });
  } catch (err: unknown) {
    return serverError("API-WHATSAPP-CHAT-SESSIONS", err, {
      userMessage: "Terjadi kesalahan server.",
      fieldName: "message",
    });
  }
}
