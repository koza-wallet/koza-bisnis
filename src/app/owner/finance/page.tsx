import { getOwnerUserOrNull } from "@/lib/owner-auth";
import { OwnerFinanceDashboard } from "./owner-finance-dashboard";
import { ShieldAlert } from "lucide-react";

export default async function OwnerFinancePage() {
  const owner = await getOwnerUserOrNull();

  if (!owner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F17] px-4">
        <div className="max-w-sm w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0E1420] p-8 text-center space-y-3 shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Akses Ditolak</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Halaman ini hanya untuk pemilik platform.
          </p>
        </div>
      </div>
    );
  }

  return <OwnerFinanceDashboard />;
}
