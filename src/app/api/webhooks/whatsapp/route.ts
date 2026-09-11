import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

    // 3. Panggil Gemini LLM
    let botReply = '';
    const geminiKey = process.env.GEMINI_API_KEY || '';

    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const prompt = `Kamu adalah Jaga AI, asisten customer service WhatsApp toko online "${store.name}".
Tugasmu menjawab pesan calon pembeli dengan ramah, santun, dan sigap membantu.

Informasi Toko:
- Nama Toko: ${store.name}
- Lokasi: ${store.origin_district}, ${store.origin_city}
- Link Etalase Toko: https://www.kozabisnis.com/toko/${store.slug}

Daftar Produk Toko:
${catalogContext}

Aturan Menjawab:
1. Gunakan Bahasa Indonesia yang sopan dan akrab (panggil "kak").
2. Jawab secara ringkas, jelas, dan santun (maksimal 2-3 kalimat).
3. Jika pembeli menanyakan produk yang ada di katalog, informasikan harga dan ketersediaan stoknya, lalu persilakan checkout di link toko: https://www.kozabisnis.com/toko/${store.slug}
4. Jika produk yang ditanyakan tidak ada di katalog, sampaikan dengan sopan bahwa produk belum tersedia.
5. Jangan gunakan format markdown tebal (bold) berlebihan.

Pesan dari pembeli:
"${evaluation.sanitizedMessage}"`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          recordLLMSuccess(store.id);
        } else {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }
      } catch (llmErr) {
        console.error('[WHATSAPP-WEBHOOK] Gemini LLM Error:', llmErr);
        recordLLMFailure();
        botReply = `Halo kak! Pesan kakak sudah kami terima. Mohon ditunggu sebentar ya kak, admin ${store.name} akan segera membalas 🙏`;
      }
    } else {
      // Fallback Pintar jika API Key Gemini belum di-set
      botReply = `Halo kak! Terima kasih sudah menghubungi ${store.name}. Produk kami bisa dilihat dan dipesan langsung melalui etalase resmi kami di: https://www.kozabisnis.com/toko/${store.slug} 😊`;
      recordLLMSuccess(store.id);
    }

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
      processedByLLM: true,
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
