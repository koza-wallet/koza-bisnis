// ==============================================================================
// KOZA BISNIS — OTOMASI SSL EDGE VERCEL (Multi-Tenant Custom Domain)
// Mendaftarkan/menghapus custom domain seller ke project Vercel via API resmi,
// supaya Vercel otomatis memantau DNS & menerbitkan sertifikat SSL (Let's Encrypt)
// begitu CNAME/A record terdeteksi benar -- tanpa perlu ditambahkan manual satu-satu
// lewat Vercel Dashboard.
// ==============================================================================

interface VercelApiConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

function getVercelApiConfig(): VercelApiConfig | null {
  const token = process.env.VERCEL_AUTH_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return null;
  return { token, projectId, teamId };
}

function withTeamQuery(url: string, teamId?: string): string {
  if (!teamId) return url;
  return `${url}${url.includes("?") ? "&" : "?"}teamId=${teamId}`;
}

// Timeout WAJIB di setiap panggilan keluar ke api.vercel.com -- serverless function
// di Vercel punya batas waktu eksekusi sendiri (10 detik di plan Hobby). Kalau fetch
// ini menggantung tanpa timeout, function-nya di-kill paksa oleh platform dan
// mengembalikan 502 dengan body BUKAN JSON (bukan error kita, tidak bisa ditangkap
// oleh try/catch kita sendiri) -- jadi timeout di sini harus lebih pendek dari itu.
const VERCEL_API_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERCEL_API_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface AddDomainResult {
  success: boolean;
  verified: boolean;
  error?: string;
}

/**
 * Mendaftarkan domain ke project Vercel (POST /v10/projects/{id}/domains).
 * Begitu berhasil, Vercel mulai memantau DNS domain ini secara otomatis dan
 * menerbitkan sertifikat SSL sendiri -- tidak perlu langkah manual tambahan.
 */
export async function addVercelDomain(domain: string): Promise<AddDomainResult> {
  const config = getVercelApiConfig();
  if (!config) {
    return { success: false, verified: false, error: "Kredensial Vercel API belum dikonfigurasi di server." };
  }

  const url = withTeamQuery(`https://api.vercel.com/v10/projects/${config.projectId}/domains`, config.teamId);

  try {
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return { success: true, verified: Boolean(data.verified) };
    }

    // Domain sudah terdaftar sebelumnya di project KITA sendiri -- perlakukan idempoten, bukan error.
    if (data?.error?.projectId === config.projectId) {
      return { success: true, verified: Boolean(data?.verified) };
    }

    return {
      success: false,
      verified: false,
      error: data?.error?.message || `Vercel API menolak permintaan (HTTP ${res.status}).`,
    };
  } catch (err) {
    return {
      success: false,
      verified: false,
      error: err instanceof Error ? err.message : "Gagal menghubungi Vercel API.",
    };
  }
}

/**
 * Menghapus domain dari project Vercel (DELETE /v9/projects/{id}/domains/{domain}).
 * Best-effort -- dipanggil saat seller mengganti custom domain, supaya domain
 * lama tidak menumpuk terus di project Vercel (bisa kena limit jumlah domain).
 * Kegagalan di sini SENGAJA tidak dilempar sebagai error ke pemanggil.
 */
export async function removeVercelDomain(domain: string): Promise<void> {
  const config = getVercelApiConfig();
  if (!config) return;

  const url = withTeamQuery(
    `https://api.vercel.com/v9/projects/${config.projectId}/domains/${encodeURIComponent(domain)}`,
    config.teamId
  );

  try {
    await fetchWithTimeout(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${config.token}` },
    });
  } catch {
    // Diam -- lihat catatan di atas.
  }
}

export interface VercelDomainStatus {
  found: boolean;
  verified: boolean;
}

/**
 * Membaca status verifikasi/SSL domain langsung dari Vercel
 * (GET /v9/projects/{id}/domains/{domain}).
 */
export async function getVercelDomainStatus(domain: string): Promise<VercelDomainStatus | null> {
  const config = getVercelApiConfig();
  if (!config) return null;

  const url = withTeamQuery(
    `https://api.vercel.com/v9/projects/${config.projectId}/domains/${encodeURIComponent(domain)}`,
    config.teamId
  );

  try {
    const res = await fetchWithTimeout(url, {
      headers: { Authorization: `Bearer ${config.token}` },
    });
    if (!res.ok) return { found: false, verified: false };
    const data = await res.json();
    return { found: true, verified: Boolean(data.verified) };
  } catch {
    return null;
  }
}
