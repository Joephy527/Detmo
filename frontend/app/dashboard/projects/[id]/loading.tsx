import React from 'react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

const loading = () => {
    return (
        <div className="bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 min-h-screen w-full">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href="/"
                            className="text-muted-foreground/70"
                        >
                            Home
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href="/dashboard/projects"
                            className="text-muted-foreground/70"
                        >
                            All Projects
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[16px] font-[400]">
                            <Skeleton className="h-4 w-32" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-4 mb-4">
                <Skeleton className="h-8 w-64" />
            </div>
            <main className="bg-transparent w-full h-full grid  grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Progress Tracker */}
                <div className="flex items-center justify-between">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-2"
                        >
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>

                {/* Project Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-muted/20 p-4 rounded-md">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="bg-muted/20 p-4 rounded-md">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                </div>

                {/* Project Details Section */}
                <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>

                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex py-3 border-b last:border-0"
                        >
                            <div className="w-1/3">
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div className="w-2/3">
                                <Skeleton className="h-5 w-16" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sourcing Team Section */}
                <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>

                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex py-3 border-b last:border-0"
                        >
                            <div className="w-1/3">
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div className="w-2/3">
                                <Skeleton className="h-5 w-48" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Project Comments Section */}
                <div className="border rounded-md p-4">
                    <div className="mb-4">
                        <Skeleton className="h-6 w-40" />
                    </div>

                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-5 w-24" />
                                <div className="flex-grow"></div>
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <div className="ml-11 bg-muted/20 p-3 rounded-md">
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    ))}

                    {/* Comment input */}
                    <div className="mt-6">
                        <Skeleton className="h-24 w-full rounded-md" />
                        <div className="flex justify-end mt-2">
                            <Skeleton className="h-9 w-20 rounded-md" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export const EditProjectLoading = () => {
    return (
        <div className="bg-white rounded-[20px] px-4 md:px-10 lg:px-[80px] py-[35px] mb-12 max-w-[1400px] mx-auto">
            <div className="space-y-8">
                {/* Header with green accent */}
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-400 rounded-full" />
                    <Skeleton className="h-8 w-56" />
                </div>

                {/* Project name */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>

                {/* Project objective */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-24 w-full rounded-md" />
                </div>

                {/* Projected savings */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-1/3 rounded-md" />
                        <Skeleton className="h-10 w-1/3 rounded-md" />
                    </div>
                </div>

                {/* Project type */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-1/3 rounded-md" />
                        <Skeleton className="h-12 w-1/3 rounded-md" />
                        <Skeleton className="h-12 w-1/3 rounded-md" />
                    </div>
                </div>

                {/* Dates */}
                <div className="flex gap-8">
                    <div className="w-1/2 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="w-1/2 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>

                {/* Phase and Status */}
                <div className="flex gap-8">
                    <div className="w-1/2 space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="w-1/2 space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default loading;
