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
import { EmptyStateFallback } from "./EmptyFallback";

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
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data.TotalSpend)}
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
  const {
    data: spending_by_top_supplier,
    isError,
    refetch,
  } = useSpendingByTopSupplier({
    startDate,
    endDate,
  });

  if (isError) {
    return (
      <div className="px-4 mb-4 h-full">
        <div className="border rounded-md px-3 py-2 text-center h-full grid place-items-center">
          <p className="text-red-500 text-xs">Something went wrong</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!spending_by_top_supplier) return;

  return (
    <div className="px-7">
      <DataTable
        columns={usersColumn}
        data={spending_by_top_supplier.items}
        infive
        dateRange={`${startDate || "..."} - ${endDate || "..."}`}
      />
    </div>
  );
};

export default SupplierNeeds;
