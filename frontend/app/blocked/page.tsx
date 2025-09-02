"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster } from "react-hot-toast";

export default function BlockedPage() {
  const { signOut } = useClerk();

  useEffect(() => {
    toast.error("Please use your business email.", {
      duration: 10000,
    });
    signOut({ redirectUrl: "/blocked" }).catch(() => {});
  }, [signOut]);

  return (
    <section className="flex flex-col justify-center items-center h-screen md:p-3 p-2 container max-w-screen-md  text-center  gap-5">
      <Toaster position="top-center" />

      <h1 className=" text-3xl md:text-4xl lg:text-5xl font-bold text-wrap md:px-4 px-2 lg:leading-[60px]">
        Access Restricted
      </h1>
      <h2 className="  md:text-lg text-wrap font-normal">
        Your email domain is not allowed. You’ve been signed out.
      </h2>
      <div className="flex justify-center items-center gap-3 flex-wrap">
        <Link href="/sign-up">
          <Button size="lg">Sign in with your business email</Button>
        </Link>

        <Link href="/">
          <Button size="lg" variant="outline">
            Go to Homepage
          </Button>
        </Link>
      </div>
    </section>
  );
}
