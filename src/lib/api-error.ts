import { NextResponse } from "next/server";

/**
 * Format kode referensi pendek yang bisa dilaporkan user ke admin,
 * sementara detail teknis asli (pesan error, stack, konteks) hanya di-log di server.
 */
function generateErrorRef(): string {
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  const randPart = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `EID-${timePart}${randPart}`;
}

/**
 * Log detail teknis error secara lengkap ke server (bukan ke client), lalu
 * kembalikan response JSON generik + errorRef yang aman ditampilkan ke user.
 *
 * `fieldName` menyesuaikan key pesan error di response (beberapa route lama
 * pakai "message", yang lain pakai "error") supaya tidak mengubah kontrak
 * yang sudah dibaca frontend.
 */
export function serverError(
  context: string,
  err: unknown,
  options?: {
    userMessage?: string;
    status?: number;
    fieldName?: "error" | "message";
    extra?: Record<string, unknown>;
  }
): NextResponse {
  const {
    userMessage = "Terjadi kesalahan pada server. Silakan coba lagi beberapa saat lagi.",
    status = 500,
    fieldName = "error",
    extra,
  } = options || {};

  const errorRef = generateErrorRef();
  const detail = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error(`[${context}] [${errorRef}]`, detail, stack || "");

  return NextResponse.json(
    { success: false, [fieldName]: userMessage, errorRef, ...extra },
    { status }
  );
}
