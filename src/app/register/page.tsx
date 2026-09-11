"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Lock, Mail, AlertCircle, Store, Phone, CheckCircle2, ArrowLeft, Check } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [storeName, setStoreName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal harus 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            store_name: storeName,
            whatsapp_number: whatsappNumber,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || "Pendaftaran tidak dapat diproses. Silakan periksa kembali data Anda.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setIsSuccess(true);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kendala saat menghubungi server pendaftaran.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors">
      <div className="w-full max-w-md space-y-7">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Brand Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-block group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/koza-logo.svg"
              alt="KoZa Bisnis"
              className="h-9 w-auto object-contain block dark:hidden transition-transform group-hover:scale-105"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/koza-logo-white.svg"
              alt="KoZa Bisnis"
              className="h-9 w-auto object-contain hidden dark:block transition-transform group-hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white pt-1">
            Buka Toko Mandiri Anda
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Daftar dalam 30 detik. Gratis kuota 10 pesanan pertama tanpa biaya langganan bulanan.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 p-6 sm:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Kami telah mengirimkan tautan konfirmasi ke <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{email}</span>.
                Silakan periksa kotak masuk/spam email Anda untuk mengaktifkan akun toko.
              </p>
              <Link
                href="/login"
                className="inline-block px-5 py-2.5 mt-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-xs font-bold hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-sm"
              >
                Ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Toko Anda <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: Hijab Cantik Official"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp Bisnis <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Login <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@tokoanda.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi <span className="text-emerald-600 dark:text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Value checks */}
              <div className="pt-1 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Gratis 10 kuota order pertama untuk mencoba</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Tanpa biaya sewa bulanan di paket Non-Pro</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span>Menyiapkan Toko Anda...</span>
                ) : (
                  <>
                    <span>Daftar Toko Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sudah memiliki akun toko?{" "}
              <Link
                href="/login"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline underline-offset-4"
              >
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>

        {/* Security and Terms note */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/syarat-ketentuan" className="underline text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            Syarat & Ketentuan
          </Link>{" "}
          serta{" "}
          <Link href="/kebijakan-privasi" className="underline text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            Kebijakan Privasi
          </Link>{" "}
          KoZa Bisnis.
        </p>
      </div>
    </div>
  );
}
