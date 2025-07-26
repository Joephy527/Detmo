import { ErrorBoundaryCustom } from "@/components/dashboard/ErrorBoundary";
import BillingContent from "@/components/dashboard/settings/billing/billingcontent";
import { UserTableSkeleton } from "@/components/dashboard/settings/loading-ui";
import Tabmenu from "@/components/dashboard/settings/tabmenu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { FC, Suspense } from "react";

interface BillingProps {}

const Billing: FC<BillingProps> = ({}) => {
  return (
    <div className="bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 min-h-screen w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-muted-foreground/70">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground/70">
              Settings
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[16px] font-[400]">
              Billing
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-4 mb-7 text-[32px] font-[700]">Billing</h1>

      <main className="bg-white w-full h-full rounded-t-[12px] rounded-b-[12px]">
        <Tabmenu />

        <ErrorBoundaryCustom>
          <Suspense fallback={<UserTableSkeleton />}>
            <BillingContent />
          </Suspense>
        </ErrorBoundaryCustom>
      </main>
    </div>
  );
};

export default Billing;
