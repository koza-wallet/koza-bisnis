import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  evaluateIncomingMessage,
  recordLLMFailure,
  recordLLMSuccess,
  isCircuitBreakerOpen,
} from "@/lib/ai-cost-guard";
import { BotChatStatus } from "@/types";

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

    let supabase = null;
    if (supabaseUrl && serviceRoleKey) {
      supabase = createClient(supabaseUrl, serviceRoleKey);
      const { data } = await supabase
        .from("chat_sessions")
        .select("bot_status, paused_until, turn_count")
        .eq("store_id", storeId)
        .eq("buyer_phone", senderPhone)
        .maybeSingle();

      if (data) {
        existingSession = data as {
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

    // 3. Pesan Lolos Pengaman: Panggil LLM (Gemini API)
    let botReply = "";
    const apiKey = process.env.GEMINI_API_KEY || "";

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 detik timeout

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Kamu adalah asisten toko WhatsApp penjual yang ramah, sopan, dan sigap membantu.
Jawab pesan pembeli berikut dalam Bahasa Indonesia dengan santun, informatif, dan ringkas (maksimal 2-3 kalimat).
Jangan gunakan format markdown tebal berlebihan.

Pesan pembeli:
"${evaluation.sanitizedMessage}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 200,
                temperature: 0.7,
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          throw new Error("Respon LLM kosong.");
        }

        botReply = generatedText.trim();
        recordLLMSuccess(storeId);
      } catch (err: unknown) {
        console.error("[AI-CHAT-ROUTE] Gagal memanggil LLM:", err);
        recordLLMFailure();

        // Fallback tanggapan aman (tanpa retry berulang)
        botReply =
          "Halo kak! Pesan kakak sudah diterima, mohon ditunggu sebentar ya kak admin kami akan segera merespons 🙏";
      }
    } else {
      // Mock Fallback cerdas untuk lingkungan pengujian/tanpa API Key
      botReply = `Halo kak! Terima kasih sudah menghubungi kami. Pesan kakak ("${evaluation.sanitizedMessage}") sudah kami terima. Ada yang bisa kami bantu lebih lanjut untuk produk atau pesanan kakak? 😊`;
      recordLLMSuccess(storeId);
    }

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
      processedByLLM: true,
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
