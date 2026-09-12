import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';
import {
  sendWhatsAppMessage,
  normalizeIndonesianPhone,
} from '@/lib/whatsapp-gateway';
import {
  evaluateIncomingMessage,
  recordLLMFailure,
  recordLLMSuccess,
} from '@/lib/ai-cost-guard';
import { BotChatStatus } from '@/types';
import { generateJagaAIReply } from '@/lib/jaga-ai-llm';

export const dynamic = 'force-dynamic';

interface InboundWebhookBody {
  sender?: string;
  phone?: string;
  from?: string;
  message?: string;
  text?: string;
  device?: string;
  name?: string;
  isGroup?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const queryStoreId = searchParams.get('storeId') || searchParams.get('store_id');
    const querySecret = searchParams.get('secret') || req.headers.get('x-webhook-secret') || '';

    let body: InboundWebhookBody = {};
    try {
      body = await req.json();
    } catch {
      // Form-encoded or empty body
      const formData = await req.formData().catch(() => null);
      if (formData) {
        body = {
          sender: formData.get('sender')?.toString(),
          phone: formData.get('phone')?.toString(),
          message: formData.get('message')?.toString(),
          device: formData.get('device')?.toString(),
        };
      }
    }

    const rawSender = body.sender || body.phone || body.from || '';
    const rawMessage = (body.message || body.text || '').trim();
    const deviceIdentifier = body.device || '';
    const isGroup = Boolean(body.isGroup || rawSender.includes('@g.us'));

    // Abaikan jika pesan kosong atau berasal dari grup
    if (!rawMessage || isGroup) {
      return NextResponse.json({ success: true, ignored: true, reason: 'Empty message or group chat' });
    }

    const senderPhone = normalizeIndonesianPhone(rawSender);
    if (!senderPhone) {
      return NextResponse.json({ success: true, ignored: true, reason: 'Invalid phone number' });
    }

    // Inisialisasi Supabase service role client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[WHATSAPP-WEBHOOK] Server misconfigured: SUPABASE_SERVICE_ROLE_KEY missing.');
      return NextResponse.json({ success: false, message: 'Server misconfigured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Cari toko berdasarkan queryStoreId atau device token/id di whatsapp_bot_settings
    let storeQuery = supabase
      .from('stores')
      .select('id, name, slug, origin_city, origin_district, plan, plan_expiry_date, quota_balance, ai_credits_balance, whatsapp_bot_settings');

    if (queryStoreId) {
      storeQuery = storeQuery.eq('id', queryStoreId);
    } else if (deviceIdentifier) {
      storeQuery = storeQuery.or(
        `whatsapp_bot_settings->>deviceToken.eq.${deviceIdentifier},whatsapp_bot_settings->>deviceId.eq.${deviceIdentifier}`
      );
    } else {
      return NextResponse.json({ success: false, message: 'Store identifier missing' }, { status: 400 });
    }

    const { data: store } = await storeQuery.maybeSingle();

    if (!store) {
      return NextResponse.json({ success: false, message: 'Store not found' }, { status: 404 });
    }

    const botSettings = store.whatsapp_bot_settings || {};

    // Verifikasi Keamanan: Webhook Secret Token (Anti-Spoofing & Denial-of-Wallet)
    const expectedSecret = botSettings.webhookSecret;
    if (!expectedSecret || !querySecret) {
      console.warn(`[WHATSAPP-WEBHOOK] Request ditolak untuk toko ${store.id}: Webhook secret tidak ditemukan atau tidak disertakan.`);
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Missing webhook secret token.' },
        { status: 401 }
      );
    }

    const expectedBuf = Buffer.from(expectedSecret);
    const queryBuf = Buffer.from(querySecret);
    const isValidSecret =
      expectedBuf.length === queryBuf.length && timingSafeEqual(expectedBuf, queryBuf);

    if (!isValidSecret) {
      console.warn(`[WHATSAPP-WEBHOOK] Request ditolak untuk toko ${store.id}: Secret token tidak valid.`);
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid webhook secret token.' },
        { status: 401 }
      );
    }

    // Periksa status keaktifan bot di toko
    if (!botSettings.isActive || botSettings.status === 'DISCONNECTED') {
      return NextResponse.json({ success: true, ignored: true, reason: 'Bot inactive or disconnected' });
    }

    // Verifikasi membership PRO toko
    const isPlanPro =
      store.plan === 'PRO_AI' ||
      store.plan === 'PRO_MONTHLY' ||
      store.plan === 'PRO_ANNUAL';
    const isNotExpired =
      !store.plan_expiry_date || new Date(store.plan_expiry_date).getTime() > Date.now();

    if (!isPlanPro || !isNotExpired) {
      return NextResponse.json({ success: true, ignored: true, reason: 'Non-PRO or expired plan' });
    }

    // Cek sesi chat aktif dari tabel chat_sessions
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('bot_status, paused_until, turn_count')
      .eq('store_id', store.id)
      .eq('buyer_phone', senderPhone)
      .maybeSingle();

    // 1. Evaluasi Cost Guard & Human Handoff Engine
    const evaluation = evaluateIncomingMessage({
      storeId: store.id,
      senderPhone,
      messageText: rawMessage,
      isFromMe: false,
      isGroup: false,
      isProStore: true,
      currentBotStatus: (existingSession?.bot_status as BotChatStatus) || 'ACTIVE',
      pausedUntil: existingSession?.paused_until || null,
      currentTurnCount: existingSession?.turn_count || 0,
    });

    const nowMs = Date.now();
    let updatedPausedUntil: string | null = null;

    if (evaluation.botStatus === 'PAUSED') {
      updatedPausedUntil = new Date(nowMs + 2 * 60 * 60 * 1000).toISOString();
    } else if (evaluation.botStatus === 'ESCALATED_TO_HUMAN') {
      updatedPausedUntil = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
    }

    // Jika pesan ditolak oleh pengaman biaya (misal: spam, paused, atau eskalasi komplain)
    if (!evaluation.shouldProcessLLM) {
      await supabase.from('chat_sessions').upsert(
        {
          store_id: store.id,
          buyer_phone: senderPhone,
          bot_status: evaluation.botStatus,
          paused_until: updatedPausedUntil,
          last_buyer_message: evaluation.sanitizedMessage || rawMessage,
          last_bot_reply: evaluation.immediateReply || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'store_id,buyer_phone' }
      );

      // Kirim immediate reply jika ada (misal notifikasi eskalasi)
      if (evaluation.immediateReply && botSettings.deviceToken) {
        await sendWhatsAppMessage({
          provider: botSettings.provider || 'fonnte',
          token: botSettings.deviceToken,
          targetPhone: senderPhone,
          message: evaluation.immediateReply,
          serverUrl: botSettings.serverUrl,
        });
      }

      return NextResponse.json({
        success: true,
        processedByLLM: false,
        botStatus: evaluation.botStatus,
      });
    }

    // 2. Ambil Katalog Produk Toko (Knowledge Context RAG)
    const { data: products } = await supabase
      .from('products')
      .select('name, selling_price, stock')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .limit(15);

    const catalogLines = (products || []).map(
      (p, i) => `${i + 1}. ${p.name} — Rp ${Number(p.selling_price).toLocaleString('id-ID')} (Stok: ${p.stock > 0 ? 'Tersedia' : 'Habis'})`
    );

    const catalogContext =
      catalogLines.length > 0
        ? catalogLines.join('\n')
        : 'Belum ada produk spesifik yang terdaftar di etalase saat ini.';

    // 3. Panggil Dual-Engine LLM (OpenAI gpt-4o-mini / Gemini 1.5 Flash)
    const aiResult = await generateJagaAIReply({
      storeId: store.id,
      storeName: store.name,
      storeSlug: store.slug,
      storeDistrict: store.origin_district,
      storeCity: store.origin_city,
      catalogContext,
      userMessage: evaluation.sanitizedMessage,
      preferredProvider: botSettings.aiModelProvider || 'auto',
    });

    const botReply = aiResult.reply;

    // 4. Kirim Balasan ke WhatsApp Pembeli via Gateway
    if (botReply && botSettings.deviceToken) {
      await sendWhatsAppMessage({
        provider: botSettings.provider || 'fonnte',
        token: botSettings.deviceToken,
        targetPhone: senderPhone,
        message: botReply,
        serverUrl: botSettings.serverUrl,
      });
    }

    // 5. Catat riwayat sesi di Supabase
    const nextTurnCount = (existingSession?.turn_count || 0) + 1;
    await supabase.from('chat_sessions').upsert(
      {
        store_id: store.id,
        buyer_phone: senderPhone,
        bot_status: 'ACTIVE',
        paused_until: null,
        turn_count: nextTurnCount,
        last_buyer_message: evaluation.sanitizedMessage,
        last_bot_reply: botReply,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'store_id,buyer_phone' }
    );

    return NextResponse.json({
      success: true,
      processedByLLM: aiResult.success,
      providerUsed: aiResult.providerUsed,
      botReply,
      turnCount: nextTurnCount,
    });
  } catch (error: unknown) {
    console.error('[WHATSAPP-WEBHOOK] Internal Server Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
