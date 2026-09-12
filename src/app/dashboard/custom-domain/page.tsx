"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { 
  Globe, 
  Check, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Loader2, 
  Crown, 
  Sparkles, 
  ExternalLink, 
  HelpCircle, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  Server,
  ArrowUpRight
} from "lucide-react";

export default function CustomDomainPage() {
  const { store, updateStore } = useStore();

  const isStorePro = Boolean(
    store.plan === "PRO_AI" || store.plan === "PRO_MONTHLY" || store.plan === "PRO_ANNUAL"
  );

  const [customDomainInput, setCustomDomainInput] = useState(store.customDomain || "");
  const [isDomainSaved, setIsDomainSaved] = useState(false);
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [dnsStatus, setDnsStatus] = useState<{
    configured: boolean;
    message: string;
    targetCname?: string;
    targetA?: string;
    checkedAt?: string;
    errorRef?: string;
  } | null>(null);

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleVerifyDomain = async (domainToTest?: string) => {
    const domain = (domainToTest || customDomainInput || store.customDomain || "").trim().toLowerCase();
    if (!domain) return;
    setIsCheckingDns(true);
    setDnsStatus(null);
    try {
      const res = await fetch(`/api/domain/verify?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      setDnsStatus(data);
    } catch {
      setDnsStatus({
        configured: false,
        message: "Gagal terhubung ke layanan verifikasi DNS. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsCheckingDns(false);
    }
  };

  const handleSaveDomain = () => {
    const cleaned = customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    setCustomDomainInput(cleaned);
    updateStore({ customDomain: cleaned });
    setIsDomainSaved(true);
    setTimeout(() => setIsDomainSaved(false), 4000);
    if (cleaned) {
      handleVerifyDomain(cleaned);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Custom Domain & White-Label
                </h1>
                <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 border border-amber-300 dark:border-amber-500/30 font-bold">
                  PRO
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gunakan alamat domain sendiri (misal: <strong>namatoko.com</strong>) dan hilangkan seluruh watermark KoZa dari etalase toko Anda.
          </p>
        </div>

        {isStorePro && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDomain}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Domain</span>
            </button>
          </div>
        )}
      </div>

      {/* Non-Pro Gatekeeper Card */}
      {!isStorePro ? (
        <div className="rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-100 dark:bg-amber-500/20 p-3 text-amber-600 dark:text-amber-400 shrink-0">
                <Crown className="h-8 w-8" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>Fitur Khusus Paket Pro AI</span>
                  <span className="rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-0.5 border border-amber-300 dark:border-amber-500/30 font-semibold">
                    White-Label
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                  Tingkatkan kredibilitas merek toko Anda dengan menghubungkan domain sendiri (misal: <em>tokoanda.com</em>) dan nikmati fitur branding bebas tanpa watermark KoZa.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/topup?pkg=PRO_AI"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs hover:brightness-105 active:scale-95 transition-all shadow-xs whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Upgrade ke Pro AI (Rp 329rb)</span>
            </Link>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-amber-200/60 dark:border-amber-500/20">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-amber-200/40 dark:border-amber-500/20 space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                100% White-Label
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Watermark dan branding KoZa sepenuhnya dihapus dari landing page dan keranjang.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-amber-200/40 dark:border-amber-500/20 space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-blue-600" />
                Domain & Subdomain Bebas
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gunakan domain root (brand.com) maupun subdomain khusus (shop.brand.com).
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-amber-200/40 dark:border-amber-500/20 space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Server className="h-4 w-4 text-purple-600" />
                Gratis SSL Otomatis
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sertifikat HTTPS resmi terpasang gratis tanpa perlu konfigurasi server mandiri.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* PRO ACTIVE DASHBOARD */
        <div className="space-y-6">
          {isDomainSaved && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-300">
              <Check className="h-5 w-5 shrink-0 text-emerald-600" />
              <div className="text-xs sm:text-sm font-semibold">
                Domain berhasil disimpan! Sistem sedang memproses konfigurasi SSL & DNS.
              </div>
            </div>
          )}

          {/* Domain Setup Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-7 space-y-6 shadow-xs">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Konfigurasi Domain Toko Anda</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arahkan domain atau subdomain Anda ke server KoZa untuk memperkuat kredibilitas merek toko Anda.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Nama Domain atau Subdomain:
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customDomainInput}
                    onChange={(e) => setCustomDomainInput(e.target.value)}
                    placeholder="misal: belanja.tokoberkah.com atau tokoku.com"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                  {customDomainInput && (
                    <span className="absolute right-3 top-3 text-[11px] font-mono text-slate-400">
                      https://{customDomainInput.trim().toLowerCase().replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveDomain}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-bold text-white transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyDomain()}
                    disabled={isCheckingDns || !customDomainInput.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                  >
                    {isCheckingDns ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                        <span>Mengecek...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Cek DNS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* DNS Diagnostic Result */}
            {dnsStatus && (
              <div
                className={`rounded-2xl border p-4 sm:p-5 space-y-3 animate-in fade-in duration-300 ${
                  dnsStatus.configured
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-500/40 dark:text-emerald-200"
                    : "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-500/40 dark:text-amber-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {dnsStatus.configured ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-emerald-800 dark:text-emerald-300">Domain Terhubung & Siap Digunakan!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="text-amber-800 dark:text-amber-300">DNS Belum Terhubung / Sedang Masa Propagasi</span>
                      </>
                    )}
                  </div>
                  {dnsStatus.configured && (
                    <a
                      href={`https://${customDomainInput.trim().toLowerCase()}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>Buka Toko</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {dnsStatus.message}
                  {dnsStatus.errorRef && ` (Kode Referensi: ${dnsStatus.errorRef})`}
                </p>
                {dnsStatus.checkedAt && (
                  <p className="text-[10px] text-slate-400">
                    Dicek terakhir: {new Date(dnsStatus.checkedAt).toLocaleTimeString("id-ID")} WIB
                  </p>
                )}
              </div>
            )}

            {/* DNS Target Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Data Rekord DNS yang Harus Diinput:
                </span>
                <span className="text-[11px] text-slate-400">
                  Tipe Rekord: CNAME
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Host / Nama Rekord</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      @ (atau nama subdomain)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText("@", "host")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Salin Host"
                  >
                    {copiedField === "host" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target / Nilai CNAME</span>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      cname.kozabisnis.com
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText("cname.kozabisnis.com", "target")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Salin Target"
                  >
                    {copiedField === "target" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step-by-step Setup Guide */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Panduan Pengaturan DNS di Provider Domain:</span>
              </div>
              <div className="space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  1. Masuk ke panel kontrol tempat Anda membeli domain (misal: <strong>Niagahoster, Domainesia, Rumahweb, Cloudflare, Namecheap</strong>).
                </p>
                <p>
                  2. Buka menu <strong>DNS Management</strong> atau <strong>Zone Editor</strong> pada domain yang ingin digunakan.
                </p>
                <p>
                  3. Tambahkan rekord baru:
                </p>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 font-mono text-emerald-700 dark:text-emerald-300 space-y-1">
                  <div>Type: <strong>CNAME</strong></div>
                  <div>Host / Name: <strong>@</strong> (untuk domain utama) atau <strong>belanja</strong> (untuk subdomain belanja.domain.com)</div>
                  <div>Target / Value: <strong>cname.kozabisnis.com</strong></div>
                  <div>TTL: <strong>Auto</strong> atau <strong>3600</strong></div>
                </div>
                <p>
                  4. Simpan perubahan DNS. Propagasi DNS umumnya berlangsung 15 menit hingga maksimal 24 jam tergantung penyedia domain Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
