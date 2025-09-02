"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const toastMessage = searchParams.get("t_m");

    if (toastMessage && !hasShownToast.current) {
      hasShownToast.current = true; // Prevent second toast
      toast.error(toastMessage, {
        duration: 10000,
      });

      const params = new URLSearchParams(searchParams.toString());
      params.delete("t_m");

      setTimeout(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      }, 1000);
    }
  }, [searchParams, router]);

  return children;
}
