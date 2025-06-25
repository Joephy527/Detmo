import { FC, Suspense } from 'react';

import Tabmenu from '@/components/dashboard/settings/tabmenu';
import UsersContent from '@/components/dashboard/settings/users/userscontent';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getUserDetail, getUsers } from '@/actions/settings';
import { UserTableSkeleton } from '@/components/dashboard/settings/loading-ui';

interface UsersProps {}

const Users: FC<UsersProps> = async ({}) => {
    const users_promise = getUsers({});
    const current_user_promise = getUserDetail();
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
                        <BreadcrumbPage className="text-muted-foreground/70">
                            Settings
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[16px] font-[400]">
                            User
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <h1 className="mt-4 mb-7 text-[32px] font-[700]">User</h1>

            <main className="bg-white w-full h-full rounded-t-[12px] rounded-b-[12px]">
                <Tabmenu />
                <Suspense fallback={<UserTableSkeleton />}>
                    <UsersContent
                        users_promise={users_promise}
                        current_user_promise={current_user_promise}
                    />
                </Suspense>
            </main>
        </div>
    );
};

export default Users;
