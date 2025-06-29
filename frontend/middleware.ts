import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (!isProtectedRoute(req)) return NextResponse.next();

  let session;
  try {
    session = auth().protect();
  } catch {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
