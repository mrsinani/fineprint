/**
 * Edge auth for Clerk plus Supabase cookie refresh (`updateSession`).
 * Next.js 16 uses this file as “Proxy (Middleware)”; keep logic in sync with `src/lib/supabase/middleware.ts`.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const isAppRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/upload(.*)",
  "/documents(.*)",
  "/profile(.*)",
  "/settings(.*)",
  "/trash(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/reset-password(.*)",
]);

const clerkAuth = clerkMiddleware(async (auth, request) => {
  const supabaseResponse = await updateSession(request);

  const { userId } = await auth();

  if (isAuthRoute(request) && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAppRoute(request)) {
    await auth.protect();
  }

  return supabaseResponse;
});

export default clerkAuth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
