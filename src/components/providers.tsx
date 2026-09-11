import React from "react";
import { StoreProvider } from "@/lib/store-context";
import { ThemeProvider } from "@/lib/theme-context";
import { PrivacyProvider } from "@/lib/privacy-context";
import { SidebarProvider } from "@/lib/sidebar-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PrivacyProvider>
        <SidebarProvider>
          <StoreProvider>{children}</StoreProvider>
        </SidebarProvider>
      </PrivacyProvider>
    </ThemeProvider>
  );
}
