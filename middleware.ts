import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_KEY } from "@/lib/utils/constants";

// Rutas que NO requieren sesión
const PUBLIC_ROUTES = ["/auth/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas y assets
  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".");

  if (isPublic) return NextResponse.next();

  // Verificar sesión en cookies (SSR-safe)
  // La sesión real está en localStorage (client-side),
  // pero guardamos un flag en cookie para el middleware.
  const sessionCookie = request.cookies.get(SESSION_KEY);

  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};
