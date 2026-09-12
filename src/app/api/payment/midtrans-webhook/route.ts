import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      payment_type,
      fraud_status,
    } = payload;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return NextResponse.json(
        { error: "Payload webhook tidak lengkap." },
        { status: 400 }
      );
    }

    // 1. Verifikasi Keamanan Kriptografi (SHA512 Signature Key)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY belum dikonfigurasi.");
      return NextResponse.json(
        { error: "Server key missing." },
        { status: 500 }
      );
    }

    const rawString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(rawString)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature);
    const receivedBuf = Buffer.from(String(signature_key));

    const isMatch =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isMatch) {
      console.warn("Invalid Midtrans webhook signature:", {
        order_id,
        received: signature_key,
        expected: expectedSignature,
      });
      return NextResponse.json(
        { error: "Signature tidak valid." },
        { status: 403 }
      );
    }

    // 2. Inisialisasi Supabase Client dengan Service Role Key (Hard-fail jika tidak ada)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di environment server.");
      return NextResponse.json(
        { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY missing." },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      serviceRoleKey
    );

    // 3. Evaluasi Status Pembayaran
    const isSuccess =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isSuccess) {
      // Panggil fungsi atomik & idempoten handle_midtrans_settlement di PostgreSQL
      const { data, error } = await supabase.rpc(
        "handle_midtrans_settlement",
        {
          p_order_id: order_id,
          p_payment_type: payment_type || "midtrans",
        }
      );

      if (error) {
        console.error("RPC handle_midtrans_settlement error:", error);
        return NextResponse.json(
          { error: "Gagal memproses settlement di database." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: "OK",
        message: "Settlement processed successfully.",
        result: data,
      });
    }

    // Kasus pembayaran dibatalkan / kedaluwarsa
    if (
      transaction_status === "cancel" ||
      transaction_status === "expire" ||
      transaction_status === "deny"
    ) {
      const failStatus = transaction_status === "expire" ? "EXPIRED" : "FAILED";
      await supabase.rpc("handle_midtrans_failure", {
        p_order_id: order_id,
        p_status: failStatus,
      });

      return NextResponse.json({
        status: "OK",
        message: `Transaction marked as ${failStatus}.`,
      });
    }

    return NextResponse.json({
      status: "OK",
      message: `Transaction status ${transaction_status} acknowledged.`,
    });
  } catch (err: unknown) {
    return serverError("API-PAYMENT-MIDTRANS-WEBHOOK", err, {
      userMessage: "Internal server error",
    });
  }
}
