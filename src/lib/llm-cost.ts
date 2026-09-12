import { createClient as createServiceClient } from "@supabase/supabase-js";

export interface LogLLMUsageParams {
  storeId?: string | null;
  provider: "openai" | "gemini";
  model: string;
  feature: "jaga_ai_chat" | "ai_landing_page_generate";
  promptTokens: number;
  completionTokens: number;
}

/**
 * Tarif cadangan (USD per 1 juta token) kalau tabel llm_pricing_rates belum
 * di-seed atau tidak terjangkau -- diambil dari tarif publik terakhir yang
 * diketahui. Owner bisa update tarif live lewat halaman /owner/finance,
 * yang akan menimpa nilai cadangan ini.
 */
const FALLBACK_RATES: Record<"openai" | "gemini", { input: number; output: number }> = {
  openai: { input: 0.15, output: 0.6 },
  gemini: { input: 0.075, output: 0.3 },
};

/**
 * Mencatat satu panggilan LLM ke tabel llm_usage_log untuk dashboard biaya
 * pemilik platform (lihat /owner/finance). Dipanggil dari jaga-ai-llm.ts dan
 * landing-pages/generate/route.ts setiap kali OpenAI/Gemini berhasil dipanggil.
 *
 * Sengaja tidak pernah throw -- gagal mencatat biaya TIDAK BOLEH menggagalkan
 * fitur utama (chat Jaga AI / generate landing page) yang sedang dijalankan.
 */
export async function logLLMUsage(params: LogLLMUsageParams): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      console.warn("[LLM-COST] SUPABASE_SERVICE_ROLE_KEY tidak ada, usage log dilewati.");
      return;
    }

    const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

    const { data: rateRow } = await supabase
      .from("llm_pricing_rates")
      .select("input_price_per_million_usd, output_price_per_million_usd")
      .eq("provider", params.provider)
      .maybeSingle();

    const rates = rateRow
      ? {
          input: Number(rateRow.input_price_per_million_usd),
          output: Number(rateRow.output_price_per_million_usd),
        }
      : FALLBACK_RATES[params.provider];

    const estimatedCostUsd =
      (params.promptTokens / 1_000_000) * rates.input +
      (params.completionTokens / 1_000_000) * rates.output;

    const { error } = await supabase.from("llm_usage_log").insert({
      store_id: params.storeId || null,
      provider: params.provider,
      model: params.model,
      feature: params.feature,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.promptTokens + params.completionTokens,
      estimated_cost_usd: estimatedCostUsd,
    });

    if (error) {
      console.error("[LLM-COST] Gagal insert llm_usage_log:", error.message);
    }
  } catch (err) {
    console.error("[LLM-COST] Exception saat mencatat usage log:", err);
  }
}
