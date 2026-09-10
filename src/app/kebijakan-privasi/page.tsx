import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, UserCheck, EyeOff, FileText } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | KoZa Bisnis",
  description: "Kebijakan Privasi dan Perlindungan Data Pribadi (PII) Pengguna KoZa Bisnis.",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">K</div>
            <span className="font-bold text-sm text-slate-200">KoZa Bisnis</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Kepatuhan & Perlindungan Data Pribadi (UU PDP)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Kebijakan Privasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Terakhir diperbarui: 10 September 2026
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Lock className="h-5 w-5 shrink-0" />
            <span>Komitmen Privasi KoZa Bisnis</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            KoZa Bisnis berkomitmen penuh melindungi privasi pengguna platform (penjual) dan konsumen pembeli di toko binaan kami. Kami menjunjung tinggi prinsip integritas data, transparansi, serta memastikan data pribadi (PII) hanya diproses untuk pemenuhan transaksi jual-beli yang sah.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              1. Data Pribadi yang Kami Kumpulkan
            </h2>
            <p>
              Saat pembeli melakukan pesanan melalui halaman toko online (bio link) atau landing page penjual di KoZa Bisnis, sistem mencatat data berikut:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong className="text-slate-200">Nama Lengkap Pembeli</strong>: Digunakan untuk identifikasi penerima pesanan.</li>
              <li><strong className="text-slate-200">Nomor WhatsApp / Telepon</strong>: Digunakan untuk konfirmasi otomatis pesanan dan koordinasi kurir pengiriman.</li>
              <li><strong className="text-slate-200">Alamat Pengiriman (Kota, Kecamatan, Alamat Lengkap)</strong>: Digunakan untuk estimasi ongkos kirim dan pengantaran barang fisik oleh jasa ekspedisi.</li>
              <li><strong className="text-slate-200">Detail Pesanan & Bukti Pembayaran</strong>: Daftar produk yang dibeli, kuantitas, nominal pembayaran, dan metode transaksi.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              2. Tujuan Pemrosesan Data
            </h2>
            <p>
              Data pembeli disimpan dan diproses secara eksklusif untuk:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Memungkinkan penjual mengonfirmasi pesanan melalui pesan WhatsApp otomatis atau manual.</li>
              <li>Membuat label pengiriman paket ekspedisi kurir yang dipilih oleh pembeli.</li>
              <li>Pencatatan pembukuan keuangan dan rekap transaksi operasional toko penjual.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              3. Larangan Penjualan Data & Pihak Ketiga
            </h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
                <EyeOff className="h-4 w-4 text-emerald-400" />
                <span>Tanpa Penjualan Data atau Monetisasi Pihak Ketiga</span>
              </div>
              <p className="text-slate-400 text-xs">
                KoZa Bisnis <strong className="text-slate-200">tidak pernah dan tidak akan pernah</strong> menjual, menyewakan, membagikan, atau memperdagangkan data pribadi pembeli maupun penjual kepada pihak ketiga manapun untuk tujuan periklanan atau pemasaran eksternal.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              4. Keamanan & Isolasi Data Multi-Tenant
            </h2>
            <p>
              Kami menerapkan standar keamanan berlapis untuk melindungi data yang tersimpan di sistem kami:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong className="text-slate-200">Row Level Security (RLS)</strong>: Database kami mengisolasi data antar toko secara ketat di tingkat basis data. Penjual Toko A secara teknis tidak dapat melihat data transaksi milik Penjual Toko B.</li>
              <li><strong className="text-slate-200">Enkripsi In-Transit (SSL/TLS)</strong>: Seluruh komunikasi antara browser dan server dienkripsi menggunakan protokol HTTPS standar perbankan.</li>
              <li><strong className="text-slate-200">Sanitasi & Validasi Server-Side</strong>: Seluruh input data pembeli disanitasi dari potensi serangan injeksi kode berbahaya (Stored XSS / SQL Injection).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              5. Hak Pemilik Data Pribadi
            </h2>
            <p>
              Sesuai ketentuan perundang-undangan perlindungan data pribadi di Indonesia (UU PDP), pemilik data memiliki hak untuk:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Meminta konfirmasi atau akses terhadap data pribadi yang tersimpan.</li>
              <li>Meminta pembetulan atau perbaikan informasi data jika terjadi kesalahan pencatatan.</li>
              <li>Meminta penghapusan data pesanan setelah masa retensi transaksi pembukuan selesai.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              6. Hubungi Kami
            </h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau ingin mengajukan permohonan terkait data pribadi Anda, silakan hubungi tim kami melalui email resmi: <span className="text-emerald-400 font-mono">support@kozabisnis.com</span>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} KoZa Bisnis. Hak cipta dilindungi.</div>
          <div className="flex items-center gap-4">
            <Link href="/syarat-ketentuan" className="hover:text-slate-300 transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Beranda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
