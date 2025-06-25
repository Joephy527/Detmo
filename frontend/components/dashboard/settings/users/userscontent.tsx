'use client';

import { FC, use } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/datatable';
import Deleteuser from './deleteuser';
import { UserType } from '@/lib/types';
import Edituser from './edituser';

interface Props {
    users_promise: Promise<{ items: UserType[]; total: number } | null>;
    current_user_promise: Promise<UserType | null>;
}

export const usersColumn: ColumnDef<UserType>[] = [
    {
        accessorKey: 'name',
        header: () => {
            return (
                <div className="font-[700] text-[14px] text-[#8A8A8A]">
                    Name
                </div>
            );
        },
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="font-[700] text-[14px] text-[#3B3C41]">
                    {data.UserName}
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: () => {
            return (
                <div className="font-[700] text-[14px] text-[#8A8A8A]">
                    Email
                </div>
            );
        },
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="font-[400] text-[14px] text-[#3B3C41]">
                    {data.Email}
                </div>
            );
        },
    },
    {
        accessorKey: 'permission',
        header: () => {
            return (
                <div className="font-[700] text-[14px] text-[#8A8A8A]">
                    Permission
                </div>
            );
        },
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className="font-[400] text-[14px] text-[#3B3C41]">
                    {data.Role ?? 'User'}
                </div>
            );
        },
    },

    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const data = row.original;
            if (data.Role === 'admin')
                return (
                    <div className="flex gap-6 items-center">
                        <Edituser data={data} />
                        <Deleteuser user_id={data.ClerkID} />
                    </div>
                );
        },
    },
];

const UsersContent: FC<Props> = ({ users_promise, current_user_promise }) => {
    const users = use(users_promise)?.items;
    const user = use(current_user_promise);
    if (!users) return;
    return (
        <div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1400px] lg:pt-[40px]">
            <DataTable
                columns={usersColumn}
                data={[
                    ...users.map((usr) => ({
                        ...usr,
                        Role: user?.Role?.toLowerCase() ?? 'user',
                    })),
                ]}
            />
        </div>
    );
};

export default UsersContent;
