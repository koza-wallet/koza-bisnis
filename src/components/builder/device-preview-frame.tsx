"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Merender children di dalam <iframe> dengan lebar CSS sungguhan, supaya breakpoint
// responsive Tailwind (sm:/md:/lg:/xl:) dihitung terhadap lebar device yang disimulasikan,
// bukan lebar browser asli tempat Builder ini dibuka. Tanpa ini, preview "Mobile/Tablet"
// cuma mengecilkan KOTAK secara visual sementara konten di dalamnya tetap merender versi
// desktop (font & layout desktop dipaksa masuk kotak sempit -> teks pecah huruf/keluar frame).
export function DevicePreviewFrame({
  width,
  isDark,
  className,
  children,
}: {
  width: number;
  isDark: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeObserver: ResizeObserver | null = null;

    const setup = () => {
      const doc = iframe.contentDocument;
      if (!doc || !doc.body) return;

      doc.head.querySelectorAll("[data-copied-style]").forEach((node) => node.remove());
      document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-copied-style", "true");
        doc.head.appendChild(clone);
      });

      doc.documentElement.className = isDark ? "dark" : "";
      doc.body.style.margin = "0";

      setMountNode(doc.body);

      resizeObserver = new ResizeObserver(() => {
        setHeight(doc.body.scrollHeight);
      });
      resizeObserver.observe(doc.body);
    };

    if (iframe.contentDocument?.readyState === "complete") {
      setup();
    }
    iframe.addEventListener("load", setup);

    return () => {
      iframe.removeEventListener("load", setup);
      resizeObserver?.disconnect();
    };
  }, [isDark]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Simulasi Tampilan Device"
        src="about:blank"
        className={className}
        style={{ width, height, border: "none", display: "block" }}
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  );
}
