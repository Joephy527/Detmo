import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SpendAnalysisLoading = () => {
    return <div>SpendAnalysisLoading</div>;
};

export const HeaderViewLoading = () => {
    return (
        <div className="flex flex-wrap gap-4 mb-6">
            {/* Create 5 skeleton cards for the header metrics */}
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm flex-1 min-w-[200px]"
                >
                    <div className="flex justify-between items-start mb-3">
                        <Skeleton className="h-5 w-32" /> {/* Title */}
                        <Skeleton className="h-6 w-6 rounded-md" /> {/* Icon */}
                    </div>
                    <Skeleton className="h-8 w-24" /> {/* Value */}
                </div>
            ))}
        </div>
    );
};

export const BarchatLoading = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Skeleton className="h-6 w-40 mb-6" /> {/* Title */}
            <div className="h-[300px] w-full relative">
                <div className="flex items-end justify-between h-full w-full">
                    {/* Create 6 skeleton bars */}
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center w-full"
                        >
                            <Skeleton
                                className="w-[80%] rounded-t-md"
                                style={{
                                    height: `${Math.max(
                                        20,
                                        Math.random() * 250
                                    )}px`,
                                    opacity: 0.7,
                                }}
                            />{' '}
                            {/* Bar */}
                            <Skeleton className="h-4 w-16 mt-2" />{' '}
                            {/* X-axis label */}
                        </div>
                    ))}
                </div>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-10" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const LinechatLoading = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton className="h-6 w-40 mb-6" /> {/* Title */}
            <div className="h-[300px] w-full relative">
                {/* Line chart skeleton */}
                <div className="absolute inset-0 flex items-center">
                    <Skeleton className="h-[2px] w-full opacity-30" />{' '}
                    {/* Middle horizontal line */}
                </div>

                {/* Dots for the line chart */}
                <div className="absolute inset-0">
                    <div className="relative h-full w-full">
                        {Array.from({ length: 7 }).map((_, index) => {
                            const left = `${index * 16 + 5}%`;
                            const top = `${Math.max(
                                10,
                                Math.min(90, 30 + Math.random() * 50)
                            )}%`;

                            return (
                                <Skeleton
                                    key={index}
                                    className="absolute h-3 w-3 rounded-full"
                                    style={{ left, top }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-0 w-full flex justify-between">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-20" />
                    ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton key={index} className="h-4 w-10" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const GeoMapLoading = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Skeleton className="h-6 w-48 mb-6" />{' '}
            {/* Title: Spending by location */}
            <div className="flex">
                {/* Legend */}
                <div className="w-[100px] mr-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <Skeleton className="h-4 w-4 mr-2" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>

                {/* Map outline */}
                <div className="flex-1 relative">
                    <Skeleton className="h-[300px] w-full rounded-md" />

                    {/* Add some random shapes to simulate continents */}
                    <div className="absolute inset-0 p-8">
                        <Skeleton className="h-[40px] w-[80px] absolute top-[20%] left-[10%] rounded-full opacity-40" />
                        <Skeleton className="h-[100px] w-[120px] absolute top-[30%] left-[30%] rounded-md opacity-40" />
                        <Skeleton className="h-[80px] w-[60px] absolute top-[20%] right-[20%] rounded-md opacity-40" />
                        <Skeleton className="h-[120px] w-[80px] absolute bottom-[20%] left-[20%] rounded-md opacity-40" />
                        <Skeleton className="h-[60px] w-[100px] absolute bottom-[30%] right-[30%] rounded-md opacity-40" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TreeMapLoading = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <Skeleton className="h-6 w-48 mb-6" />{' '}
            {/* Title: Spending by commodity */}
            <div className="grid grid-cols-3 gap-2 h-[300px]">
                {/* Large rectangle (left column) */}
                <Skeleton className="col-span-1 row-span-2 h-full rounded-md" />

                {/* Medium rectangles (middle and right columns) */}
                <Skeleton className="col-span-1 h-full rounded-md" />
                <Skeleton className="col-span-1 h-full rounded-md" />

                {/* Small rectangles (bottom row) */}
                <Skeleton className="col-span-1 h-full rounded-md" />
                <Skeleton className="col-span-1 h-full rounded-md" />
            </div>
        </div>
    );
};

export const SupplierNeedsLoading = () => {
    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <Skeleton className="h-6 w-48 mb-6" />{' '}
            {/* Title: Top Supplier spend */}
            {/* Table header */}
            <div className="grid grid-cols-5 gap-4 border-b pb-2 mb-2">
                <Skeleton className="h-4 w-32" /> {/* Commodity description */}
                <Skeleton className="h-4 w-24" /> {/* Material number */}
                <Skeleton className="h-4 w-24" /> {/* Vendor name */}
                <Skeleton className="h-4 w-20" /> {/* Location */}
                <Skeleton className="h-4 w-16" /> {/* Spend */}
            </div>
            {/* Table rows */}
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="grid grid-cols-5 gap-4 py-4 border-b"
                >
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-4 rounded-full" />{' '}
                        {/* Arrow icon */}
                    </div>
                </div>
            ))}
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" /> {/* First page */}
                    <Skeleton className="h-8 w-8 rounded" /> {/* Previous */}
                    <Skeleton className="h-8 w-8 rounded" /> {/* Next */}
                    <Skeleton className="h-8 w-8 rounded" /> {/* Last page */}
                </div>
                <Skeleton className="h-4 w-32" /> {/* Page info */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" /> {/* Show text */}
                    <Skeleton className="h-8 w-16 rounded" /> {/* Dropdown */}
                </div>
            </div>
        </div>
    );
};

export default SpendAnalysisLoading;
