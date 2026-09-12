"use client";

import { useEffect, useState, useCallback } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Server,
  Loader2,
  AlertCircle,
  Save,
  Bot,
  Wallet,
  RefreshCw,
} from "lucide-react";

interface MonthRow {
  month: string;
  revenueIdr: number;
  llmCostUsd: number;
  llmCallCount: number;
  llmCostIdr: number;
  infraCostIdr: number;
  totalCostIdr: number;
  usdIdrRate: number;
  grossMarginIdr: number;
  grossMarginPct: number;
  netProfitIdr: number;
  netProfitPct: number;
  infraCostDetail: {
    vercel: number;
    domain: number;
    cloudflare: number;
    supabase: number;
    other: number;
    notes: string | null;
  } | null;
}

interface PricingRate {
  provider: "openai" | "gemini";
  model: string;
  input_price_per_million_usd: number;
  output_price_per_million_usd: number;
}

function formatMonthLabel(monthStr: string): string {
  const d = new Date(monthStr + "T00:00:00Z");
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function OwnerFinanceDashboard() {
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [pricingRates, setPricingRates] = useState<PricingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [costForm, setCostForm] = useState({
    vercelCostIdr: "",
    domainCostIdr: "",
    cloudflareCostIdr: "",
    supabaseCostIdr: "",
    otherCostIdr: "",
    usdIdrRate: "15800",
    notes: "",
  });
  const [isSavingCosts, setIsSavingCosts] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/owner/finance");
      const data = await res.json();
      if (!res.ok || !data.success) {
        const suffix = data.errorRef ? ` (Kode Referensi: ${data.errorRef})` : "";
        setLoadError((data.error || "Gagal memuat data.") + suffix);
        return;
      }
      setMonths(data.months || []);
      setPricingRates(data.pricingRates || []);

      const current = (data.months || []).find((m: MonthRow) => m.month === currentMonthKey());
      if (current?.infraCostDetail) {
        setCostForm({
          vercelCostIdr: String(current.infraCostDetail.vercel || ""),
          domainCostIdr: String(current.infraCostDetail.domain || ""),
          cloudflareCostIdr: String(current.infraCostDetail.cloudflare || ""),
          supabaseCostIdr: String(current.infraCostDetail.supabase || ""),
          otherCostIdr: String(current.infraCostDetail.other || ""),
          usdIdrRate: String(current.usdIdrRate || 15800),
          notes: current.infraCostDetail.notes || "",
        });
      }
    } catch {
      setLoadError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveCosts = async () => {
    setIsSavingCosts(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/owner/finance/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          ...costForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const suffix = data.errorRef ? ` (Kode Referensi: ${data.errorRef})` : "";
        setSaveMessage((data.error || "Gagal menyimpan.") + suffix);
        return;
      }
      setSaveMessage("Biaya bulan ini berhasil disimpan.");
      await fetchData();
    } catch {
      setSaveMessage("Gagal terhubung ke server.");
    } finally {
      setIsSavingCosts(false);
    }
  };

  const handleUpdatePricing = async (provider: "openai" | "gemini", input: number, output: number) => {
    try {
      await fetch("/api/owner/finance/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          inputPricePerMillionUsd: input,
          outputPricePerMillionUsd: output,
        }),
      });
      await fetchData();
    } catch {
      // Diam -- pricingRates di state tetap seperti sebelumnya, tidak menutupi input user
    }
  };

  const latest = months[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] px-4 py-8 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Dashboard Finansial Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Revenue, biaya LLM otomatis, biaya infrastruktur, dan margin — lintas semua toko.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {loadError && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Ringkasan Bulan Terbaru */}
        {latest && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Wallet className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(latest.revenueIdr)}</p>
              <p className="text-[11px] text-slate-400">{formatMonthLabel(latest.month)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Bot className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Biaya LLM</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(latest.llmCostIdr)}</p>
              <p className="text-[11px] text-slate-400">
                ${latest.llmCostUsd.toFixed(4)} · {latest.llmCallCount}x panggilan
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Server className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Biaya Infra</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(latest.infraCostIdr)}</p>
              <p className="text-[11px] text-slate-400">Vercel, Domain, Cloudflare, Supabase, dll</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                {latest.netProfitIdr >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                <span className="text-[11px] font-bold uppercase tracking-wider">Net Profit</span>
              </div>
              <p className={`text-lg font-bold ${latest.netProfitIdr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatRupiah(latest.netProfitIdr)}
              </p>
              <p className="text-[11px] text-slate-400">Margin {latest.netProfitPct.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {latest && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Gross Margin (Revenue − Biaya LLM)</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatRupiah(latest.grossMarginIdr)} ({latest.grossMarginPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        )}

        {/* Form Biaya Infra Bulanan */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Input Biaya Infrastruktur Bulanan
            </h2>
            <input
              type="month"
              value={selectedMonth.slice(0, 7)}
              onChange={(e) => setSelectedMonth(e.target.value + "-01")}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "vercelCostIdr", label: "Vercel" },
              { key: "domainCostIdr", label: "Domain" },
              { key: "cloudflareCostIdr", label: "Cloudflare" },
              { key: "supabaseCostIdr", label: "Supabase" },
              { key: "otherCostIdr", label: "Lainnya" },
              { key: "usdIdrRate", label: "Kurs USD→IDR" },
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{field.label}</label>
                <input
                  type="number"
                  value={(costForm as any)[field.key]}
                  onChange={(e) => setCostForm({ ...costForm, [field.key]: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Catatan (opsional)</label>
            <input
              type="text"
              value={costForm.notes}
              onChange={(e) => setCostForm({ ...costForm, notes: e.target.value })}
              placeholder="Contoh: Vercel Pro plan, domain renewal tahunan dibagi 12"
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {saveMessage && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{saveMessage}</p>
          )}

          <button
            onClick={handleSaveCosts}
            disabled={isSavingCosts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isSavingCosts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Simpan Biaya Bulan Ini</span>
          </button>
        </div>

        {/* Tarif Harga LLM */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Tarif Harga LLM (per 1 juta token, USD)
          </h2>
          <p className="text-[11px] text-slate-400">
            Update manual kalau OpenAI/Gemini mengubah harga -- sistem tidak bisa cek tarif live otomatis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pricingRates.map((rate) => (
              <PricingRateEditor key={rate.provider} rate={rate} onSave={handleUpdatePricing} />
            ))}
          </div>
        </div>

        {/* Riwayat Bulanan */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Riwayat Bulanan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2 pr-3">Bulan</th>
                  <th className="py-2 pr-3">Revenue</th>
                  <th className="py-2 pr-3">Biaya LLM</th>
                  <th className="py-2 pr-3">Biaya Infra</th>
                  <th className="py-2 pr-3">Gross Margin</th>
                  <th className="py-2 pr-3">Net Profit</th>
                  <th className="py-2 pr-3">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {months.map((m) => (
                  <tr key={m.month}>
                    <td className="py-2 pr-3 text-slate-900 dark:text-white font-medium whitespace-nowrap">
                      {formatMonthLabel(m.month)}
                    </td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{formatRupiah(m.revenueIdr)}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{formatRupiah(m.llmCostIdr)}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{formatRupiah(m.infraCostIdr)}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">
                      {formatRupiah(m.grossMarginIdr)} ({m.grossMarginPct.toFixed(1)}%)
                    </td>
                    <td className={`py-2 pr-3 font-semibold ${m.netProfitIdr >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {formatRupiah(m.netProfitIdr)}
                    </td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{m.netProfitPct.toFixed(1)}%</td>
                  </tr>
                ))}
                {months.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      Belum ada data. Data akan muncul setelah ada transaksi SETTLED atau pemakaian LLM.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingRateEditor({
  rate,
  onSave,
}: {
  rate: PricingRate;
  onSave: (provider: "openai" | "gemini", input: number, output: number) => void;
}) {
  const [input, setInput] = useState(String(rate.input_price_per_million_usd));
  const [output, setOutput] = useState(String(rate.output_price_per_million_usd));

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 p-3 space-y-2">
      <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">
        {rate.provider} ({rate.model})
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-400">Input</label>
          <input
            type="number"
            step="0.001"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1420] px-2 py-1 text-xs text-slate-900 dark:text-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400">Output</label>
          <input
            type="number"
            step="0.001"
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0E1420] px-2 py-1 text-xs text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>
      <button
        onClick={() => onSave(rate.provider, Number(input), Number(output))}
        className="w-full text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
      >
        Simpan Tarif
      </button>
    </div>
  );
}
