import { createClient } from "@/lib/supabase/server";

/**
 * Email pemilik platform KoZa Bisnis -- satu-satunya akun yang boleh mengakses
 * data finansial lintas-tenant (revenue semua toko, biaya LLM, biaya infra).
 * Sengaja hardcode (bukan flag di database) sesuai keputusan pemilik: satu
 * pemilik, paling simpel & aman untuk dikunci di kode server.
 */
const PLATFORM_OWNER_EMAIL = "novriekadito9@gmail.com";

/**
 * Mengembalikan user Supabase yang sedang login HANYA jika emailnya cocok
 * dengan pemilik platform. Dipakai di route API (`/api/owner/**`) maupun
 * server component halaman `/owner/**` sebelum data finansial dibaca/ditulis.
 */
export async function getOwnerUserOrNull() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== PLATFORM_OWNER_EMAIL) {
    return null;
  }

  return user;
}
