"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <html lang="en">
      <head />
      <body>
        <Toaster position="top-center" />
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  );
}
