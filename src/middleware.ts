import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isLoggedIn = !!session;
  const role = session?.user?.role;

  // Rutas del panel → requieren login
  if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // Rutas de admin → solo superadmin
    if (pathname.startsWith("/admin") && role !== "superadmin") {
      return NextResponse.redirect(new URL("/panel/comisiones", req.url));
    }
  }

  // Ya logueado → redirigir fuera del login
  if (pathname === "/login" && isLoggedIn) {
    const dest = role === "superadmin" ? "/admin" : "/panel/comisiones";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/login"],
};
