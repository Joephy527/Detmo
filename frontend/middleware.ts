import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import blockedDomains from "./blocked_domains";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api(.*)"]);
const isRootRoute = createRouteMatcher(["/"]);

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth();

  // Handle "/" route: allow if no session, but check domain if logged in
  if (isRootRoute(req)) {
    if (userId && sessionClaims?.email) {
      const domain = (sessionClaims.email as string).split("@")[1];
      if (blockedDomains.includes(domain)) {
        const res = NextResponse.redirect(new URL("/blocked", req.url));
        res.cookies.set("__session", "", { maxAge: 0 });
        return res;
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    let session;
    try {
      session = auth().protect();
    } catch {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

    if (session.sessionClaims?.email) {
      const domain = (session.sessionClaims.email as string).split("@")[1];
      if (blockedDomains.includes(domain)) {
        const res = NextResponse.redirect(new URL("/blocked", req.url));
        res.cookies.set("__session", "", { maxAge: 0 });
        return res;
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
