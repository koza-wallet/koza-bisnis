import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If env not yet configured or in build time, pass through safely
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh user session safely
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase() || "";
  const currentHost = host.replace(/:\d+$/, "");

  const isLocalhost = currentHost === "localhost" || currentHost === "127.0.0.1";
  const isApexOrWww = currentHost === "kozabisnis.com" || currentHost === "www.kozabisnis.com";
  const isVercelPreview = currentHost.endsWith(".vercel.app");

  // Dukungan simulasi domain kustom untuk pengujian lokal: header x-test-domain atau query param __test_domain
  const testDomainParam = isLocalhost ? request.nextUrl.searchParams.get("__test_domain") : null;
  const testDomainHeader = request.headers.get("x-test-domain");
  const simulatedDomain = testDomainParam || testDomainHeader;

  const isCustomDomain =
    Boolean(simulatedDomain) ||
    (!isLocalhost && !isApexOrWww && !isVercelPreview && currentHost !== "cname.kozabisnis.com");

  // --- LOGIKA MULTI-TENANT CUSTOM DOMAIN REWRITE ---
  if (isCustomDomain && !pathname.startsWith("/_next") && !pathname.startsWith("/favicon.ico")) {
    const domainToCheck = (simulatedDomain || currentHost).replace(/^www\./, "");

    // 1. API routes tetap berjalan dengan header penanda tenant
    if (pathname.startsWith("/api")) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-custom-domain", domainToCheck);
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // 2. Akses ke halaman admin platform dari custom domain dialihkan ke domain platform utama
    if (pathname.startsWith("/dashboard") || pathname === "/login" || pathname === "/register") {
      const platformUrl = new URL(pathname, "https://www.kozabisnis.com");
      return NextResponse.redirect(platformUrl);
    }

    // 3. Halaman pelacakan resi publik diperbolehkan langsung
    if (pathname.startsWith("/lacak")) {
      return supabaseResponse;
    }

    // 4. Cari toko yang memiliki custom domain ini di Supabase
    const { data: store } = await supabase
      .from("public_stores")
      .select("slug")
      .or(`custom_domain.eq.${domainToCheck},custom_domain.eq.www.${domainToCheck}`)
      .maybeSingle();

    if (store?.slug) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-custom-domain", domainToCheck);
      requestHeaders.set("x-store-slug", store.slug);

      // Rewrite URL ke etalase toko (/toko/[slug]) tanpa merubah URL di browser pengunjung
      const rewriteUrl = new URL(
        `/toko/${store.slug}${pathname === "/" ? "" : pathname}`,
        request.url
      );

      return NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
        headers: supabaseResponse.headers,
      });
    }
  }

  // --- LOGIKA STANDAR DOMAIN PLATFORM ---
  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from login / register
  if ((pathname === "/login" || pathname === "/register") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
