"use client";
import { FC, use } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable";
import { Button } from "@/components/ui/button";
import { PencilLine, SendHorizonal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { RoleType, SpendingByTopSupplierType } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { props } from "./barchat";
import { useSpendingByTopSupplier } from "./react-query-fetchs";

interface Props {
  spending_by_top_supplier_promise: Promise<{
    items: SpendingByTopSupplierType[];
    total: number;
  } | null>;
}

export const usersColumn: ColumnDef<SpendingByTopSupplierType>[] = [
  {
    accessorKey: "description",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">
          Commodity description
        </div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.CommodityName}
        </div>
      );
    },
  },
  {
    accessorKey: "number",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">
          Material number
        </div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.MaterialNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">Vendor name</div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.VendorName}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">Location</div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.Location}
        </div>
      );
    },
  },
  {
    accessorKey: "spend",
    header: () => {
      return <div className="font-[700] text-[14px] text-[#8A8A8A]">Spend</div>;
    },
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.TotalSpend}
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
      const role: RoleType = user?.publicMetadata?.role as RoleType;

      return (
        <div className="">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <Link
                  href={
                    role?.includes("paid")
                      ? `/dashboard/projects/create?CommodityName=${data.CommodityName}&CommodityPartNumber=${data.MaterialNumber}`
                      : "/pricing"
                  }
                >
                  <SendHorizonal
                    strokeWidth={1}
                    className="text-primary"
                    size={16}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="">
                Create new sourcing project <br /> for this commodity
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];

const SupplierNeeds: FC<props> = ({ startDate, endDate }) => {
  const { data: spending_by_top_supplier } = useSpendingByTopSupplier({
    startDate,
    endDate,
  });

  if (!spending_by_top_supplier) return;

  return (
    <div className="px-7">
      <DataTable
        columns={usersColumn}
        data={spending_by_top_supplier.items}
        infive
      />
    </div>
  );
};

export default SupplierNeeds;
