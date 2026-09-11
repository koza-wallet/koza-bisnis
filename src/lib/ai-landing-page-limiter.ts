// Rate limiting khusus endpoint AI Landing Page Generator.
// Mengikuti pola sliding-window yang sudah ada di src/app/api/orders/create/route.ts,
// plus kuota harian per toko, supaya panggilan OpenAI berbayar tidak bisa disalahgunakan
// (denial-of-wallet) — pola proteksi yang sama dipakai di seluruh endpoint AI lain di repo ini.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const SLIDING_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 3; // Maksimal 3 generate per menit per toko

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

const DAILY_QUOTA_NON_PRO = 10;
const DAILY_QUOTA_PRO = 30;

const dailyUsageMap = new Map<string, number>();

function todayKey(storeId: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${storeId}_${today}`;
}

export function isDailyQuotaExceeded(storeId: string, isPro: boolean): boolean {
  const key = todayKey(storeId);
  const used = dailyUsageMap.get(key) || 0;
  const limit = isPro ? DAILY_QUOTA_PRO : DAILY_QUOTA_NON_PRO;
  return used >= limit;
}

export function recordDailyUsage(storeId: string): void {
  const key = todayKey(storeId);
  dailyUsageMap.set(key, (dailyUsageMap.get(key) || 0) + 1);
}
