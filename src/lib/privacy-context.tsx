"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PrivacyContextType {
  isPrivacyActive: boolean;
  togglePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivacyActive, setIsPrivacyActive] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("koza_privacy_shield");
      if (saved === "true") {
        setIsPrivacyActive(true);
        document.body.classList.add("privacy-active");
      }
    } catch (e) {}
  }, []);

  const togglePrivacy = () => {
    setIsPrivacyActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("koza_privacy_shield", String(next));
      } catch (e) {}
      if (next) {
        document.body.classList.add("privacy-active");
      } else {
        document.body.classList.remove("privacy-active");
      }
      return next;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyActive, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    return { isPrivacyActive: false, togglePrivacy: () => {} };
  }
  return context;
}
