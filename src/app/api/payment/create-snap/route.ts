import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { quotaPackages } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
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

    // 1. Ambil data toko milik penjual yang sedang login
    const { data: store, error: storeErr } = await supabase
      .from("stores")
      .select("id, name, whatsapp_number")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (storeErr || !store) {
      return NextResponse.json(
        { error: "Toko penjual tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { packageCode, packageType = "QUOTA", couponCode } = body;

    if (!packageCode) {
      return NextResponse.json(
        { error: "Parameter packageCode wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Tentukan detail paket dan harga
    let grossAmount = 0;
    let packageName = "";
    let quotaAmount = 0;
    let planTier: string | null = null;

    if (packageType === "MEMBERSHIP") {
      if (packageCode === "PRO_ANNUAL") {
        grossAmount = 799000;
        packageName = "Paket Pro Member Sultan (1 Tahun)";
        quotaAmount = 500;
        planTier = "PRO_ANNUAL";
      } else {
        grossAmount = 99000;
        packageName = "Paket Pro Member (1 Bulan)";
        quotaAmount = 100;
        planTier = "PRO_MONTHLY";
      }
    } else {
      // Paket Kuota
      const matchedPkg = quotaPackages.find((p) => p.code === packageCode);
      if (!matchedPkg) {
        return NextResponse.json(
          { error: "Paket kuota tidak valid." },
          { status: 400 }
        );
      }
      grossAmount = matchedPkg.price;
      packageName = `Top-Up Kuota ${matchedPkg.quota} Order`;
      quotaAmount = matchedPkg.quota;
    }

    // Terapkan diskon kupon jika valid
    const normalizedCoupon = (couponCode || "").trim().toUpperCase();
    if (normalizedCoupon === "KOZACUAN" || normalizedCoupon === "DISKON25") {
      grossAmount = Math.round(grossAmount * 0.75);
    }

    const orderId = `KZ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Konfigurasi endpoint Midtrans Snap (Sandbox vs Production)
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const snapUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(serverKey + ":").toString("base64");

    const midtransPayload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: store.name || "Seller KoZa",
        email: user.email || "seller@kozabisnis.com",
        phone: store.whatsapp_number || "081234567890",
      },
      item_details: [
        {
          id: packageCode,
          price: grossAmount,
          quantity: 1,
          name: packageName.substring(0, 50),
        },
      ],
      callbacks: {
        finish: `${req.nextUrl.origin}/dashboard/topup`,
        error: `${req.nextUrl.origin}/dashboard/topup`,
        pending: `${req.nextUrl.origin}/dashboard/topup`,
      },
      usage_limit: 1,
    };

    const midtransRes = await fetch(snapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok || !midtransData.token) {
      console.error("Midtrans Snap Error:", midtransData);
      return NextResponse.json(
        {
          error:
            midtransData.error_messages?.join(", ") ||
            "Gagal menghubungi gateway Midtrans.",
        },
        { status: 502 }
      );
    }

    // 4. Catat transaksi dengan status PENDING ke tabel topup_transactions
    const { error: insertErr } = await supabase
      .from("topup_transactions")
      .insert({
        store_id: store.id,
        order_id: orderId,
        amount: grossAmount,
        package_code: packageCode,
        package_name: packageName,
        package_type: packageType,
        quota_amount: quotaAmount,
        plan_tier: planTier,
        snap_token: midtransData.token,
        status: "PENDING",
      });

    if (insertErr) {
      console.error("Failed to insert pending transaction:", insertErr);
    }

    const clientKey =
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
      process.env.MIDTRANS_CLIENT_KEY ||
      "";

    return NextResponse.json({
      success: true,
      token: midtransData.token,
      redirectUrl: midtransData.redirect_url,
      orderId,
      clientKey,
      isProduction,
    });
  } catch (err: any) {
    console.error("Error create-snap route:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}
