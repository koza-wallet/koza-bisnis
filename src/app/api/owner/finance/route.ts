import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getOwnerUserOrNull } from "@/lib/owner-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export async function GET() {
  try {
    const owner = await getOwnerUserOrNull();
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return serverError(
        "API-OWNER-FINANCE",
        new Error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server."),
        { userMessage: "Gagal memuat data finansial. Silakan coba lagi." }
      );
    }

    const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

    // 0. Cari toko milik akun pemilik platform sendiri -- pembelian dari toko ini
    // (mis. testing upgrade Pro) TIDAK dihitung sebagai revenue asli, supaya angka
    // tidak ambigu antara transaksi customer sungguhan vs testing pemilik sendiri.
    const { data: ownStores } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", owner.id);

    const ownStoreIds = (ownStores || []).map((s) => s.id);

    // 1. Revenue nyata lintas semua toko customer (toko milik pemilik platform dikecualikan)
    let settledTxQuery = supabase
      .from("topup_transactions")
      .select("amount, created_at, store_id")
      .eq("status", "SETTLED")
      .order("created_at", { ascending: true });

    if (ownStoreIds.length > 0) {
      settledTxQuery = settledTxQuery.not("store_id", "in", `(${ownStoreIds.join(",")})`);
    }

    const { data: settledTx, error: txErr } = await settledTxQuery;

    if (txErr) {
      return serverError("API-OWNER-FINANCE-TX", new Error(txErr.message), {
        userMessage: "Gagal memuat data revenue.",
      });
    }

    // 2. Biaya LLM otomatis dari log pemakaian
    const { data: usageRows, error: usageErr } = await supabase
      .from("llm_usage_log")
      .select("estimated_cost_usd, provider, created_at")
      .order("created_at", { ascending: true });

    if (usageErr) {
      return serverError("API-OWNER-FINANCE-USAGE", new Error(usageErr.message), {
        userMessage: "Gagal memuat data biaya LLM.",
      });
    }

    // 3. Biaya infra manual per bulan
    const { data: costRows, error: costErr } = await supabase
      .from("platform_operating_costs")
      .select("*")
      .order("month", { ascending: true });

    if (costErr) {
      return serverError("API-OWNER-FINANCE-COSTS", new Error(costErr.message), {
        userMessage: "Gagal memuat data biaya infrastruktur.",
      });
    }

    // 4. Tarif harga LLM saat ini (untuk ditampilkan/diedit di UI)
    const { data: pricingRows } = await supabase
      .from("llm_pricing_rates")
      .select("*");

    // Gabungkan semuanya per bulan (YYYY-MM-01)
    const monthly: Record<
      string,
      {
        month: string;
        revenueIdr: number;
        llmCostUsd: number;
        llmCallCount: number;
      }
    > = {};

    for (const tx of settledTx || []) {
      const key = monthKey(tx.created_at);
      if (!monthly[key]) monthly[key] = { month: key, revenueIdr: 0, llmCostUsd: 0, llmCallCount: 0 };
      monthly[key].revenueIdr += Number(tx.amount) || 0;
    }

    for (const u of usageRows || []) {
      const key = monthKey(u.created_at);
      if (!monthly[key]) monthly[key] = { month: key, revenueIdr: 0, llmCostUsd: 0, llmCallCount: 0 };
      monthly[key].llmCostUsd += Number(u.estimated_cost_usd) || 0;
      monthly[key].llmCallCount += 1;
    }

    const costsByMonth = new Map((costRows || []).map((c) => [c.month, c]));

    const allMonthKeys = Array.from(
      new Set([...Object.keys(monthly), ...(costRows || []).map((c) => c.month)])
    ).sort();

    const lastKnownRate =
      (costRows && costRows.length > 0
        ? Number(costRows[costRows.length - 1].usd_idr_rate)
        : undefined) || 15800;

    const result = allMonthKeys.map((key) => {
      const m = monthly[key] || { month: key, revenueIdr: 0, llmCostUsd: 0, llmCallCount: 0 };
      const costRow = costsByMonth.get(key);
      const usdIdrRate = costRow ? Number(costRow.usd_idr_rate) : lastKnownRate;
      const llmCostIdr = m.llmCostUsd * usdIdrRate;
      const infraCostIdr = costRow
        ? Number(costRow.vercel_cost_idr) +
          Number(costRow.domain_cost_idr) +
          Number(costRow.cloudflare_cost_idr) +
          Number(costRow.supabase_cost_idr) +
          Number(costRow.other_cost_idr)
        : 0;
      const totalCostIdr = llmCostIdr + infraCostIdr;
      const grossMarginIdr = m.revenueIdr - llmCostIdr;
      const netProfitIdr = m.revenueIdr - totalCostIdr;

      return {
        month: key,
        revenueIdr: m.revenueIdr,
        llmCostUsd: m.llmCostUsd,
        llmCallCount: m.llmCallCount,
        llmCostIdr,
        infraCostIdr,
        totalCostIdr,
        usdIdrRate,
        grossMarginIdr,
        grossMarginPct: m.revenueIdr > 0 ? (grossMarginIdr / m.revenueIdr) * 100 : 0,
        netProfitIdr,
        netProfitPct: m.revenueIdr > 0 ? (netProfitIdr / m.revenueIdr) * 100 : 0,
        infraCostDetail: costRow
          ? {
              vercel: Number(costRow.vercel_cost_idr),
              domain: Number(costRow.domain_cost_idr),
              cloudflare: Number(costRow.cloudflare_cost_idr),
              supabase: Number(costRow.supabase_cost_idr),
              other: Number(costRow.other_cost_idr),
              notes: costRow.notes,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      months: result.reverse(), // terbaru duluan
      pricingRates: pricingRows || [],
    });
  } catch (err: unknown) {
    return serverError("API-OWNER-FINANCE", err, {
      userMessage: "Gagal memuat dashboard finansial. Silakan coba lagi.",
    });
  }
}
