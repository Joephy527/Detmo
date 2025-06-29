"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./loading";

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

      if (!role || !role.includes("paid")) {
        router.replace(
          "/dashboard/spend-analysis?t_m=you need to be a paid user to access projects",
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
