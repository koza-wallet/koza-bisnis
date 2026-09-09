"use client";

import Script from "next/script";

interface PixelTrackerProps {
  metaPixelId?: string;
  tiktokPixelId?: string;
}

export function PixelTracker({ metaPixelId, tiktokPixelId }: PixelTrackerProps) {
  const cleanMetaId = metaPixelId?.trim();
  const cleanTiktokId = tiktokPixelId?.trim();

  return (
    <>
      {/* Meta (Facebook & Instagram) Pixel */}
      {cleanMetaId && (
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
                fbq("init", "${cleanMetaId}");
                fbq("track", "PageView");
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${cleanMetaId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel */}
      {cleanTiktokId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,s=d.createElement("script"),s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var o=d.getElementsByTagName("script")[0];o.parentNode.insertBefore(s,o)};
                ttq.load("${cleanTiktokId}");
                ttq.page();
              }(window, document, "ttq");
            `,
          }}
        />
      )}
    </>
  );
}

// Client event dispatchers
export function trackPixelInitiateCheckout(data: {
  title: string;
  value: number;
  quantity: number;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    try {
      (window as any).fbq("track", "InitiateCheckout", {
        content_name: data.title,
        value: data.value,
        currency: data.currency || "IDR",
        num_items: data.quantity,
      });
    } catch (e) {
      console.warn("Meta Pixel InitiateCheckout error:", e);
    }
  }

  // TikTok Pixel
  if (typeof (window as any).ttq?.track === "function") {
    try {
      (window as any).ttq.track("InitiateCheckout", {
        content_name: data.title,
        value: data.value,
        currency: data.currency || "IDR",
        quantity: data.quantity,
      });
    } catch (e) {
      console.warn("TikTok Pixel InitiateCheckout error:", e);
    }
  }
}

export function trackPixelPurchase(data: {
  title: string;
  value: number;
  quantity: number;
  orderNumber: string;
  currency?: string;
}) {
  if (typeof window === "undefined") return;

  // Meta Pixel
  if (typeof (window as any).fbq === "function") {
    try {
      (window as any).fbq("track", "Purchase", {
        content_name: data.title,
        value: data.value,
        currency: data.currency || "IDR",
        num_items: data.quantity,
        order_id: data.orderNumber,
      });
    } catch (e) {
      console.warn("Meta Pixel Purchase error:", e);
    }
  }

  // TikTok Pixel
  if (typeof (window as any).ttq?.track === "function") {
    try {
      (window as any).ttq.track("CompletePayment", {
        content_name: data.title,
        value: data.value,
        currency: data.currency || "IDR",
        quantity: data.quantity,
        order_id: data.orderNumber,
      });
    } catch (e) {
      console.warn("TikTok Pixel CompletePayment error:", e);
    }
  }
}
