import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TrackingEvent } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Biteship tracking webhook payload format
    // { event: 'tracking.status.updated', tracking_id: '...', waybill_id: '...', status: 'delivered', courier: '...', updated_at: '...' }
    const trackingNumber = body.waybill_id || body.tracking_number || body.trackingNumber;
    const orderNumber = body.order_number || body.orderNumber;
    const incomingStatus = (body.status || "").toLowerCase();
    const note = body.note || body.description || "Pembaruan status dari ekspedisi.";
    const location = body.location || "Pusat Transit";
    const timestamp = body.updated_at || new Date().toISOString();

    if (!trackingNumber && !orderNumber) {
      return NextResponse.json(
        { success: false, message: "Nomor resi atau nomor order wajib disertakan." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi server role belum tersedia." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Cari pesanan berdasarkan tracking_number atau order_number
    let query = supabase.from("orders").select("id, status, tracking_history, order_number");
    if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    } else {
      query = query.eq("tracking_number", trackingNumber);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan untuk diperbarui." },
        { status: 404 }
      );
    }

    let mappedStatus: TrackingEvent["status"] = "IN_TRANSIT";
    if (incomingStatus.includes("deliver") || incomingStatus.includes("selesai") || incomingStatus.includes("terima")) {
      mappedStatus = "DELIVERED";
    } else if (incomingStatus.includes("out_for_delivery") || incomingStatus.includes("antar")) {
      mappedStatus = "OUT_FOR_DELIVERY";
    } else if (incomingStatus.includes("pickup") || incomingStatus.includes("jemput")) {
      mappedStatus = "PICKED_UP";
    }

    const newEvent: TrackingEvent = {
      date: timestamp,
      description: note,
      location: location,
      status: mappedStatus,
    };

    const existingHistory: TrackingEvent[] = Array.isArray(order.tracking_history) ? order.tracking_history : [];
    const updatedHistory = [newEvent, ...existingHistory];

    const updatePayload: any = {
      tracking_history: updatedHistory,
      last_tracking_status: mappedStatus,
    };

    // Jika paket sudah sampai dan diterima, otomatis ubah status order menjadi SELESAI
    if (mappedStatus === "DELIVERED" && order.status !== "SELESAI") {
      updatePayload.status = "SELESAI";
    }

    await supabase.from("orders").update(updatePayload).eq("id", order.id);

    return NextResponse.json({
      success: true,
      message: `Status tracking pesanan ${order.order_number} berhasil diperbarui.`,
      newStatus: mappedStatus,
    });
  } catch (err: any) {
    console.error("Webhook shipping tracking error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memproses webhook tracking." },
      { status: 500 }
    );
  }
}
