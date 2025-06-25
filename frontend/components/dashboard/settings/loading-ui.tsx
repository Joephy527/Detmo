import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => {
    return <div>Loading</div>;
};

export const CompanyDetailsSkeleton = () => {
    return (
        <div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1000px]">
            {/* Contact Info Section */}
            <div className="mb-10">
                <h1 className="my-4 mb-7 text-[23px] font-[700]">
                    Contact Info
                </h1>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Company display name
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Phone number
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Email
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Currency
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Registration Info Section */}
            <div className="mb-10">
                <h1 className="my-4 mb-7 text-[23px] font-[700]">
                    Registration Info
                </h1>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Company legal name
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Registration number
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        VAT number
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Official Address Section */}
            <div className="mb-10">
                <h1 className="my-4 mb-7 text-[23px] font-[700]">
                    Official Address
                </h1>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Address
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        State
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        City
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        Country
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
                    <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
                        ZIP
                    </h1>
                    <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export function UserTableSkeleton() {
    return (
        <div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1400px] lg:pt-[40px]">
            {/* Header */}
            <div className="bg-muted/40 p-4 flex items-center">
                <div className="w-1/2">
                    <Skeleton className="h-5 w-16" />
                </div>
                <div className="w-1/2">
                    <Skeleton className="h-5 w-16" />
                </div>
            </div>

            {/* Table rows */}
            {Array.from({ length: 10 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-4 border-b"
                >
                    <div className="w-1/4">
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="w-3/2 flex items-center justify-between">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-5 w-48" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                    </div>
                </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
    );
}

export default Loading;
