import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Alfabet tanpa karakter mirip (0/O, 1/I) supaya tetap mudah dibaca/diketik pembeli
const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  // 8 karakter acak dari alfabet 32-simbol (~32^8 kombinasi) — mencegah
  // order_number ditebak/brute-force (format lama hanya 4 digit = 9.000 kombinasi).
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const suffix = Array.from(bytes, (b) => ORDER_NUMBER_ALPHABET[b % ORDER_NUMBER_ALPHABET.length]).join("");

  return `KZ-${year}${month}-${suffix}`;
}
