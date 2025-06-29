"use client";

import { useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

// This component signs the user out and back in once, right after first login
export function RefreshSessionOnLogin() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const refreshedOnce = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || refreshedOnce.current) return;

    const role = user.publicMetadata?.role;

    // Only refresh if role is missing (i.e., stale session JWT)
    if (!role) {
      refreshedOnce.current = true;

      // Sign out and redirect back to current page
      signOut({ redirectUrl: window.location.href });
    }
  }, [isSignedIn, user, signOut]);

  return null;
}
