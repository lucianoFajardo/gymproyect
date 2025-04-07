import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/login", "/register"]; //* Agregar aqui las rutas que quiero que saen publicas
const authRoutes = ["/login", "/register"]; //* Agragar aqui las rutas que quiero que sean privadas
const apiAuthPrefix = "/api/auth";

export async function middleware(request: NextRequest) {

    const { nextUrl } = request;
    const isLoggedIn = !!(await auth());
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard/view-users", nextUrl));
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};