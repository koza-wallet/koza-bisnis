"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error untuk monitoring (siap dihubungkan ke Sentry / Vercel Analytics)
    console.error("Unhandled runtime error captured by KoZa error boundary:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Terjadi Kendala Teknis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Sistem kami mengalami gangguan sementara saat memproses halaman ini. Data Anda tetap aman.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500 pt-1">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-600">
        KoZa Bisnis • Solusi Bio Link & Pembukuan UMKM
      </div>
    </div>
  );
}
