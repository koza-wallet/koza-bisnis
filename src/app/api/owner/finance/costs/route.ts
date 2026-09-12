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
    const {
      month, // format "YYYY-MM-01"
      vercelCostIdr,
      domainCostIdr,
      cloudflareCostIdr,
      supabaseCostIdr,
      otherCostIdr,
      usdIdrRate,
      notes,
    } = body;

    if (!month || !/^\d{4}-\d{2}-01$/.test(month)) {
      return NextResponse.json(
        { success: false, error: "Format bulan tidak valid (harus YYYY-MM-01)." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return serverError(
        "API-OWNER-FINANCE-COSTS-SAVE",
        new Error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server."),
        { userMessage: "Gagal menyimpan biaya. Silakan coba lagi." }
      );
    }

    const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from("platform_operating_costs").upsert(
      {
        month,
        vercel_cost_idr: Number(vercelCostIdr) || 0,
        domain_cost_idr: Number(domainCostIdr) || 0,
        cloudflare_cost_idr: Number(cloudflareCostIdr) || 0,
        supabase_cost_idr: Number(supabaseCostIdr) || 0,
        other_cost_idr: Number(otherCostIdr) || 0,
        usd_idr_rate: Number(usdIdrRate) || 15800,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "month" }
    );

    if (error) {
      return serverError("API-OWNER-FINANCE-COSTS-SAVE", new Error(error.message), {
        userMessage: "Gagal menyimpan biaya infrastruktur.",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return serverError("API-OWNER-FINANCE-COSTS-SAVE", err, {
      userMessage: "Gagal menyimpan biaya. Silakan coba lagi.",
    });
  }
}
