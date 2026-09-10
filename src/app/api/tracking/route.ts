import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TrackingEvent, PublicOrderTracking } from "@/types";

export const dynamic = "force-dynamic";

function generateSimulatedTimeline(courier: string, resi: string, createdAt: string, status: string): TrackingEvent[] {
  const baseDate = new Date(createdAt);
  const now = new Date();
  
  const step1 = new Date(baseDate.getTime() + 1000 * 60 * 30); // +30 menit
  const step2 = new Date(baseDate.getTime() + 1000 * 60 * 60 * 4); // +4 jam
  const step3 = new Date(baseDate.getTime() + 1000 * 60 * 60 * 18); // +18 jam
  const step4 = new Date(baseDate.getTime() + 1000 * 60 * 60 * 24); // +24 jam

  const events: TrackingEvent[] = [
    {
      date: step1.toISOString(),
      description: `Nomor resi ${resi} diterbitkan. Paket siap dijemput oleh kurir ${courier}.`,
      location: "Gudang Pengirim",
      status: "PICKED_UP",
    },
  ];

  if (now > step2) {
    events.unshift({
      date: step2.toISOString(),
      description: `Paket telah diterima dan diproses di Gateway Sortir Pusat ${courier}.`,
      location: "Hub Sortir Logistik",
      status: "IN_TRANSIT",
    });
  }

  if (now > step3 || status === "DIKIRIM") {
    events.unshift({
      date: step3.toISOString(),
      description: `Paket telah tiba di Drop Point kota tujuan dan sedang dijadwalkan pengantaran.`,
      location: "Drop Point Wilayah Penerima",
      status: "IN_TRANSIT",
    });
  }

  if (status === "SELESAI") {
    events.unshift({
      date: (now > step4 ? step4 : now).toISOString(),
      description: `Paket telah berhasil diterima oleh yang bersangkutan / pihak penerima di alamat.`,
      location: "Alamat Tujuan",
      status: "DELIVERED",
    });
  } else if (now > step4) {
    events.unshift({
      date: step4.toISOString(),
      description: `Paket sedang dibawa oleh kurir menuju alamat Anda hari ini. Mohon pastikan nomor telepon aktif.`,
      location: "Dalam Antaran Kurir",
      status: "OUT_FOR_DELIVERY",
    });
  }

  return events;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: "Parameter orderNumber wajib disertakan." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi database belum tersedia." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Ambil data order dari view public_order_tracking
    const { data: order, error } = await supabase
      .from("public_order_tracking")
      .select("*")
      .eq("order_number", orderNumber.trim())
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, message: "Pesanan dengan nomor tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    let history: TrackingEvent[] = Array.isArray(order.tracking_history) && order.tracking_history.length > 0
      ? order.tracking_history
      : [];

    // Jika resi sudah ada namun riwayat tracking di database masih kosong, generate timeline realistis
    if (history.length === 0 && order.tracking_number) {
      history = generateSimulatedTimeline(
        order.courier_name,
        order.tracking_number,
        order.created_at,
        order.status
      );
    }

    const trackingData: PublicOrderTracking = {
      id: order.id,
      orderNumber: order.order_number,
      storeId: order.store_id,
      storeName: order.store_name,
      storeLogoUrl: order.store_logo_url,
      storeWhatsappNumber: order.store_whatsapp_number,
      storeSlug: order.store_slug,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      destinationCity: order.destination_city,
      destinationDistrict: order.destination_district,
      courierName: order.courier_name,
      courierService: order.courier_service,
      trackingNumber: order.tracking_number,
      status: order.status,
      lastTrackingStatus: history[0]?.status || order.last_tracking_status || "PENDING",
      trackingHistory: history,
      items: Array.isArray(order.items) ? order.items : [],
      shippingCost: Number(order.shipping_cost) || 0,
      grandTotal: Number(order.grand_total) || 0,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (err: any) {
    console.error("Error fetching tracking data:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal memuat status pelacakan." },
      { status: 500 }
    );
  }
}
