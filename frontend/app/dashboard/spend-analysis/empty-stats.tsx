'use client';

import React from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import UploadCSVDialog from '@/components/dashboard/spend-analysis-comp/upload-csv-dialog';

const EmptyStats = () => {
    return (
        <div className="w-full h-full bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 ">
            <Breadcrumb className=" ">
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
            <div className="mb-4 flex justify-between ">
                <h1 className="mt-4 mb-7 text-[32px] font-[700]">
                    Spend Analysis
                </h1>
            </div>

            <div className="w-full h-full flex justify-center">
                <div className="pt-14 sm:pt-[80px] flex flex-col items-center">
                    <h1 className="text-[15px] font-[400] text-[#3B3C41] text-center mb-8">
                        Upload your purchase orders to visualize and understand
                        your commodity spends.{' '}
                    </h1>
                    <UploadCSVDialog text="Upload Purchase Orders" />
                </div>
            </div>
        </div>
    );
};

export default EmptyStats;
