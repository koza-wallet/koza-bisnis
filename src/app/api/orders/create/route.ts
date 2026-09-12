import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOrderNumber } from "@/lib/utils";
import { notifyNewOrderOnWhatsApp } from "@/lib/whatsapp-order-notifier";
import { serverError } from "@/lib/api-error";

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
      landingPageId,
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

    // 3. Inisialisasi Supabase Client & Validasi Server Role Key (Audit Konsistensi Patch #6 & #8)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
      return NextResponse.json(
        { error: "Server configuration error: missing service role credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      serviceRoleKey
    );

    // Validasi ekspedisi yang diaktifkan oleh toko (Store Shipping Settings)
    const { data: storeCheck } = await supabase
      .from("public_stores")
      .select("id, enabled_couriers")
      .eq("id", storeId)
      .maybeSingle();

    if (storeCheck && Array.isArray(storeCheck.enabled_couriers) && storeCheck.enabled_couriers.length > 0) {
      const cleanCourier = sanitizeText(String(courierName || "")).toUpperCase();
      const isAllowed = storeCheck.enabled_couriers.some((code: string) => {
        const upperCode = code.toUpperCase();
        if (upperCode === "JNT" && (cleanCourier.includes("J&T") || cleanCourier.includes("JNT"))) return true;
        if (upperCode === "JNE" && cleanCourier.includes("JNE") && !cleanCourier.includes("TRUCKING") && !cleanCourier.includes("JTR")) return true;
        if (upperCode === "SICEPAT" && cleanCourier.includes("SICEPAT")) return true;
        if (upperCode === "ANTERAJA" && cleanCourier.includes("ANTERAJA")) return true;
        if (upperCode === "JTR" && (cleanCourier.includes("JTR") || cleanCourier.includes("TRUCKING"))) return true;
        if (upperCode === "JNTCARGO" && (cleanCourier.includes("J&T CARGO") || cleanCourier.includes("JNTCARGO"))) return true;
        if (upperCode === "INDAH" && (cleanCourier.includes("INDAH") || cleanCourier.includes("INDAH LOGISTIK"))) return true;
        return cleanCourier.includes(upperCode);
      });

      if (!isAllowed && cleanCourier.length > 0) {
        return NextResponse.json(
          { error: `Pilihan ekspedisi "${courierName}" saat ini tidak didukung oleh toko ini.` },
          { status: 400 }
        );
      }
    }

    // Ambil metadata produk (harga, MOQ, tier grosir) dari database untuk validasi resmi
    const productIds = items
      .map((i: any) => i.productId || i.id)
      .filter((id: any): id is string => typeof id === "string" && id.length > 0);

    interface ProductMeta {
      id: string;
      name: string;
      sellingPrice: number;
      costPrice: number;
      minOrderQuantity: number;
      wholesaleTiers: Array<{ min_qty?: number; minQty?: number; unit_price?: number; unitPrice?: number }>;
    }

    let productMetaMap = new Map<string, ProductMeta>();
    if (productIds.length > 0) {
      const { data: realProducts } = await supabase
        .from("products")
        .select("id, name, selling_price, cost_price, min_order_quantity, wholesale_tiers")
        .eq("store_id", storeId)
        .in("id", productIds);

      if (realProducts) {
        productMetaMap = new Map(
          realProducts.map((p: any) => [
            p.id,
            {
              id: p.id,
              name: p.name,
              sellingPrice: Number(p.selling_price),
              costPrice: Math.max(0, Number(p.cost_price || 0)),
              minOrderQuantity: Math.max(1, Number(p.min_order_quantity || 1)),
              wholesaleTiers: Array.isArray(p.wholesale_tiers) ? p.wholesale_tiers : [],
            },
          ])
        );
      }
    }

    // Landing page berdiri sendiri (tidak terhubung produk katalog, dipakai murni untuk
    // support iklan Meta/TikTok) — harga resminya diambil dari landing_pages.pricing yang
    // di-set seller lewat dashboard (RLS-protected), BUKAN dari unitPrice yang dikirim client.
    let landingPagePromoPrice: number | null = null;
    if (landingPageId && typeof landingPageId === "string") {
      const { data: lpRow } = await supabase
        .from("landing_pages")
        .select("pricing")
        .eq("id", landingPageId)
        .eq("store_id", storeId)
        .eq("is_active", true)
        .maybeSingle();

      const promoPrice = Number(lpRow?.pricing?.promoPrice);
      if (Number.isFinite(promoPrice) && promoPrice > 0) {
        landingPagePromoPrice = promoPrice;
      }
    }

    // Validasi item pesanan
    let calculatedItemsTotal = 0;
    let calculatedTotalCostPrice = 0;
    const sanitizedItems = [];

    for (const itm of items) {
      const itmName = sanitizeText(String(itm.productName || itm.name || "Produk"));
      const qty = Math.floor(Number(itm.quantity || 1));
      const pId = itm.productId || itm.id || undefined;

      if (qty < 1 || qty > 10000) {
        return NextResponse.json(
          { error: "Jumlah barang tidak valid (antara 1 hingga 10000)." },
          { status: 400 }
        );
      }

      const pMeta = pId ? productMetaMap.get(pId) : undefined;

      // 1. Validasi B2B: Minimum Order Quantity (MOQ)
      if (pMeta && pMeta.minOrderQuantity > 1 && qty < pMeta.minOrderQuantity) {
        return NextResponse.json(
          {
            error: `Minimal pemesanan untuk produk "${pMeta.name}" adalah ${pMeta.minOrderQuantity} pcs (Anda memesan ${qty} pcs).`,
          },
          { status: 400 }
        );
      }

      // 2. Tentukan harga resmi HANYA dari sumber terverifikasi server — tidak pernah dari
      // unitPrice/price yang dikirim client (celah harga tempo hari, ditutup sekarang untuk
      // kedua jalur: produk katalog maupun landing page berdiri sendiri tanpa produk).
      let price: number;

      if (pMeta) {
        // 2a. Produk katalog: hitung harga berdasarkan tier grosir jika kuantiti memenuhi syarat.
        let matchedPrice = pMeta.sellingPrice;
        if (pMeta.wholesaleTiers && pMeta.wholesaleTiers.length > 0) {
          const sortedTiers = [...pMeta.wholesaleTiers].sort((a, b) => {
            const minA = Number(a.minQty ?? a.min_qty ?? 0);
            const minB = Number(b.minQty ?? b.min_qty ?? 0);
            return minB - minA;
          });

          for (const tier of sortedTiers) {
            const minQ = Number(tier.minQty ?? tier.min_qty ?? 0);
            const tierPrice = Number(tier.unitPrice ?? tier.unit_price ?? 0);
            if (minQ > 0 && qty >= minQ && tierPrice > 0) {
              matchedPrice = tierPrice;
              break;
            }
          }
        }
        price = matchedPrice;
      } else if (landingPagePromoPrice !== null) {
        // 2b. Landing page berdiri sendiri (tanpa produk katalog): pakai harga promo resmi
        // yang tersimpan di landing_pages.pricing, bukan MOQ/tier grosir (tidak berlaku di sini).
        price = landingPagePromoPrice;
      } else {
        return NextResponse.json(
          { error: `Item pesanan "${itmName}" tidak dapat diverifikasi harganya.` },
          { status: 400 }
        );
      }

      const unitCost = pMeta ? pMeta.costPrice : 0;
      calculatedTotalCostPrice += qty * unitCost;

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
    const calculatedNetProfit = Math.max(0, calculatedItemsTotal - calculatedTotalCostPrice);
    const orderNumber = generateOrderNumber();

    // 4. Penentuan Status Awal & Alokasi Kuota (Patch #8)
    // Checkout tidak pernah memblokir pembeli.
    // - WHATSAPP: Masuk MENUNGGU_BAYAR (kuota baru dipotong saat penjual verifikasi pembayaran di dashboard).
    // - QRIS_TOKO: Coba potong kuota langsung. Jika kuota cukup -> DIPROSES; jika habis -> TERKUNCI_KUOTA.
    let initialStatus = "MENUNGGU_BAYAR";

    if (paymentMethod === "QRIS_TOKO") {
      try {
        const { data: quotaRes, error: quotaErr } = await supabase.rpc("consume_order_quota", {
          p_store_id: storeId,
        });
        if (!quotaErr && quotaRes?.success === true) {
          initialStatus = "DIPROSES";
        } else {
          initialStatus = "TERKUNCI_KUOTA";
        }
      } catch (quotaCatchErr) {
        console.warn("consume_order_quota call failed for QRIS_TOKO:", quotaCatchErr);
        initialStatus = "TERKUNCI_KUOTA";
      }
    } else {
      initialStatus = "MENUNGGU_BAYAR";
    }

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
      total_cost_price: calculatedTotalCostPrice,
      net_profit: calculatedNetProfit,
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

    // 5. Kirim Notifikasi WhatsApp Otomatis ke Pembeli & Penjual (Non-blocking)
    try {
      const { data: storeInfo } = await supabase
        .from("stores")
        .select("id, name, slug, whatsapp_number, whatsapp_bot_settings")
        .eq("id", storeId)
        .maybeSingle();

      if (storeInfo && storeInfo.whatsapp_bot_settings?.status === "CONNECTED") {
        notifyNewOrderOnWhatsApp({
          order: {
            orderNumber,
            customerName: cleanName,
            customerPhone: cleanPhone,
            courierName: String(courierName || "Kurir Rekomendasi"),
            shippingCost: validShippingCost,
            grandTotal,
            paymentMethod,
            items: sanitizedItems,
          },
          store: {
            id: storeInfo.id,
            name: storeInfo.name,
            slug: storeInfo.slug,
            whatsappNumber: storeInfo.whatsapp_number,
            whatsapp_bot_settings: storeInfo.whatsapp_bot_settings,
          },
        }).catch((notifErr) => {
          console.warn("[CREATE-ORDER] Async WhatsApp notification error:", notifErr);
        });
      }
    } catch (notifCatch) {
      console.warn("[CREATE-ORDER] Error querying store for notification:", notifCatch);
    }

    // 6. Return respon sukses terstruktur
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
  } catch (err: unknown) {
    return serverError("API-ORDERS-CREATE", err, {
      userMessage: "Gagal membuat pesanan. Silakan coba lagi.",
    });
  }
}
