"use client";

import { FC, use } from "react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/datatable";
import Deleteuser from "./deleteuser";
import { UserEditType, UserType } from "@/lib/types";
import Edituser from "./edituser";
import { useUser } from "@clerk/nextjs";

interface Props {
  users_promise: Promise<{ items: UserEditType[]; total?: number } | null>;
  current_user_promise: Promise<UserType | null>;
}

export const usersColumn: ColumnDef<UserEditType>[] = [
  {
    accessorKey: "name",
    header: () => {
      return <div className="font-[700] text-[14px] text-[#8A8A8A]">Name</div>;
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
    accessorKey: "email",
    header: () => {
      return <div className="font-[700] text-[14px] text-[#8A8A8A]">Email</div>;
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
    accessorKey: "permission",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">Permission</div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.Role ?? "User"}
        </div>
      );
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original;
      const { user } = useUser();
      const editData: UserEditType = {
        ...data,
        Role: data.Role?.includes("admin") ? "admin" : "user",
      };
      if ((user?.publicMetadata?.role as string).includes("admin"))
        return (
          <div className="flex gap-6 items-center">
            <Edituser data={editData} />
            {/* <Deleteuser user_id={data.ClerkID} /> */}
          </div>
        );
    },
  },
];

const UsersContent: FC<Props> = ({ users_promise, current_user_promise }) => {
  const users = use(users_promise)?.items;
  if (!users) return;
  return (
    <div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1400px] lg:pt-[40px]">
      <DataTable<UserEditType, unknown>
        columns={usersColumn}
        data={[
          ...users.map((usr) => ({
            ...usr,
            Role: usr?.Role ?? "user",
          })),
        ]}
      />
    </div>
  );
};

export default UsersContent;
