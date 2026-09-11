// Rate limiting & kuota fitur AI Landing Page Generator.
// Fitur ini eksklusif member Pro AI (bulanan/tahunan) — Basic & Free/Trial
// tidak dapat kuota sama sekali (0), digabung dengan cek plan di route.ts.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const SLIDING_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 3; // Maksimal 3 generate per menit per toko (anti spam-klik)

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

const usageMap = new Map<string, number>();

function monthKey(storeId: string): string {
  const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
  return `${storeId}_month_${ym}`;
}

function yearKey(storeId: string): string {
  const y = new Date().getFullYear();
  return `${storeId}_year_${y}`;
}

/**
 * Cek apakah kuota generate AI sudah habis untuk toko ini bulan/tahun ini.
 * planTier "ANNUAL" pakai kuota tahunan (350), selain itu pakai kuota bulanan (25).
 * Pemanggil WAJIB memastikan toko benar-benar berlangganan Pro AI sebelum
 * memanggil fungsi ini — fungsi ini murni soal kuota, bukan soal akses fitur.
 */
export function isUsageQuotaExceeded(storeId: string, planTier: "MONTHLY" | "ANNUAL"): boolean {
  if (planTier === "ANNUAL") {
    const key = yearKey(storeId);
    const used = usageMap.get(key) || 0;
    return used >= ANNUAL_QUOTA_PRO;
  }
  const key = monthKey(storeId);
  const used = usageMap.get(key) || 0;
  return used >= MONTHLY_QUOTA_PRO;
}

export function recordUsage(storeId: string, planTier: "MONTHLY" | "ANNUAL"): void {
  const key = planTier === "ANNUAL" ? yearKey(storeId) : monthKey(storeId);
  usageMap.set(key, (usageMap.get(key) || 0) + 1);
}
