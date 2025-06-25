import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api(.*)"]);

const isBillingProtectedRoute = createRouteMatcher([
  "/dashboard/projects(.*)",
  "/dashboard/settings(.*)"
]);

async function getUserDetail(userId: string, token: string) {
  if (!userId) return null;

  try {
    // Replace this with your actual implementation to fetch user details
    const res = await fetch(`${process.env.API_URL}/users?user_id=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 600
      }
    })

    const userData = await res.json();

    return userData.items[0];
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = auth().protect();
    // For billing-protected routes, check billing status
    if (isBillingProtectedRoute(req)) {
      const token = await session.getToken();
      // const userDetails = await getUserDetail(session.userId, token!!);

      // Redirect to pricing page if billing is not paid
      // if (!userDetails || userDetails.Billing !== "Paid") {
      //   const url = new URL("/pricing", req.url);
      //   return NextResponse.redirect(url);
      // }
    }
  };
  return NextResponse.next()
});
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
