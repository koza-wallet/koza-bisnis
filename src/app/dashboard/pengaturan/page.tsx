"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function PengaturanRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  useEffect(() => {
    if (tab === "ai_bot") {
      router.replace("/dashboard/jaga-ai");
    } else if (tab === "domain") {
      router.replace("/dashboard/custom-domain");
    } else {
      router.replace("/dashboard/ekspedisi");
    }
  }, [router, tab]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      <p className="text-xs font-medium">Mengarahkan ke menu pengaturan...</p>
    </div>
  );
}

export default function PengaturanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    }>
      <PengaturanRedirect />
    </Suspense>
  );
}
