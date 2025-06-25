import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

const HeaderViewLoading = () => {
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
            <div className="my-10 mx-auto p-4 flex ">
                <Skeleton className="h-10 w-32" />
            </div>
            {/* cards */}
            <div className="">
                <div className="flex flex-wrap gap-4 mb-6">
                    {/* Create 5 skeleton cards for the header metrics */}
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg p-4 shadow-sm flex-1 min-w-[200px]"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <Skeleton className="h-5 w-32" /> {/* Title */}
                                <Skeleton className="h-6 w-6 rounded-md" />{' '}
                                {/* Icon */}
                            </div>
                            <Skeleton className="h-8 w-24" /> {/* Value */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeaderViewLoading;
