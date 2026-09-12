import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-error";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5; // maksimal 5 submit review per menit per IP

// ==============================================================================
// KOZA BISNIS — CUSTOMER REVIEW & RATING API ROUTE (PHASE 2)
// Memproses ulasan kepuasan dan rating bintang pembeli dari halaman /lacak/[orderNumber]
// ==============================================================================

export const dynamic = "force-dynamic";

interface ReviewPayload {
  orderNumber?: string;
  rating?: number;
  review?: string;
  tags?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    if (isRateLimited(`tracking-review:${clientIp}`, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak permintaan. Silakan coba lagi sebentar lagi." },
        { status: 429 }
      );
    }

    const body = (await req.json()) as ReviewPayload;
    const { orderNumber, rating, review = "", tags = [] } = body;

    if (!orderNumber || typeof orderNumber !== "string") {
      return NextResponse.json(
        { success: false, message: "Nomor pesanan wajib disertakan." },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating harus berupa angka 1 sampai 5 bintang." },
        { status: 400 }
      );
    }

    const sanitizedReview = (review || "").trim().slice(0, 500);
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim().slice(0, 50)).slice(0, 10)
      : [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi server database belum tersedia." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Cari pesanan berdasarkan order_number
    const { data: order, error: findError } = await supabase
      .from("orders")
      .select("id, order_number, status, last_tracking_status, customer_rating")
      .eq("order_number", orderNumber.trim())
      .maybeSingle();

    if (findError || !order) {
      return NextResponse.json(
        { success: false, message: "Pesanan dengan nomor tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    if (order.status !== "SELESAI") {
      return NextResponse.json(
        { success: false, message: "Ulasan hanya bisa diberikan setelah pesanan berstatus Selesai." },
        { status: 400 }
      );
    }

    if (order.customer_rating !== null && order.customer_rating !== undefined) {
      return NextResponse.json(
        { success: false, message: "Pesanan ini sudah pernah diberi ulasan sebelumnya." },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        customer_rating: numRating,
        customer_review: sanitizedReview || null,
        customer_review_tags: sanitizedTags,
        review_submitted_at: now,
        updated_at: now,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("[TRACKING-REVIEW] Gagal menyimpan review:", updateError);
      return NextResponse.json(
        { success: false, message: "Gagal menyimpan ulasan ke database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ulasan dan rating kepuasan Anda berhasil disimpan. Terima kasih banyak!",
      data: {
        orderNumber: order.order_number,
        rating: numRating,
        review: sanitizedReview,
        tags: sanitizedTags,
        submittedAt: now,
      },
    });
  } catch (error: unknown) {
    return serverError("API-TRACKING-REVIEW", error, {
      userMessage: "Gagal menyimpan ulasan. Silakan coba lagi.",
      fieldName: "message",
    });
  }
}
