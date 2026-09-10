import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { orderId } = body;

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

    // 2. Query status langsung ke Midtrans API
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const statusApiUrl = isProduction
      ? `https://api.midtrans.com/v2/${orderId}/status`
      : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY tidak tersedia." },
        { status: 500 }
      );
    }

    const basicAuth = Buffer.from(serverKey + ":").toString("base64");
    const midtransRes = await fetch(statusApiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      cache: "no-store",
    });

    if (!midtransRes.ok) {
      return NextResponse.json({
        settled: false,
        status: tx.status,
      });
    }

    const midtransData = await midtransRes.json();
    const transactionStatus = midtransData.transaction_status;
    const fraudStatus = midtransData.fraud_status;

    const isSuccess =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");

    if (isSuccess) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        "handle_midtrans_settlement",
        {
          p_order_id: orderId,
          p_payment_type: midtransData.payment_type || "midtrans",
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

    if (
      transactionStatus === "cancel" ||
      transactionStatus === "expire" ||
      transactionStatus === "deny"
    ) {
      const failStatus = transactionStatus === "expire" ? "EXPIRED" : "FAILED";
      await supabase.rpc("handle_midtrans_failure", {
        p_order_id: orderId,
        p_status: failStatus,
      });

      return NextResponse.json({
        settled: false,
        status: failStatus,
      });
    }

    return NextResponse.json({
      settled: false,
      status: transactionStatus || tx.status,
    });
  } catch (err: any) {
    console.error("Error verify-status route:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
