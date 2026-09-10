import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

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

    const body = await req.json();
    const { orderId, transactionId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Cek transaksi milik penjual
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!store) {
      return NextResponse.json(
        { error: "Toko tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: tx, error: txErr } = await supabase
      .from("topup_transactions")
      .select("*")
      .eq("order_id", orderId)
      .eq("store_id", store.id)
      .maybeSingle();

    if (txErr || !tx) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika sudah settled di database
    if (tx.status === "SETTLED") {
      return NextResponse.json({
        settled: true,
        status: "SETTLED",
      });
    }

    // 2. Query status ke Midtrans API
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const statusApiBase = isProduction
      ? "https://api.midtrans.com/v2"
      : "https://api.sandbox.midtrans.com/v2";

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY tidak tersedia." },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(serverKey + ":").toString("base64");

    // 1. Coba cek dengan orderId (standar Midtrans Core API)
    let midtransData: any = null;

    try {
      const coreRes = await fetch(`${statusApiBase}/${orderId}/status`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        cache: "no-store",
      });

      if (coreRes.ok) {
        const parsed = await coreRes.json();
        // Midtrans Core API mengembalikan status_code "404" jika order_id tidak terdaftar di v2 (misal kanal DANA)
        if (parsed && parsed.status_code !== "404" && parsed.transaction_status) {
          midtransData = parsed;
        }
      }
    } catch (err) {
      console.warn("Core API status check error:", err);
    }

    // 2. Jika Core API tidak menemukan transaksi, periksa via Snap Token resmi
    if (!midtransData?.transaction_status && tx.snap_token) {
      try {
        const snapStatusUrl = isProduction
          ? `https://app.midtrans.com/snap/v1/transactions/${tx.snap_token}/status`
          : `https://app.sandbox.midtrans.com/snap/v1/transactions/${tx.snap_token}/status`;

        const snapRes = await fetch(snapStatusUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          cache: "no-store",
        });

        if (snapRes.ok) {
          const snapData = await snapRes.json();
          if (snapData && snapData.transaction_status) {
            midtransData = snapData;
          }
        }
      } catch (err) {
        console.warn("Snap token status check error:", err);
      }
    }

    // 3. Jika masih belum ditemukan dan client meneruskan transactionId
    if (!midtransData?.transaction_status && transactionId) {
      try {
        const txRes = await fetch(`${statusApiBase}/${transactionId}/status`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          cache: "no-store",
        });

        if (txRes.ok) {
          const parsedTx = await txRes.json();
          if (parsedTx && parsedTx.status_code !== "404" && parsedTx.transaction_status) {
            midtransData = parsedTx;
          }
        }
      } catch (err) {
        console.warn("Transaction ID status check error:", err);
      }
    }

    let isSuccess = false;
    let paymentType = "midtrans";

    if (midtransData?.transaction_status) {
      const transactionStatus = midtransData.transaction_status;
      const fraudStatus = midtransData.fraud_status;
      paymentType = midtransData.payment_type || paymentType;

      isSuccess =
        transactionStatus === "settlement" ||
        (transactionStatus === "capture" && fraudStatus === "accept");

      if (
        transactionStatus === "cancel" ||
        transactionStatus === "expire" ||
        transactionStatus === "deny"
      ) {
        const failStatus = transactionStatus === "expire" ? "EXPIRED" : "FAILED";
        const supabaseAdmin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
        );
        await supabaseAdmin.rpc("handle_midtrans_failure", {
          p_order_id: orderId,
          p_status: failStatus,
        });

        return NextResponse.json({
          settled: false,
          status: failStatus,
        });
      }
    }

    if (isSuccess) {
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
      );

      const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc(
        "handle_midtrans_settlement",
        {
          p_order_id: orderId,
          p_payment_type: paymentType,
        }
      );

      if (rpcErr) {
        console.error("RPC handle_midtrans_settlement error:", rpcErr);
      }

      return NextResponse.json({
        settled: true,
        status: "SETTLED",
        result: rpcData,
      });
    }

    return NextResponse.json({
      settled: false,
      status: tx.status,
    });
  } catch (err: any) {
    console.error("Error verify-status route:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
