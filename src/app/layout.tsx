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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
