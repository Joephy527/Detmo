"use client";

import Footer from "@/components/landing-components/footer";
import Navbar from "@/components/landing-components/navbar";
import { RefreshSessionOnLogin } from "@/components/RefreshSessionOnLogin";
import { Toaster } from "react-hot-toast";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
      <main className=" md:mx-auto pt-20">{children}</main>

      <RefreshSessionOnLogin />
      <Footer />
    </>
  );
}
