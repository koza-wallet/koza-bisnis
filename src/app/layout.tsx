import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KoZa Bisnis — Toko Online Mikro & Buku Kas Otomatis",
  description: "Bikin toko online ber-QRIS dalam 30 detik dari HP, bebas potongan fee marketplace, hitung ongkir otomatis, dan pembukuan laba bersih seketika.",
  icons: {
    icon: [
      { url: "/brand/koza-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/koza-icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/koza-icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/brand/koza-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
