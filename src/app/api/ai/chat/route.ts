import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import {
  evaluateIncomingMessage,
  recordLLMFailure,
  recordLLMSuccess,
  isCircuitBreakerOpen,
} from "@/lib/ai-cost-guard";
import { BotChatStatus } from "@/types";
import { generateJagaAIReply } from "@/lib/jaga-ai-llm";

// ==============================================================================
// KOZA BISNIS — AI CHAT & HUMAN HANDOFF API ROUTE
// Endpoint utama yang dipanggil oleh WhatsApp Gateway (Baileys) saat ada pesan masuk.
// Dilengkapi 5 titik pengamanan biaya (Cost Guard) dan Human Takeover.
// ==============================================================================

interface RequestPayload {
  storeId?: string;
  senderPhone?: string;
  messageText?: string;
  isFromMe?: boolean;
  isGroup?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Verifikasi shared-secret dari WhatsApp Gateway resmi sebelum memproses apa pun.
    // Tanpa ini, siapa pun bisa memicu pemanggilan Gemini API berbayar (denial-of-wallet)
    // dan menyuntikkan riwayat chat palsu ke chat_sessions toko manapun.
    const gatewaySecret = process.env.WHATSAPP_GATEWAY_SECRET;
    if (!gatewaySecret) {
      console.error("WHATSAPP_GATEWAY_SECRET belum dikonfigurasi di environment server.");
      return NextResponse.json(
        { success: false, message: "Server misconfigured: WHATSAPP_GATEWAY_SECRET missing." },
        { status: 500 }
      );
    }

    const receivedSecret = req.headers.get("x-gateway-secret") || "";
    const expectedBuf = Buffer.from(gatewaySecret);
    const receivedBuf = Buffer.from(receivedSecret);
    const isValidSecret =
      expectedBuf.length === receivedBuf.length && timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValidSecret) {
      console.warn("AI chat request ditolak: shared-secret gateway tidak valid.");
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestPayload;
    const {
      storeId,
      senderPhone,
      messageText,
      isFromMe = false,
      isGroup = false,
    } = body;

    // Validasi input awal
    if (!storeId || !senderPhone || typeof messageText !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "storeId, senderPhone, dan messageText wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Inisialisasi Supabase client (service role untuk bypass RLS bot chat)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    let existingSession: {
      bot_status: BotChatStatus;
      paused_until: string | null;
      turn_count: number;
    } | null = null;

    let isProStore = true; // Default true jika dev mode / db bypass
    let supabase = null;
    let storeData: {
      id: string;
      name: string;
      slug: string;
      origin_district?: string;
      origin_city?: string;
      plan?: string;
      plan_expiry_date?: string;
      whatsapp_bot_settings?: any;
    } | null = null;

    if (supabaseUrl && serviceRoleKey) {
      supabase = createClient(supabaseUrl, serviceRoleKey);

      // Verifikasi status keanggotaan PRO toko
      const { data: fetchedStore } = await supabase
        .from("stores")
        .select("id, name, slug, origin_district, origin_city, plan, plan_expiry_date, whatsapp_bot_settings")
        .eq("id", storeId)
        .maybeSingle();

      storeData = fetchedStore;

      if (storeData) {
        const isPlanPro =
          storeData.plan === "PRO_AI" ||
          storeData.plan === "PRO_MONTHLY" ||
          storeData.plan === "PRO_ANNUAL";
        const isNotExpired =
          !storeData.plan_expiry_date ||
          new Date(storeData.plan_expiry_date).getTime() > Date.now();
        isProStore = Boolean(isPlanPro && isNotExpired);
      }

      if (!isProStore) {
        return NextResponse.json(
          {
            success: false,
            processedByLLM: false,
            botStatus: "PAUSED",
            rejectionReason: "PRO_FEATURE_ONLY",
            message:
              "Fitur Asisten AI WhatsApp & Human Takeover hanya tersedia untuk toko dengan paket PRO Member (PRO Monthly / PRO Annual). Silakan upgrade paket Anda di Dashboard Topup.",
          },
          { status: 403 }
        );
      }

      const { data: sessionData } = await supabase
        .from("chat_sessions")
        .select("bot_status, paused_until, turn_count")
        .eq("store_id", storeId)
        .eq("buyer_phone", senderPhone)
        .maybeSingle();

      if (sessionData) {
        existingSession = sessionData as {
          bot_status: BotChatStatus;
          paused_until: string | null;
          turn_count: number;
        };
      }
    }

    // 1. Evaluasi Cost Guard & Human Handoff (Anti-Echo, Rate Limit, Token Bombing, Handoff)
    const evaluation = evaluateIncomingMessage({
      storeId,
      senderPhone,
      messageText,
      isFromMe,
      isGroup,
      isProStore,
      currentBotStatus: existingSession?.bot_status || "ACTIVE",
      pausedUntil: existingSession?.paused_until || null,
      currentTurnCount: existingSession?.turn_count || 0,
    });

    // Hitung waktu jeda (paused_until) jika status berubah
    let updatedPausedUntil: string | null = null;
    const nowMs = Date.now();

    if (evaluation.botStatus === "PAUSED") {
      if (evaluation.rejectionReason === "MAGIC_COMMAND") {
        // !pause / !stop -> jeda 2 jam
        updatedPausedUntil = new Date(nowMs + 2 * 60 * 60 * 1000).toISOString();
      } else {
        // Ambil alih alami (seller ketik dari HP) -> jeda 60 menit
        updatedPausedUntil = new Date(nowMs + 60 * 60 * 1000).toISOString();
      }
    } else if (evaluation.botStatus === "ESCALATED_TO_HUMAN") {
      // Eskalasi otomatis karena komplain / batas putaran chat -> jeda 24 jam sampai seller balas
      updatedPausedUntil = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
    } else if (evaluation.botStatus === "ACTIVE") {
      updatedPausedUntil = null;
    }

    // 2. Jika pengaman menolak pengiriman ke LLM (Rp 0 API Cost)
    if (!evaluation.shouldProcessLLM) {
      // Catat/perbarui sesi di Supabase jika klien tersedia
      if (supabase) {
        await supabase.from("chat_sessions").upsert(
          {
            store_id: storeId,
            buyer_phone: senderPhone,
            bot_status: evaluation.botStatus,
            paused_until: updatedPausedUntil,
            last_buyer_message: evaluation.sanitizedMessage || messageText,
            last_bot_reply: evaluation.immediateReply || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "store_id,buyer_phone" }
        );
      }

      return NextResponse.json({
        success: true,
        processedByLLM: false,
        botStatus: evaluation.botStatus,
        rejectionReason: evaluation.rejectionReason,
        reply: evaluation.immediateReply || null,
        shouldEscalateToHuman: Boolean(evaluation.shouldEscalateToHuman),
      });
    }

    // 3. Pesan Lolos Pengaman: Ambil Katalog & Panggil Dual-Engine LLM
    let catalogContext = "Belum ada produk spesifik yang terdaftar di etalase saat ini.";
    if (supabase) {
      const { data: products } = await supabase
        .from("products")
        .select("name, selling_price, stock")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .limit(15);

      if (products && products.length > 0) {
        catalogContext = products
          .map(
            (p, i) =>
              `${i + 1}. ${p.name} — Rp ${Number(p.selling_price).toLocaleString("id-ID")} (Stok: ${p.stock > 0 ? "Tersedia" : "Habis"})`
          )
          .join("\n");
      }
    }

    const botSettings = storeData?.whatsapp_bot_settings || {};
    const aiResult = await generateJagaAIReply({
      storeId,
      storeName: storeData?.name || "Toko KoZa",
      storeSlug: storeData?.slug || storeId,
      storeDistrict: storeData?.origin_district,
      storeCity: storeData?.origin_city,
      catalogContext,
      userMessage: evaluation.sanitizedMessage,
      preferredProvider: botSettings.aiModelProvider || "auto",
    });

    const botReply = aiResult.reply;

    // 4. Perbarui status sesi obrolan (naikkan turn_count)
    const nextTurnCount = (existingSession?.turn_count || 0) + 1;

    if (supabase) {
      await supabase.from("chat_sessions").upsert(
        {
          store_id: storeId,
          buyer_phone: senderPhone,
          bot_status: "ACTIVE",
          paused_until: null,
          turn_count: nextTurnCount,
          last_buyer_message: evaluation.sanitizedMessage,
          last_bot_reply: botReply,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "store_id,buyer_phone" }
      );
    }

    return NextResponse.json({
      success: true,
      processedByLLM: aiResult.success,
      providerUsed: aiResult.providerUsed,
      botStatus: "ACTIVE",
      reply: botReply,
      turnCount: nextTurnCount,
    });
  } catch (error: unknown) {
    console.error("[AI-CHAT-ROUTE] Internal Server Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server saat memproses chat.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "KoZa Bisnis AI Cost Guard & Human Handoff Engine",
    circuitBreakerOpen: isCircuitBreakerOpen(),
    maxInputChars: 500,
    maxRequestsPerMinute: 5,
    dailyStoreQuota: 150,
  });
}
