import { Skeleton } from '@/components/ui/skeleton';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function Loading() {
    return (
        <div className="bg-[#F6F6F6] p-4 lg:gap-4 lg:p-6 min-h-screen w-full">
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
                        <BreadcrumbPage className="text-[16px] font-[400]">
                            <Skeleton className="h-4 w-24" />
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="mb-4 flex justify-between ">
                <h1 className="mt-4 mb-7 text-[32px] font-[700]">
                    <Skeleton className="h-4 w-32" />
                </h1>
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="container mx-auto py-6">
                {/* Breadcrumb skeleton */}
                <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Header skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <Skeleton className="h-10 w-40" />
                    <Skeleton className="h-10 w-44 rounded-md" />
                </div>

                {/* Table header skeleton */}
                <div className="grid grid-cols-6 gap-4 py-4 border-b">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-32" />
                </div>

                {/* Table rows skeleton */}
                {Array.from({ length: 7 }).map((_, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-6 gap-4 py-6 border-b"
                    >
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-center">
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-5 w-36" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-5 w-36" />
                    </div>
                ))}
            </div>
        </div>
    );
}
