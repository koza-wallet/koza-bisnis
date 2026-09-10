import { NextRequest, NextResponse } from "next/server";
import dns from "node:dns/promises";

export async function GET(request: NextRequest) {
  try {
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

    // 3. Opsional: Cek status via Vercel Domains API bila kredensial tersedia
    let vercelStatus: any = null;
    if (process.env.VERCEL_AUTH_TOKEN && process.env.VERCEL_PROJECT_ID) {
      try {
        const vRes = await fetch(
          `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${cleanDomain}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
            },
          }
        );
        if (vRes.ok) {
          vercelStatus = await vRes.json();
          if (vercelStatus.verified) {
            isConfigured = true;
            detailMessage = "Domain terverifikasi dan aktif di jaringan edge KoZa.";
          }
        }
      } catch {
        // Abaikan kegagalan panggilan external API
      }
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
      sslReady: isConfigured,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Gagal memverifikasi konfigurasi DNS",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
