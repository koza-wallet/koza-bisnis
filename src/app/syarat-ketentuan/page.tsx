import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Scale, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Syarat & Ketentuan | KoZa Bisnis",
  description: "Syarat dan Ketentuan Layanan Platform KoZa Bisnis.",
};

export default function SyaratKetentuanPage() {
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
            <Scale className="h-3.5 w-3.5" />
            <span>Perjanjian Layanan Pengguna</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Terakhir diperbarui: 10 September 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Selamat datang di <strong className="text-white">KoZa Bisnis</strong>. Dokumen ini mengatur hak, kewajiban, dan tata tertib penggunaan platform toko online bio link, landing page, dan sistem pembukuan usaha yang disediakan oleh KoZa Bisnis. Dengan mendaftar, menggunakan, atau berbelanja di ekosistem kami, Anda menyatakan menyetujui seluruh ketentuan ini.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              1. Akun Penjual & Keamanan
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Penjual wajib mengisi data identitas yang akurat dan sah saat mendaftar akun KoZa Bisnis.</li>
              <li>Penjual bertanggung jawab penuh menjaga kerahasiaan kata sandi dan akses akun masing-masing.</li>
              <li>Satu akun hanya berhak mengelola toko yang didaftarkan secara sah sesuai kuota dan paket yang dipilih.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              2. Ketentuan Kuota Order & Pembayaran Platform
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li><strong className="text-slate-200">Kuota Order</strong>: Pemrosesan transaksi checkout di storefront membutuhkan saldo kuota order yang mencukupi. Kuota berkurang setiap pesanan berhasil dibuat.</li>
              <li><strong className="text-slate-200">Paket Pro & Top-up</strong>: Pembelian paket membership Pro dan top-up kuota order diproses melalui gateway resmi (Midtrans) secara otomatis.</li>
              <li><strong className="text-slate-200">Kebijakan Pengembalian (Refund)</strong>: Kuota order dan masa aktif membership yang telah sukses terverifikasi dan ditambahkan ke akun tidak dapat diuangkan kembali (non-refundable), kecuali terjadi kegagalan sistem yang dapat dibuktikan secara teknis.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              3. Larangan Konten & Produk Terlarang
            </h2>
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs sm:text-sm">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Larangan Keras Penjualan Barang Ilegal</span>
              </div>
              <p className="text-slate-400 text-xs">
                Penjual dilarang keras menjual barang terlarang hukum Republik Indonesia, termasuk namun tidak terbatas pada: narkotika, psikotropika, senjata tajam/api tanpa izin, obat-obatan tanpa izin BPOM, barang tiruan/palsu (KW) yang melanggar hak cipta, barang hasil pencurian, serta konten pornografi. Toko yang melanggar akan dibekukan secara permanen tanpa kompensasi.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              4. Transaksi & Tanggung Jawab Pengiriman Barang
            </h2>
            <p>
              KoZa Bisnis bertindak sebagai penyedia infrastruktur perangkat lunak (*software-as-a-service*). Hubungan jual-beli barang fisik terjadi secara langsung antara Penjual dan Pembeli:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
              <li>Penjual bertanggung jawab penuh atas ketersediaan stok, kesesuaian deskripsi produk, kualitas barang, dan proses pengemasan serta pengiriman via ekspedisi.</li>
              <li>Pembeli bertanggung jawab memastikan nomor kontak WhatsApp dan alamat penerima lengkap dan valid saat memesan.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              5. Batasan Tanggung Jawab
            </h2>
            <p>
              KoZa Bisnis selalu berusaha menjaga keandalan sistem selama 24 jam sehari, 7 hari seminggu. Namun, kami tidak bertanggung jawab atas kerugian tidak langsung yang diakibatkan oleh gangguan jaringan telekomunikasi pihak ketiga, kendala teknis ekspedisi pengiriman, atau kelalaian penjual dalam mengonfirmasi pesanan pembeli.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              6. Perubahan Ketentuan
            </h2>
            <p>
              KoZa Bisnis berhak memperbarui Syarat & Ketentuan ini sewaktu-waktu. Setiap perubahan material akan diinformasikan melalui situs web atau pemberitahuan di dashboard penjual.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} KoZa Bisnis. Hak cipta dilindungi.</div>
          <div className="flex items-center gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-slate-300 transition-colors">
              Kebijakan Privasi
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
