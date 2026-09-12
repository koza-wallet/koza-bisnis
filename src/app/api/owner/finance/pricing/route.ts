import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getOwnerUserOrNull } from "@/lib/owner-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const owner = await getOwnerUserOrNull();
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { provider, inputPricePerMillionUsd, outputPricePerMillionUsd } = body;

    if (provider !== "openai" && provider !== "gemini") {
      return NextResponse.json(
        { success: false, error: "Provider harus 'openai' atau 'gemini'." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return serverError(
        "API-OWNER-FINANCE-PRICING-SAVE",
        new Error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server."),
        { userMessage: "Gagal menyimpan tarif. Silakan coba lagi." }
      );
    }

    const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("llm_pricing_rates")
      .update({
        input_price_per_million_usd: Number(inputPricePerMillionUsd),
        output_price_per_million_usd: Number(outputPricePerMillionUsd),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", provider);

    if (error) {
      return serverError("API-OWNER-FINANCE-PRICING-SAVE", new Error(error.message), {
        userMessage: "Gagal menyimpan tarif LLM.",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return serverError("API-OWNER-FINANCE-PRICING-SAVE", err, {
      userMessage: "Gagal menyimpan tarif. Silakan coba lagi.",
    });
  }
}
