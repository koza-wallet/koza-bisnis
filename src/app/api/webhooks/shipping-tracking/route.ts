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

    // Cari pesanan beserta data toko terkait
    let query = supabase
      .from("orders")
      .select(`
        id, 
        status, 
        tracking_history, 
        order_number, 
        customer_name, 
        customer_phone, 
        courier_name, 
        tracking_number, 
        estimated_delivery_date, 
        store_id, 
        stores ( name, whatsapp_number )
      `);

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

    // Hitung Estimasi Tiba (ETA) jika belum ada
    let estimatedEta = order.estimated_delivery_date;
    if (!estimatedEta) {
      const etaDays = (order.courier_name || "").toLowerCase().includes("kargo") ? 4 : 2;
      const etaDate = new Date();
      etaDate.setDate(etaDate.getDate() + etaDays);
      estimatedEta = etaDate.toISOString();
    }

    const updatePayload: any = {
      tracking_history: updatedHistory,
      last_tracking_status: mappedStatus,
      estimated_delivery_date: estimatedEta,
    };

    // Jika paket sudah sampai dan diterima, otomatis ubah status order menjadi SELESAI
    if (mappedStatus === "DELIVERED" && order.status !== "SELESAI") {
      updatePayload.status = "SELESAI";
    }

    await supabase.from("orders").update(updatePayload).eq("id", order.id);

    // =========================================================================
    // PHASE 2: Live WhatsApp Notifications Generator
    // =========================================================================
    const storeData = (Array.isArray(order.stores) ? order.stores[0] : order.stores) as { name?: string; whatsapp_number?: string } | null;
    const storeName = storeData?.name || "Toko Kami";
    let notificationPayload: { recipientPhone: string; message: string; eventType: string } | null = null;

    const trackingUrl = `https://www.kozabisnis.com/lacak/${order.order_number}`;

    if (mappedStatus === "OUT_FOR_DELIVERY") {
      notificationPayload = {
        recipientPhone: order.customer_phone,
        eventType: "OUT_FOR_DELIVERY",
        message: `Halo Kak *${order.customer_name}*! Paket pesananmu *#${order.order_number}* dari *${storeName}* (Kurir: ${order.courier_name}, Resi: ${order.tracking_number || "-"}) sedang dibawa kurir dan dalam perjalanan menuju rumah Anda 🛵.\n\nMohon pastikan ada penerima di alamat tujuan ya kak.\nLacak perjalanan kurir secara live di:\n👉 ${trackingUrl}`,
      };
      console.log(`[WHATSAPP-NOTIFICATION] [OUT_FOR_DELIVERY] ke ${order.customer_phone}:`, notificationPayload.message);
    } else if (mappedStatus === "DELIVERED") {
      notificationPayload = {
        recipientPhone: order.customer_phone,
        eventType: "DELIVERED",
        message: `Halo Kak *${order.customer_name}*! Paket pesananmu *#${order.order_number}* dari *${storeName}* telah tiba dan diterima dengan aman 📦✨.\n\nTerima kasih banyak sudah berbelanja di toko kami! Bagaimana kualitas produk yang kakak terima? Mohon luangkan waktu 10 detik untuk memberikan rating kepuasan di:\n👉 ${trackingUrl}?review=true`,
      };
      console.log(`[WHATSAPP-NOTIFICATION] [DELIVERED] ke ${order.customer_phone}:`, notificationPayload.message);
    }

    return NextResponse.json({
      success: true,
      message: `Status tracking pesanan ${order.order_number} berhasil diperbarui.`,
      newStatus: mappedStatus,
      estimatedDeliveryDate: estimatedEta,
      notification: notificationPayload,
    });
  } catch (err: any) {
    console.error("Webhook shipping tracking error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memproses webhook tracking." },
      { status: 500 }
    );
  }
}
