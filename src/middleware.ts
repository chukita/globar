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

  if (pathname === "/admin/login") {
    if (isLoggedIn && role === "superadmin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/panel") || pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const dest = pathname.startsWith("/admin") ? "/admin/login" : "/login";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    if (pathname.startsWith("/admin") && role !== "superadmin") {
      return NextResponse.redirect(new URL("/panel/comisiones", req.url));
    }
    // El superadmin no tiene fila en `users` (login solo por contraseña) —
    // las páginas de /panel/* asumen que sí y rompen si intenta entrar ahí.
    if (pathname.startsWith("/panel") && role === "superadmin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (pathname === "/login" && isLoggedIn) {
    const dest = role === "superadmin" ? "/admin" : "/panel/productos";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/login"],
};
