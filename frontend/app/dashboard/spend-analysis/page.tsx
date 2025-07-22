import { Suspense } from "react";

import {
  getSpendingByCommodityFiltered,
  getSpendingByLocationFiltered,
  getSpendingByMonthFiltered,
  getSpendingBySupplierfiltered,
  getSpendingByTopSupplierFiltered,
  getSpendingHeaderView,
} from "@/actions/spend-analysis";
import Barchat from "@/components/dashboard/spend-analysis-comp/barchat";
import HeaderView from "@/components/dashboard/spend-analysis-comp/header-view";
import Linechat from "@/components/dashboard/spend-analysis-comp/linechart";
import GeoMap from "@/components/dashboard/spend-analysis-comp/map";
import SpendActions from "@/components/dashboard/spend-analysis-comp/spend-actions";
import {
  BarchatLoading,
  GeoMapLoading,
  HeaderViewLoading,
  LinechatLoading,
  SupplierNeedsLoading,
  TreeMapLoading,
} from "@/components/dashboard/spend-analysis-comp/spend-analysis-loading";
import SupplierNeeds from "@/components/dashboard/spend-analysis-comp/supplierneeds";
import TreeMap from "@/components/dashboard/spend-analysis-comp/treemapchart";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EmptyStats from "./empty-stats";
import {
  ParsedSearchParams,
  searchParamsCache,
} from "@/components/dashboard/spend-analysis-comp/search-params";
import { ErrorBoundaryCustom } from "@/components/dashboard/ErrorBoundary";

const SpendAnalysis = async ({
  searchParams,
}: {
  searchParams: ParsedSearchParams;
}) => {
  const { startDate, endDate } = await searchParamsCache.parse(searchParams);

  // const header_view = await getSpendingHeaderView();
  /* const spending_by_supplier_promise = getSpendingBySupplierfiltered({
    startDate,
    endDate,
  });
  const spending_by_month_promise = getSpendingByMonthFiltered({
    startDate,
    endDate,
  });
  const spending_by_commodity_promise = getSpendingByCommodityFiltered({
    startDate,
    endDate,
  });
  const spending_by_location_promise = getSpendingByLocationFiltered({
    startDate,
    endDate,
  });
  const spending_by_top_supplier_promise = getSpendingByTopSupplierFiltered({
    startDate,
    endDate,
  }); */

  /* if (!header_view) {
    return <EmptyStats />;
  } */

  return (
    <div className="w-full bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Spend Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SpendActions />

      {/* cards */}
      <div className="">
        <ErrorBoundaryCustom>
          <Suspense
            fallback={<HeaderViewLoading />}
            key={`1-${startDate}-${endDate}`}
          >
            <HeaderView />
          </Suspense>
        </ErrorBoundaryCustom>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[12px]">
            <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pl-8 pt-7">
              Spending by supplier
            </h2>
            <ErrorBoundaryCustom>
              <Suspense
                fallback={<BarchatLoading />}
                key={`2-${startDate}-${endDate}`}
              >
                <Barchat startDate={startDate} endDate={endDate} />
              </Suspense>
            </ErrorBoundaryCustom>
          </div>
          <div className="bg-white rounded-[12px]">
            <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pt-7 pl-8">
              Spending by month
            </h2>
            <ErrorBoundaryCustom>
              <Suspense
                fallback={<LinechatLoading />}
                key={`3-${startDate}-${endDate}`}
              >
                <Linechat startDate={startDate} endDate={endDate} />
              </Suspense>
            </ErrorBoundaryCustom>
          </div>
          <div className="bg-white rounded-[12px]">
            <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pb-0 pt-7 pl-6">
              Spending by commodity
            </h2>
            <ErrorBoundaryCustom>
              <Suspense
                fallback={<TreeMapLoading />}
                key={`4-${startDate}-${endDate}`}
              >
                <TreeMap startDate={startDate} endDate={endDate} />
              </Suspense>
            </ErrorBoundaryCustom>
          </div>
          <div className="bg-white rounded-[12px]">
            <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pb-0 pt-7 pl-6 mb-4">
              Spending by location
            </h2>
            <ErrorBoundaryCustom>
              <Suspense
                fallback={<GeoMapLoading />}
                key={`5-${startDate}-${endDate}`}
              >
                <GeoMap startDate={startDate} endDate={endDate} />
              </Suspense>
            </ErrorBoundaryCustom>
          </div>
          <div className="col-span-1 sm:col-span-2 bg-white rounded-[12px]">
            <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pt-7 pl-6">
              Top Supplier spend
            </h2>
            <ErrorBoundaryCustom>
              <Suspense
                fallback={<SupplierNeedsLoading />}
                key={`6-${startDate}-${endDate}`}
              >
                <SupplierNeeds startDate={startDate} endDate={endDate} />
              </Suspense>
            </ErrorBoundaryCustom>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpendAnalysis;
