"use client";
import Link from "next/link";
import { Menu, Package, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import SearchBox from "@/components/dashboard/searchbox";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/dashboard/sidebar";
import { Toaster } from "react-hot-toast";
import { useCollapsibleStore } from "@/store/usecollapse";
import { RefreshSessionOnLogin } from "@/components/RefreshSessionOnLogin";
import { RoleType } from "@/lib/types";
import { ErrorBoundaryCustom } from "@/components/dashboard/ErrorBoundary";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CompanySelector from "@/components/dashboard/company-selector";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useCollapsibleStore();

  const { user } = useUser();

  const role: RoleType = user?.publicMetadata?.role as RoleType;
  const isPaid = role?.includes("paid");
  const isAdmin = role?.includes("admin");

  return (
    <section className="relative">
      <Sidebar />

      <main
        className={cn(
          "flex flex-1 flex-col min-h-screen transition-[margin-left] duration-500 delay-0 ease-in-out",
          isOpen ? "lg:ml-[280px]" : "lg:ml-0",
        )}
      >
        <Toaster />

        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 sticky top-0 z-[3]">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="flex flex-col gap-2 text-lg font-medium">
                <Link href="/" className="flex items-center gap-3 mb-4">
                  <Image src="/logo.svg" alt="logo" width={170} height={100} />
                </Link>

                <ErrorBoundaryCustom>
                  <Suspense
                    fallback={
                      <div className="px-4 mb-4">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    }
                  >
                    <CompanySelector isMobile />
                  </Suspense>
                </ErrorBoundaryCustom>
                <Link
                  href="/dashboard/spend-analysis"
                  className={cn(
                    "flex items-center gap-3 rounded-lg  px-1 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname.includes("/spend-analysis") &&
                      " text-primary bg-muted",
                  )}
                >
                  <Package className="h-4 w-4" />
                  Spend Analysis
                </Link>
                <Link
                  href="/dashboard/projects"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-1 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname.includes("/projects") && "bg-muted text-primary",
                  )}
                >
                  <Package className="h-4 w-4" />
                  All Projects
                </Link>

                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-1 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname.includes("/settings") && "bg-muted text-primary",
                  )}
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our
                      support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/pricing" target="_blank">
                      <Button size="sm" className="w-full">
                        Upgrade
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            className={cn(
              "shrink-0 hidden transition-[transform_display]",
              isOpen ? "scale-0 hidden" : "lg:scale-100 lg:flex delay-500",
            )}
            onClick={() => {
              if (isOpen) {
                onClose();
              } else onOpen();
            }}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div
            className={cn(
              "h-14 items-center border-b lg:h-[60px] hidden transition-[transform_display] ",
              isOpen ? "scale-0 hidden" : "lg:scale-100 lg:flex delay-500",
            )}
          >
            <Link
              href="/dashboard/spend-analysis"
              className="flex items-center gap-2 font-semibold"
            >
              <Image src="/logo.svg" alt="logo" width={170} height={100} />
            </Link>
          </div>

          <div className="w-full flex-1">
            <SearchBox />
          </div>

          <div className="flex items-center gap-4 sm:gap-8 md:gap-9">
            <Link
              href={
                role?.includes("paid")
                  ? "/dashboard/projects/create"
                  : "/pricing"
              }
              className="hidden sm:block"
            >
              <Button size="lg" className="bg-[#6649B6]">
                New sourcing project
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />{" "}
          </div>
        </header>
        <div className="grow flex flex-col">{children}</div>
        <RefreshSessionOnLogin />
      </main>
    </section>
  );
}
