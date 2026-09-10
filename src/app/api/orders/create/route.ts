import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOrderNumber } from "@/lib/utils";

// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 5; // Maksimal 5 pesanan per menit per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

// Helper sanitasi teks dari karakter injeksi dan tag HTML
function sanitizeText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/[<>'"&]/g, "")
    .trim();
}

// Helper validasi dan normalisasi nomor WhatsApp / telepon Indonesia
function normalizePhone(phone: string): { valid: boolean; normalized: string } {
  if (!phone) return { valid: false, normalized: "" };
  let cleaned = phone.replace(/[^0-9+]/g, "").trim();

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith("08")) {
    cleaned = "628" + cleaned.substring(2);
  } else if (cleaned.startsWith("8")) {
    cleaned = "628" + cleaned.substring(1);
  }

  const isValid = /^628[0-9]{8,12}$/.test(cleaned);
  return { valid: isValid, normalized: cleaned };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (Anti-Spam Bot)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : "127.0.0.1";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan pemesanan. Silakan tunggu 1 menit sebelum membuat pesanan kembali.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      storeId,
      customerName,
      customerPhone,
      customerAddress,
      destinationCity,
      destinationDistrict,
      courierName,
      courierService = "Reguler (1-2 Hari)",
      shippingCost = 0,
      items = [],
      paymentMethod = "WHATSAPP",
    } = body;

    // 2. Validasi & Sanitasi Input (Audit P1.4)
    if (!storeId || typeof storeId !== "string") {
      return NextResponse.json(
        { error: "storeId wajib diisi." },
        { status: 400 }
      );
    }

    const cleanName = sanitizeText(String(customerName || ""));
    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi (antara 2 hingga 100 karakter)." },
        { status: 400 }
      );
    }

    const { valid: isPhoneValid, normalized: cleanPhone } = normalizePhone(
      String(customerPhone || "")
    );
    if (!isPhoneValid) {
      return NextResponse.json(
        {
          error:
            "Nomor WhatsApp tidak valid. Masukkan nomor HP Indonesia yang aktif (contoh: 08123456789).",
        },
        { status: 400 }
      );
    }

    const cleanAddress = sanitizeText(String(customerAddress || ""));
    if (cleanAddress.length < 5 || cleanAddress.length > 500) {
      return NextResponse.json(
        {
          error:
            "Alamat pengiriman wajib diisi lengkap (antara 5 hingga 500 karakter).",
        },
        { status: 400 }
      );
    }

    const cleanCity = sanitizeText(String(destinationCity || ""));
    if (!cleanCity) {
      return NextResponse.json(
        { error: "Kota tujuan pengiriman wajib dipilih." },
        { status: 400 }
      );
    }

    const cleanDistrict = sanitizeText(String(destinationDistrict || ""));

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Pesanan harus memuat minimal satu produk." },
        { status: 400 }
      );
    }

    // 3. Inisialisasi Supabase Client & Validasi Harga Server-Side (Audit P1)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
    );

    // Ambil harga asli produk dari database untuk mencocokkan harga resmi
    const productIds = items
      .map((i: any) => i.productId || i.id)
      .filter((id: any): id is string => typeof id === "string" && id.length > 0);

    let priceMap = new Map<string, number>();
    if (productIds.length > 0) {
      const { data: realProducts } = await supabase
        .from("public_products")
        .select("id, selling_price")
        .eq("store_id", storeId)
        .in("id", productIds);

      if (realProducts) {
        priceMap = new Map(realProducts.map((p: any) => [p.id, Number(p.selling_price)]));
      }
    }

    // Validasi item pesanan
    let calculatedItemsTotal = 0;
    const sanitizedItems = [];

    for (const itm of items) {
      const itmName = sanitizeText(String(itm.productName || itm.name || "Produk"));
      const qty = Math.floor(Number(itm.quantity || 1));
      const pId = itm.productId || itm.id || undefined;

      // Gunakan harga resmi database jika tersedia; fallback jika custom non-catalog item
      const dbPrice = pId ? priceMap.get(pId) : undefined;
      const price = dbPrice !== undefined ? dbPrice : Math.max(0, Number(itm.unitPrice || itm.price || 0));

      if (qty < 1 || qty > 1000) {
        return NextResponse.json(
          { error: "Jumlah barang tidak valid (antara 1 hingga 1000)." },
          { status: 400 }
        );
      }

      calculatedItemsTotal += qty * price;
      sanitizedItems.push({
        productId: pId,
        productName: itmName,
        quantity: qty,
        unitPrice: price,
        subtotal: qty * price,
      });
    }

    const validShippingCost = Math.max(0, Number(shippingCost || 0));
    const grandTotal = calculatedItemsTotal + validShippingCost;
    const orderNumber = generateOrderNumber();

    const initialStatus =
      paymentMethod === "QRIS_TOKO" ? "DIPROSES" : "MENUNGGU_BAYAR";

    const { error: insertErr } = await supabase.from("orders").insert({
      order_number: orderNumber,
      store_id: storeId,
      customer_name: cleanName,
      customer_phone: cleanPhone,
      customer_address: cleanAddress,
      destination_city: cleanCity,
      destination_district: cleanDistrict || undefined,
      courier_name: sanitizeText(String(courierName || "Kurir Rekomendasi")),
      courier_service: sanitizeText(String(courierService)),
      shipping_cost: validShippingCost,
      items_total: calculatedItemsTotal,
      grand_total: grandTotal,
      total_cost_price: 0,
      net_profit: 0,
      status: initialStatus,
      payment_method: paymentMethod === "QRIS_TOKO" ? "QRIS_TOKO" : "WHATSAPP",
      items: sanitizedItems,
    });

    if (insertErr) {
      console.error("Failed to insert order to Supabase:", insertErr);
      return NextResponse.json(
        { error: "Gagal menyimpan pesanan ke database. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // 4. Return respon sukses terstruktur
    const completedOrder = {
      orderNumber,
      storeId,
      customerName: cleanName,
      customerPhone: cleanPhone,
      customerAddress: cleanAddress,
      destinationCity: cleanCity,
      destinationDistrict: cleanDistrict,
      courierName: String(courierName || "Kurir Rekomendasi"),
      courierService: String(courierService),
      shippingCost: validShippingCost,
      itemsTotal: calculatedItemsTotal,
      grandTotal,
      status: initialStatus,
      paymentMethod: paymentMethod === "QRIS_TOKO" ? "QRIS_TOKO" : "WHATSAPP",
      items: sanitizedItems,
    };

    return NextResponse.json({
      success: true,
      order: completedOrder,
    });
  } catch (err: any) {
    console.error("Error in create order API:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
