import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { addVercelDomain, removeVercelDomain } from "@/lib/vercel-domains";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5; // maksimal 5 registrasi domain per menit per seller

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(req);
    if (isRateLimited(`domain-register:${user.id}:${clientIp}`, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak permintaan. Silakan coba lagi sebentar lagi." },
        { status: 429 }
      );
    }

    // Custom domain khusus member Pro AI -- toko harus benar-benar berlangganan Pro.
    const { data: store } = await supabase
      .from("stores")
      .select("id, plan")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Toko tidak ditemukan." },
        { status: 404 }
      );
    }

    const isPro = store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL";
    if (!isPro) {
      return NextResponse.json(
        { success: false, error: "Custom domain khusus member Pro AI. Silakan upgrade paket Anda terlebih dahulu." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const rawDomain = String(body.domain || "").trim().toLowerCase();
    const previousDomain = String(body.previousDomain || "").trim().toLowerCase();

    if (!rawDomain || !rawDomain.includes(".") || rawDomain.includes(" ")) {
      return NextResponse.json(
        { success: false, error: "Format nama domain tidak valid." },
        { status: 400 }
      );
    }

    // Domain lama dihapus dulu dari Vercel (best-effort) kalau seller mengganti domain --
    // supaya domain lama tidak menumpuk terus di project Vercel.
    if (previousDomain && previousDomain !== rawDomain) {
      await removeVercelDomain(previousDomain);
    }

    const result = await addVercelDomain(rawDomain);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Gagal mendaftarkan domain ke Vercel. Domain mungkin sudah dipakai project lain.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, verified: result.verified });
  } catch (err: unknown) {
    return serverError("API-DOMAIN-REGISTER", err, {
      userMessage: "Gagal mendaftarkan domain. Silakan coba lagi.",
    });
  }
}
