"use client";

import Script from "next/script";

interface PixelTrackerProps {
  metaPixelId?: string;
  tiktokPixelId?: string;
  gtmId?: string;
  // Dikirim sekali di halaman produk untuk ViewContent — landing page 1-produk,
  // jadi "lihat halaman" = "lihat konten produk itu".
  viewContent?: {
    title: string;
    value: number;
    currency?: string;
  };
}

const META_ID_PATTERN = /^\d{10,20}$/;
const TIKTOK_ID_PATTERN = /^[A-Za-z0-9]{15,25}$/;
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,10}$/i;

// Semua field ID mendukung lebih dari 1 sekaligus (dipisah koma) — kasus umum
// toko + agency iklan sama-sama pasang pixel/container di halaman yang sama.
function parseIds(raw: string | undefined, pattern: RegExp): string[] {
  if (!raw) return [];
  return Array.from(new Set(raw.split(",").map((id) => id.trim()).filter((id) => pattern.test(id))));
}

// Product title berasal dari input seller (bisa berisi tanda kutip/HTML) dan
// nilainya di-embed mentah ke dalam inline <script>, jadi harus di-escape supaya
// tidak bisa menutup tag <script> lebih awal (mini stored-XSS vector).
function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function PixelTracker({ metaPixelId, tiktokPixelId, gtmId, viewContent }: PixelTrackerProps) {
  const metaIds = parseIds(metaPixelId, META_ID_PATTERN);
  const tiktokIds = parseIds(tiktokPixelId, TIKTOK_ID_PATTERN);
  const gtmIds = parseIds(gtmId, GTM_ID_PATTERN);

  const viewContentPayload = viewContent
    ? safeJsonForScript({
        content_name: viewContent.title,
        value: viewContent.value,
        currency: viewContent.currency || "IDR",
      })
    : null;

  return (
    <>
      {/* Meta (Facebook & Instagram) Pixel */}
      {metaIds.length > 0 && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,"script",
                "https://connect.facebook.net/en_US/fbevents.js");
                ${metaIds.map((id) => `fbq("init", "${id}");`).join("\n                ")}
                fbq("track", "PageView");
                ${viewContentPayload ? `fbq("track", "ViewContent", ${viewContentPayload});` : ""}
              `,
            }}
          />
          <noscript>
            {metaIds.map((id) => (
              <img
                key={id}
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
                alt=""
              />
            ))}
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {tiktokIds.length > 0 && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,s=d.createElement("script"),s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var o=d.getElementsByTagName("script")[0];o.parentNode.insertBefore(s,o)};
                ${tiktokIds.map((id) => `ttq.load("${id}");`).join("\n                ")}
                ${tiktokIds.map((id) => `ttq.instance("${id}").page();`).join("\n                ")}
                ${
                  viewContentPayload
                    ? tiktokIds.map((id) => `ttq.instance("${id}").track("ViewContent", ${viewContentPayload});`).join("\n                ")
                    : ""
                }
              }(window, document, "ttq");
            `,
          }}
        />
      )}

      {/* Google Tag Manager — container generik, seller bisa hubungkan tracking apapun
          lewat dataLayer tanpa kita bangun integrasi baru tiap ada platform ads baru */}
      {gtmIds.map((id) => (
        <Script
          key={id}
          id={`gtm-${id}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${id}');
            `,
          }}
        />
      ))}
      {gtmIds.map((id) => (
        <noscript key={`ns-${id}`}>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${id}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      ))}
    </>
  );
}

function trackMetaEvent(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // fbq("track", ...) otomatis broadcast ke semua pixel ID yang sudah di-init,
  // jadi tidak perlu loop per-ID seperti TikTok.
  if (typeof (window as any).fbq === "function") {
    try {
      (window as any).fbq("track", event, params);
    } catch (e) {
      console.warn(`Meta Pixel ${event} error:`, e);
    }
  }
}

function trackTiktokEvent(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const ttq = (window as any).ttq;
  if (!ttq || typeof ttq.instance !== "function") return;
  // ttq.track() top-level cuma menyasar instance pertama yang di-load, jadi
  // untuk multi-pixel harus dipanggil eksplisit per ID lewat ttq.instance(id).
  Object.keys(ttq._i || {}).forEach((id) => {
    try {
      ttq.instance(id).track(event, params);
    } catch (e) {
      console.warn(`TikTok Pixel ${event} error:`, e);
    }
  });
}

function pushDataLayerEvent(event: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...params });
}

// Client event dispatchers
export function trackPixelViewContent(data: { title: string; value: number; currency?: string }) {
  const params = {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
  };
  trackMetaEvent("ViewContent", params);
  trackTiktokEvent("ViewContent", params);
  pushDataLayerEvent("view_content", params);
}

export function trackPixelInitiateCheckout(data: {
  title: string;
  value: number;
  quantity: number;
  currency?: string;
}) {
  trackMetaEvent("InitiateCheckout", {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
    num_items: data.quantity,
  });
  trackTiktokEvent("InitiateCheckout", {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
    quantity: data.quantity,
  });
  pushDataLayerEvent("initiate_checkout", {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
    quantity: data.quantity,
  });
}

export function trackPixelPurchase(data: {
  title: string;
  value: number;
  quantity: number;
  orderNumber: string;
  currency?: string;
}) {
  trackMetaEvent("Purchase", {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
    num_items: data.quantity,
    order_id: data.orderNumber,
  });
  trackTiktokEvent("CompletePayment", {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
    quantity: data.quantity,
    order_id: data.orderNumber,
  });
  pushDataLayerEvent("purchase", {
    content_name: data.title,
    value: data.value,
    currency: data.currency || "IDR",
    quantity: data.quantity,
    order_id: data.orderNumber,
  });
}

// Dipakai untuk trigger custom per-elemen (mis. tombol Hero CTA yang di-set
// seller sendiri lewat Builder), bukan event funnel baku di atas.
export function trackPixelCustomEvent(event: string, data: { title: string; value?: number; currency?: string }) {
  if (!event) return;
  const params = {
    content_name: data.title,
    ...(data.value !== undefined ? { value: data.value, currency: data.currency || "IDR" } : {}),
  };
  trackMetaEvent(event, params);
  trackTiktokEvent(event, params);
  pushDataLayerEvent(event, params);
}
