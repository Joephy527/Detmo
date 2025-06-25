import { FC, Suspense } from 'react';

import { getUserDetail } from '@/actions/settings';
import {
    getSpendingByCommodity,
    getSpendingByLocation,
    getSpendingByMonth,
    getSpendingBySupplier,
    getSpendingByTopSupplier,
    getSpendingHeaderView,
} from '@/actions/spend-analysis';
import Barchat from '@/components/dashboard/spend-analysis-comp/barchat';
import HeaderView from '@/components/dashboard/spend-analysis-comp/header-view';
import Linechat from '@/components/dashboard/spend-analysis-comp/linechart';
import GeoMap from '@/components/dashboard/spend-analysis-comp/map';
import SpendActions from '@/components/dashboard/spend-analysis-comp/spend-actions';
import {
    BarchatLoading,
    GeoMapLoading,
    HeaderViewLoading,
    LinechatLoading,
    SupplierNeedsLoading,
    TreeMapLoading,
} from '@/components/dashboard/spend-analysis-comp/spend-analysis-loading';
import SupplierNeeds from '@/components/dashboard/spend-analysis-comp/supplierneeds';
import TreeMap from '@/components/dashboard/spend-analysis-comp/treemapchart';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import EmptyStats from './empty-stats';

interface SpendAnalysisProps {}

const SpendAnalysis: FC<SpendAnalysisProps> = async ({}) => {
    const header_view = await getSpendingHeaderView();
    const spending_by_supplier_promise = getSpendingBySupplier();
    const spending_by_month_promise = getSpendingByMonth();
    const spending_by_commodity_promise = getSpendingByCommodity();
    const spending_by_location_promise = getSpendingByLocation();
    const spending_by_top_supplier_promise = getSpendingByTopSupplier();

    if (!header_view) {
        return <EmptyStats />;
    }

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
                <Suspense fallback={<HeaderViewLoading />}>
                    <HeaderView header_view={header_view} />
                </Suspense>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-[12px]">
                        <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pl-8 pt-7">
                            Spending by supplier
                        </h2>
                        <Suspense fallback={<BarchatLoading />}>
                            <Barchat
                                spending_by_supplier_promise={
                                    spending_by_supplier_promise
                                }
                            />
                        </Suspense>
                    </div>
                    <div className="bg-white rounded-[12px]">
                        <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pt-7 pl-8">
                            Spending by month
                        </h2>
                        <Suspense fallback={<LinechatLoading />}>
                            <Linechat
                                spending_by_month_promise={
                                    spending_by_month_promise
                                }
                            />
                        </Suspense>
                    </div>
                    <div className="bg-white rounded-[12px]">
                        <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pb-0 pt-7 pl-6">
                            Spending by commodity
                        </h2>
                        <Suspense fallback={<TreeMapLoading />}>
                            <TreeMap
                                spending_by_commodity_promise={
                                    spending_by_commodity_promise
                                }
                            />
                        </Suspense>
                    </div>
                    <div className="bg-white rounded-[12px]">
                        <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pb-0 pt-7 pl-6 mb-4">
                            Spending by location
                        </h2>
                        <Suspense fallback={<GeoMapLoading />}>
                            <GeoMap
                                spending_by_location_promise={
                                    spending_by_location_promise
                                }
                            />
                        </Suspense>
                    </div>
                    <div className="col-span-1 sm:col-span-2 bg-white rounded-[12px]">
                        <h2 className="text-[#8A8A8A] text-[18px] font-[400] p-5 pt-7 pl-6">
                            Top Supplier spend
                        </h2>
                        <Suspense fallback={<SupplierNeedsLoading />}>
                            <SupplierNeeds
                                spending_by_top_supplier_promise={
                                    spending_by_top_supplier_promise
                                }
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpendAnalysis;
