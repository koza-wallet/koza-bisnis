import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { serverError } from "@/lib/api-error";

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
      return serverError(
        "API-PAYMENT-VERIFY-STATUS",
        new Error("MIDTRANS_SERVER_KEY tidak dikonfigurasi di server."),
        { userMessage: "Gagal memverifikasi pembayaran. Silakan coba lagi atau hubungi admin." }
      );
    }

    const basicAuth = Buffer.from(serverKey + ":").toString("base64");

    // 1. Coba cek dengan orderId (standar Midtrans Core API)
    let midtransData: any = null;
    const diagnostics: string[] = [];

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

      const parsed = await coreRes.json().catch(() => null);

      if (coreRes.ok) {
        // Midtrans Core API mengembalikan status_code "404" jika order_id tidak terdaftar di v2 (misal kanal DANA)
        if (parsed && parsed.status_code !== "404" && parsed.transaction_status) {
          midtransData = parsed;
        } else {
          diagnostics.push(`core-api ok tapi tanpa transaction_status (status_code=${parsed?.status_code})`);
        }
      } else {
        diagnostics.push(`core-api HTTP ${coreRes.status}: ${JSON.stringify(parsed)}`);
      }
    } catch (err) {
      diagnostics.push(`core-api exception: ${err instanceof Error ? err.message : String(err)}`);
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

        const snapData = await snapRes.json().catch(() => null);

        if (snapRes.ok) {
          if (snapData && snapData.transaction_status) {
            midtransData = snapData;
          } else {
            diagnostics.push(`snap-api ok tapi tanpa transaction_status: ${JSON.stringify(snapData)}`);
          }
        } else {
          diagnostics.push(`snap-api HTTP ${snapRes.status}: ${JSON.stringify(snapData)}`);
        }
      } catch (err) {
        diagnostics.push(`snap-api exception: ${err instanceof Error ? err.message : String(err)}`);
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

        const parsedTx = await txRes.json().catch(() => null);

        if (txRes.ok) {
          if (parsedTx && parsedTx.status_code !== "404" && parsedTx.transaction_status) {
            midtransData = parsedTx;
          } else {
            diagnostics.push(`transaction-id-api ok tapi tanpa transaction_status (status_code=${parsedTx?.status_code})`);
          }
        } else {
          diagnostics.push(`transaction-id-api HTTP ${txRes.status}: ${JSON.stringify(parsedTx)}`);
        }
      } catch (err) {
        diagnostics.push(`transaction-id-api exception: ${err instanceof Error ? err.message : String(err)}`);
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
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
          return serverError(
            "API-PAYMENT-VERIFY-STATUS",
            new Error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di environment server."),
            { userMessage: "Gagal memverifikasi pembayaran. Silakan coba lagi atau hubungi admin." }
          );
        }

        const supabaseAdmin = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
          serviceRoleKey
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
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) {
        console.error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di environment server.");
        return NextResponse.json(
          { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY missing." },
          { status: 500 }
        );
      }

      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
        serviceRoleKey
      );

      const { data: rpcData, error: rpcErr } = await supabaseAdmin.rpc(
        "handle_midtrans_settlement",
        {
          p_order_id: orderId,
          p_payment_type: paymentType,
        }
      );

      if (rpcErr) {
        return serverError(
          "API-PAYMENT-VERIFY-STATUS-RPC",
          new Error(`handle_midtrans_settlement RPC error: ${rpcErr.message}`),
          {
            userMessage:
              "Pembayaran terverifikasi di Midtrans, tapi gagal disinkronkan ke sistem kami. Tim kami akan menindaklanjuti otomatis, atau silakan hubungi admin.",
            extra: { settled: false },
          }
        );
      }

      if (rpcData && rpcData.success === false) {
        return serverError(
          "API-PAYMENT-VERIFY-STATUS-RPC",
          new Error(`handle_midtrans_settlement returned failure: ${rpcData.message}`),
          {
            userMessage:
              "Pembayaran terverifikasi di Midtrans, tapi gagal disinkronkan ke sistem kami. Silakan hubungi admin.",
            extra: { settled: false },
          }
        );
      }

      return NextResponse.json({
        settled: true,
        status: "SETTLED",
        result: rpcData,
      });
    }

    if (diagnostics.length > 0) {
      console.warn(`[API-PAYMENT-VERIFY-STATUS] order=${orderId} belum settled:`, diagnostics);
    }

    return NextResponse.json({
      settled: false,
      status: tx.status,
    });
  } catch (err: unknown) {
    return serverError("API-PAYMENT-VERIFY-STATUS", err, {
      userMessage: "Gagal memeriksa status pembayaran. Silakan coba lagi.",
    });
  }
}
