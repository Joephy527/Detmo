import { Analytics } from "@vercel/analytics/react";
import "@/app/styles/globals.css";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { Roboto as FontSans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import MyApp from "./pages/_app";
import SetCookies from "@/components/set-cookies";
import { ReactQueryProvider } from "@/components/providers";
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100", "300", "400", "500", "700", "900"],
});
interface RootLayoutProps {
  children: React.ReactNode;
}
//  meta title, description
export const metadata: Metadata = {
  title: "detmo sourcing",
  description: "detmo sourcing",
  // icons: {
  // 	icon: '/favicon.ico',
  // },
  metadataBase: new URL("https://example.com"),

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "detmo sourcing",
    description: "detmo sourcing",
    url: "https://example.com",
    siteName: "detmo sourcing",
    images: [
      {
        url: "https://example.com/image.png",
        width: 800,
        height: 600,
        alt: "Open Graph Image",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Twitter Title",
    description: "Twitter Description",
    card: "summary_large_image",
    site: "@site",
    creator: "@creator",
  },
  // favicons: ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "android-chrome-192x192.png", "android-chrome-512x512.png", "safari-pinned-tab.svg", "favicon.ico"],
};
export default function RootLayout({ children }: RootLayoutProps) {
  const buttonPrimaryClass = cn(
    buttonVariants({ variant: "default", size: "lg" }),
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
   !function () {
     var reb2b = window.reb2b = window.reb2b || [];
     if (reb2b.invoked) return;
     reb2b.invoked = true;
     reb2b.methods = ["identify", "collect"];
     reb2b.factory = function (method) {
       return function () {
         var args = Array.prototype.slice.call(arguments);
         args.unshift(method);
         reb2b.push(args);
         return reb2b;
       };
     };
     for (var i = 0; i < reb2b.methods.length; i++) {
       var key = reb2b.methods[i];
       reb2b[key] = reb2b.factory(key);
     }
     reb2b.load = function (key) {
       var script = document.createElement("script");
       script.type = "text/javascript";
       script.async = true;
       script.src = "https://s3-us-west-2.amazonaws.com/b2bjsstore/b/" + key + "/reb2b.js.gz";
       var first = document.getElementsByTagName("script")[0];
       first.parentNode.insertBefore(script, first);
     };
     reb2b.SNIPPET_VERSION = "1.0.1";
     reb2b.load("Y46DJ4H32Z61");
   }();
 `,
          }}
        />
      </head>

      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ClerkProvider
          appearance={{
            layout: {
              logoImageUrl: "/logo.svg",
              // helpPageUrl: "/help",
              // termsPageUrl: "/terms",
              // privacyPageUrl: "/privacy",
            },
            elements: {
              formButtonPrimary: buttonPrimaryClass,
              socialButtonsBlockButton: buttonVariants({
                variant: "ghost",
                size: "lg",
              }),
              formButtonReset: buttonVariants({
                variant: "outline",
                size: "lg",
              }),
              input: "bg-input text-foreground p-4",

              card: "bg-card text-card-foreground shadow-sm rounded-lg",
              logoImage: "rounded-full",
              logoBox: "rounded-full",
              navbarButton: buttonVariants({
                variant: "ghost",
                size: "lg",
              }),
            },
          }}
        >
          <ReactQueryProvider>
            <NuqsAdapter>{children}</NuqsAdapter>
            {/* <SetCookies /> */}
          </ReactQueryProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
