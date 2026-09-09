"use client";

import React from "react";
import { StoreProvider } from "@/lib/store-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
