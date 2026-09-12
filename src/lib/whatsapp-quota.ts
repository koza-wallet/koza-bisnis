import { createClient as createServiceClient } from "@supabase/supabase-js";

// ==============================================================================
// KOZA BISNIS — KUOTA PESAN WHATSAPP BULANAN (Fonnte Lite 1.000 pesan/bulan)
// Menggantikan limit kasar 150 chat/hari: kuota ini mengikuti batas riil paket
// Fonnte Lite yang dipakai tiap device toko Pro, dihitung dari SEMUA pesan
// keluar via Fonnte (balasan Jaga AI + notifikasi order + notifikasi resi),
// karena semuanya berbagi kuota device yang sama di sisi Fonnte.
// ==============================================================================

export const WA_BASE_MONTHLY_QUOTA = 1000;

export interface WhatsAppQuotaStatus {
  periodKey: string;
  used: number;
  baseQuota: number;
  addonPurchased: number;
  totalQuota: number;
  remaining: number;
  exceeded: boolean;
  percentage: number;
}

function currentPeriodKey(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[WHATSAPP-QUOTA] SUPABASE_SERVICE_ROLE_KEY tidak dikonfigurasi.");
    return null;
  }
  return createServiceClient(supabaseUrl, serviceRoleKey);
}

function emptyStatus(periodKey: string): WhatsAppQuotaStatus {
  return {
    periodKey,
    used: 0,
    baseQuota: WA_BASE_MONTHLY_QUOTA,
    addonPurchased: 0,
    totalQuota: WA_BASE_MONTHLY_QUOTA,
    remaining: WA_BASE_MONTHLY_QUOTA,
    exceeded: false,
    percentage: 0,
  };
}

/**
 * Cek sisa kuota pesan WhatsApp bulan ini untuk sebuah toko.
 *
 * FAIL-OPEN (bukan fail-closed) kalau DB/config gagal: berbeda dengan kuota
 * biaya LLM lain di proyek ini, kuota ini murni mengikuti limit vendor Fonnte
 * -- Fonnte sendiri yang akan menolak kirim kalau device benar-benar
 * over-limit, jadi gangguan DB kita tidak boleh sampai memutus obrolan
 * pembeli asli yang sah.
 */
export async function getWhatsAppQuotaStatus(storeId: string): Promise<WhatsAppQuotaStatus> {
  const periodKey = currentPeriodKey();
  const supabase = getServiceClient();
  if (!supabase) return emptyStatus(periodKey);

  const { data, error } = await supabase
    .from("whatsapp_message_usage")
    .select("messages_sent, addon_purchased")
    .eq("store_id", storeId)
    .eq("period_key", periodKey)
    .maybeSingle();

  if (error) {
    console.error("[WHATSAPP-QUOTA] Gagal cek kuota, fail-open:", error.message);
    return emptyStatus(periodKey);
  }

  const used = data?.messages_sent || 0;
  const addonPurchased = data?.addon_purchased || 0;
  const totalQuota = WA_BASE_MONTHLY_QUOTA + addonPurchased;
  const remaining = Math.max(0, totalQuota - used);

  return {
    periodKey,
    used,
    baseQuota: WA_BASE_MONTHLY_QUOTA,
    addonPurchased,
    totalQuota,
    remaining,
    exceeded: used >= totalQuota,
    percentage: Math.min(100, Math.round((used / totalQuota) * 100)),
  };
}

/**
 * Catat 1 pesan keluar via Fonnte untuk toko ini (dipanggil setiap kali kirim
 * pesan berhasil: balasan Jaga AI, notifikasi order baru, notifikasi resi).
 * Best-effort -- kegagalan di sini tidak boleh membatalkan pesan yang sudah terkirim.
 */
export async function incrementWhatsAppUsage(storeId: string): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) return;

  const periodKey = currentPeriodKey();

  const { data: existing } = await supabase
    .from("whatsapp_message_usage")
    .select("messages_sent")
    .eq("store_id", storeId)
    .eq("period_key", periodKey)
    .maybeSingle();

  const { error } = await supabase.from("whatsapp_message_usage").upsert(
    {
      store_id: storeId,
      period_key: periodKey,
      messages_sent: (existing?.messages_sent || 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "store_id,period_key" }
  );

  if (error) {
    console.error("[WHATSAPP-QUOTA] Gagal mencatat pemakaian:", error.message);
  }
}
