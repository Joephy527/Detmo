"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../projects/loading";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      // If user is not signed in, redirect
      if (!isSignedIn) {
        router.replace("/sign-in");
        return;
      }
      // Check roles or other user metadata to allow access
      const role = user?.publicMetadata?.role as string;

      if (!role || !role.includes("admin")) {
        router.replace(
          "/dashboard/spend-analysis?t_m=can't access settings. you need to be an admin",
        );
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded || !isSignedIn) {
    // Optionally, show a loading state while checking user
    return <Loading />;
  }

  return <>{children}</>;
}
