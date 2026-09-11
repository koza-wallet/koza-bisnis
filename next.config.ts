import type { NextConfig } from "next";

// Daftar origin eksternal yang benar-benar dipakai aplikasi (Meta/TikTok Pixel,
// Midtrans Snap, Supabase, Gemini) — dasar penyusunan Content-Security-Policy di bawah.
// Next.js Fast Refresh (dev mode) butuh eval() untuk hot-reload — hanya
// diizinkan saat development, production tetap strict tanpa 'unsafe-eval'.
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://connect.facebook.net https://analytics.tiktok.com https://app.midtrans.com https://app.sandbox.midtrans.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.midtrans.com https://api.sandbox.midtrans.com https://app.midtrans.com https://app.sandbox.midtrans.com https://www.facebook.com https://analytics.tiktok.com",
  "frame-src https://app.midtrans.com https://app.sandbox.midtrans.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Allow phone testing on local network Wi-Fi without HMR cross-origin warnings
  allowedDevOrigins: ["10.166.152.36", "localhost:3005", "127.0.0.1:3005"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
