import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { generatedLandingPageSchema } from "@/lib/ai-landing-page-schema";
import { isCircuitBreakerOpen, recordLLMFailure, recordLLMSuccess } from "@/lib/ai-cost-guard";
import { isSlidingWindowLimited, isUsageQuotaExceeded, recordUsage, MONTHLY_QUOTA_PRO, ANNUAL_QUOTA_PRO } from "@/lib/ai-landing-page-limiter";
import { serverError } from "@/lib/api-error";

const OPENAI_MODEL = "gpt-4o-mini";

const requestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(3).max(2000),
  sellingPrice: z.number().positive(),
  normalPrice: z.number().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  ctaText: z.string().max(60).optional(),
  otherInfo: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login terlebih dahulu.", code: "INVALID_INPUT" },
        { status: 401 }
      );
    }

    const { data: store } = await supabase
      .from("stores")
      .select("id, plan")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Toko penjual tidak ditemukan.", code: "INVALID_INPUT" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsedInput = requestSchema.safeParse(body);
    if (!parsedInput.success) {
      return NextResponse.json(
        { success: false, error: "Data input tidak lengkap atau tidak valid.", code: "INVALID_INPUT" },
        { status: 400 }
      );
    }
    const input = parsedInput.data;

    if (isCircuitBreakerOpen()) {
      return NextResponse.json(
        { success: false, error: "Layanan AI sedang sibuk, silakan coba lagi dalam beberapa menit.", code: "CIRCUIT_OPEN" },
        { status: 503 }
      );
    }

    if (isSlidingWindowLimited(store.id)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan dalam waktu singkat. Coba lagi sebentar lagi.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    // Fitur AI Landing Page eksklusif member Pro AI (bulanan/tahunan) — Basic & Free/Trial tidak dapat akses sama sekali.
    const isProAnnual = store.plan === "PRO_ANNUAL";
    const isProMonthly = store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY";
    if (!isProAnnual && !isProMonthly) {
      return NextResponse.json(
        { success: false, error: "Fitur AI Landing Page khusus untuk member Pro AI. Silakan upgrade paket Anda terlebih dahulu.", code: "INVALID_INPUT" },
        { status: 403 }
      );
    }

    const planTier = isProAnnual ? "ANNUAL" : "MONTHLY";
    if (isUsageQuotaExceeded(store.id, planTier)) {
      const quota = isProAnnual ? ANNUAL_QUOTA_PRO : MONTHLY_QUOTA_PRO;
      const periodLabel = isProAnnual ? "tahun ini" : "bulan ini";
      return NextResponse.json(
        { success: false, error: `Kuota ${quota}x generate AI Landing Page Anda untuk ${periodLabel} sudah habis.`, code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY belum dikonfigurasi di environment server.");
      return NextResponse.json(
        { success: false, error: "Konfigurasi layanan AI belum lengkap. Hubungi admin.", code: "OPENAI_ERROR" },
        { status: 500 }
      );
    }

    const normalPrice = input.normalPrice && input.normalPrice > input.sellingPrice ? input.normalPrice : Math.round((input.sellingPrice * 1.4) / 1000) * 1000;
    const discountPercent = Math.round(((normalPrice - input.sellingPrice) / normalPrice) * 100);

    const client = new OpenAI({ apiKey });

    const systemPrompt = `Kamu adalah asisten yang membuat landing page jualan (sales page) untuk seller UMKM Indonesia.
Tulis SELURUH konten dalam Bahasa Indonesia yang persuasif, natural, dan tidak berlebihan.

ATURAN WAJIB:
- Blok PERTAMA harus HERO_BANNER, blok TERAKHIR harus CHECKOUT_FORM.
- Untuk CHECKOUT_FORM: gunakan PERSIS normalPrice=${normalPrice}, promoPrice=${input.sellingPrice}, discountPercent=${discountPercent} — JANGAN mengarang angka lain.
- Untuk TESTIMONIALS: setiap item WAJIB verified=false (ini contoh ulasan, bukan ulasan asli/terverifikasi). Jangan gunakan kata "Terverifikasi" di field role — role hanya nama kota.
- Untuk FEATURES_GRID: field icon HARUS satu karakter emoji (contoh: 🚀), BUKAN nama ikon.
- JANGAN mengarang klaim jumlah pelanggan/stok yang spesifik dan tidak bisa diverifikasi (contoh: "2.400+ pelanggan", "sisa 14 pcs") — gunakan bahasa persuasif umum.
- design.themePreset dan warna pilih yang serasi dan enak dilihat untuk produk ini.
- seo.noIndex harus true.
- Field id boleh string kosong/placeholder, ID asli akan dibuat ulang oleh server.`;

    const userPrompt = `Judul Produk: ${input.title}
Deskripsi Produk: ${input.description}
Harga Jual: Rp ${input.sellingPrice.toLocaleString("id-ID")}
Harga Coret: Rp ${normalPrice.toLocaleString("id-ID")}
CTA yang diinginkan: ${input.ctaText || "(biarkan AI memilih yang paling sesuai)"}
Info tambahan dari seller: ${input.otherInfo || "(tidak ada)"}`;

    let completion;
    try {
      completion = await client.chat.completions.parse({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: zodResponseFormat(generatedLandingPageSchema, "landing_page"),
        max_tokens: 4000,
      });
    } catch (err) {
      console.error("OpenAI API error:", err);
      recordLLMFailure();
      return NextResponse.json(
        { success: false, error: "Gagal terhubung ke layanan AI. Silakan coba lagi.", code: "OPENAI_ERROR" },
        { status: 502 }
      );
    }

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      recordLLMFailure();
      return NextResponse.json(
        { success: false, error: "AI gagal menyusun halaman yang valid. Silakan coba lagi atau ubah deskripsi produk.", code: "PARSE_ERROR" },
        { status: 502 }
      );
    }

    // Jangan pernah percaya ID dari model — buat ulang supaya unik & konsisten dengan konvensi builder.
    const heroImageUrl = input.imageUrl || "";
    const blocksWithFreshIds = parsed.blocks.map((block) => {
      const newBlock = {
        ...block,
        id: "blk-" + crypto.randomUUID(),
      };
      if (newBlock.type === "HERO_BANNER" && heroImageUrl) {
        newBlock.settings = { ...newBlock.settings, heroImageUrl };
      }
      return newBlock;
    });

    recordLLMSuccess(store.id);
    recordUsage(store.id, planTier);

    return NextResponse.json({
      success: true,
      data: {
        title: parsed.title,
        design: parsed.design,
        seo: parsed.seo,
        blocks: blocksWithFreshIds,
      },
    });
  } catch (err: unknown) {
    return serverError("API-LANDING-PAGE-GENERATE", err, {
      userMessage: "Terjadi kesalahan pada server saat membuat halaman. Silakan coba lagi.",
    });
  }
}
