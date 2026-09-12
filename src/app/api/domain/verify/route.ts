import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";
import { serverError } from "@/lib/api-error";
import { getVercelDomainStatus } from "@/lib/vercel-domains";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10; // maksimal 10 cek DNS per menit per seller

export async function GET(request: NextRequest) {
  try {
    // Fitur verifikasi domain khusus seller yang login — bukan resource DNS-lookup publik bebas.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const clientIp = getClientIp(request);
    if (isRateLimited(`domain-verify:${user.id}:${clientIp}`, MAX_REQUESTS_PER_WINDOW, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi sebentar lagi." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawDomain = searchParams.get("domain");

    if (!rawDomain) {
      return NextResponse.json(
        { error: "Parameter domain wajib diisi" },
        { status: 400 }
      );
    }

    // Normalisasi domain
    const cleanDomain = rawDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");

    if (!cleanDomain || cleanDomain.includes(" ") || !cleanDomain.includes(".")) {
      return NextResponse.json(
        { error: "Format nama domain tidak valid" },
        { status: 400 }
      );
    }

    // Platform reserved domains
    const reservedDomains = ["localhost", "kozabisnis.com", "vercel.app"];
    if (reservedDomains.some((d) => cleanDomain.endsWith(d))) {
      return NextResponse.json(
        {
          domain: cleanDomain,
          configured: true,
          isPlatformDomain: true,
          message: "Domain sistem resmi KoZa Bisnis",
        }
      );
    }

    const TARGET_CNAME = "cname.kozabisnis.com";
    const VERCEL_CNAME = "cname.vercel-dns.com";
    const VERCEL_A_IP = "76.76.21.21";

    let cnameRecords: string[] = [];
    let aRecords: string[] = [];
    let isConfigured = false;
    let detailMessage = "";

    // 1. Cek CNAME Record
    try {
      const records = await dns.resolveCname(cleanDomain);
      cnameRecords = Array.isArray(records) ? records.map((r) => r.toLowerCase()) : [];
      if (
        cnameRecords.some(
          (c) =>
            c.includes("cname.kozabisnis.com") ||
            c.includes("cname.vercel-dns.com") ||
            c.includes("kozabisnis.com")
        )
      ) {
        isConfigured = true;
        detailMessage = "CNAME domain terhubung sempurna ke server KoZa Bisnis.";
      }
    } catch (cnameErr: any) {
      // CNAME tidak ditemukan atau root domain menggunakan A Record
    }

    // 2. Cek A Record (jika root domain apex seperti namatoko.com)
    if (!isConfigured) {
      try {
        const ips = await dns.resolve4(cleanDomain);
        aRecords = Array.isArray(ips) ? ips : [];
        if (aRecords.includes(VERCEL_A_IP)) {
          isConfigured = true;
          detailMessage = "A Record domain mengarah tepat ke IP Server KoZa (76.76.21.21).";
        }
      } catch (aErr: any) {
        // A record lookup error
      }
    }

    // 3. Cek status pendaftaran & SSL di Vercel Domains API
    const vercelStatus = await getVercelDomainStatus(cleanDomain);
    if (vercelStatus?.verified) {
      isConfigured = true;
      detailMessage = "Domain terverifikasi dan SSL aktif di jaringan edge Vercel.";
    } else if (vercelStatus?.found && !vercelStatus.verified) {
      detailMessage = "Domain sudah terdaftar, menunggu Vercel menyelesaikan verifikasi DNS & penerbitan SSL (biasanya beberapa menit).";
    }

    if (!isConfigured) {
      detailMessage =
        "DNS belum terdeteksi. Pastikan Anda telah membuat CNAME ke 'cname.kozabisnis.com' atau A Record ke '76.76.21.21' di panel domain Anda (propagasi 5–60 menit).";
    }

    return NextResponse.json({
      domain: cleanDomain,
      configured: isConfigured,
      cnameRecords,
      aRecords,
      targetCname: TARGET_CNAME,
      targetA: VERCEL_A_IP,
      message: detailMessage,
      sslReady: Boolean(vercelStatus?.verified),
      registeredWithVercel: Boolean(vercelStatus?.found),
      checkedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    return serverError("API-DOMAIN-VERIFY", err, {
      userMessage: "Gagal memverifikasi konfigurasi DNS. Silakan coba lagi.",
      fieldName: "message",
      extra: { configured: false },
      status: 500,
    });
  }
}
