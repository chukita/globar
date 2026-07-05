import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isLoggedIn = !!(session?.user?.email);
  const role = session?.user?.role ?? null;

  console.log(`[middleware] ${pathname} | loggedIn=${isLoggedIn} | role=${role}`);

  if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "superadmin") {
      return NextResponse.redirect(new URL("/panel/comisiones", req.url));
    }
  }

  if (pathname === "/login" && isLoggedIn) {
    const dest = role === "superadmin" ? "/admin" : "/panel/comisiones";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/login"],
};
