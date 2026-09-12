// Rate limiting & kuota fitur AI Landing Page Generator.
// Fitur ini eksklusif member Pro AI (bulanan/tahunan) — Basic & Free/Trial
// tidak dapat kuota sama sekali (0), digabung dengan cek plan di route.ts.

import { createClient as createServiceClient } from "@supabase/supabase-js";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const SLIDING_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 3; // Maksimal 3 generate per menit per toko (anti spam-klik)

// Sengaja tetap in-memory: jendela anti-spam-klik 1 menit tidak perlu presisi
// lintas-instance, beda dengan kuota bulanan/tahunan di bawah yang WAJIB persisten.
const slidingWindowMap = new Map<string, RateLimitEntry>();

export function isSlidingWindowLimited(storeId: string): boolean {
  const now = Date.now();
  const entry = slidingWindowMap.get(storeId);

  if (!entry || now > entry.resetTime) {
    slidingWindowMap.set(storeId, { count: 1, resetTime: now + SLIDING_WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

// Kuota bulanan Pro AI (langganan bulanan Rp329rb)
export const MONTHLY_QUOTA_PRO = 25;
// Kuota tahunan Pro Annual: 25 x 12 bulan + bonus 50 = 350
export const ANNUAL_QUOTA_PRO = 350;

function periodKey(planTier: "MONTHLY" | "ANNUAL"): string {
  if (planTier === "ANNUAL") {
    return String(new Date().getFullYear());
  }
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[AI-LANDING-PAGE-LIMITER] SUPABASE_SERVICE_ROLE_KEY tidak dikonfigurasi.");
    return null;
  }
  return createServiceClient(supabaseUrl, serviceRoleKey);
}

/**
 * Cek apakah kuota generate AI sudah habis untuk toko ini bulan/tahun ini.
 * Disimpan persisten di Supabase (bukan lagi in-memory) supaya tidak reset
 * kalau instance serverless Vercel di-recycle.
 *
 * Kalau service role tidak terkonfigurasi atau query gagal, FAIL-CLOSED
 * (anggap kuota habis) -- lebih aman menahan 1 generate ketimbang membiarkan
 * kuota tak terbatas diam-diam kalau ada masalah infrastruktur.
 */
export async function isUsageQuotaExceeded(
  storeId: string,
  planTier: "MONTHLY" | "ANNUAL"
): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) return true;

  const key = periodKey(planTier);
  const quota = planTier === "ANNUAL" ? ANNUAL_QUOTA_PRO : MONTHLY_QUOTA_PRO;

  const { data, error } = await supabase
    .from("ai_landing_page_usage")
    .select("used_count")
    .eq("store_id", storeId)
    .eq("period_key", key)
    .maybeSingle();

  if (error) {
    console.error("[AI-LANDING-PAGE-LIMITER] Gagal cek kuota:", error.message);
    return true;
  }

  const used = data?.used_count || 0;
  return used >= quota;
}

export async function recordUsage(storeId: string, planTier: "MONTHLY" | "ANNUAL"): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) return;

  const key = periodKey(planTier);

  const { data: existing } = await supabase
    .from("ai_landing_page_usage")
    .select("used_count")
    .eq("store_id", storeId)
    .eq("period_key", key)
    .maybeSingle();

  const { error } = await supabase.from("ai_landing_page_usage").upsert(
    {
      store_id: storeId,
      period_key: key,
      used_count: (existing?.used_count || 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "store_id,period_key" }
  );

  if (error) {
    console.error("[AI-LANDING-PAGE-LIMITER] Gagal mencatat pemakaian:", error.message);
  }
}
