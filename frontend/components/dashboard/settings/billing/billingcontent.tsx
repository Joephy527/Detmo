"use client";
import { FC } from "react";
import { billingTabData } from "@/data/setting";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable";

interface Props {}

type billingTabData = {
	date: string;
	description: string;
	amount: string;
	status: string;
};

const billingColumn: ColumnDef<billingTabData>[] = [
	{
		accessorKey: "date",
		header: () => {
			return (
				<div className="font-[700] text-[14px] text-[#8A8A8A]">Date</div>
			);
		},
		cell: ({ row }) => {
			const data = row.original;
			return (
				<div className="font-[400] text-[14px] text-[#3B3C41]">
					{data.date}
				</div>
			);
		},
	},
	{
		accessorKey: "description",
		header: () => {
			return (
				<div className="font-[700] text-[14px] text-[#8A8A8A]">
					Description
				</div>
			);
		},
		cell: ({ row }) => {
			const data = row.original;
			return (
				<div className="font-[400] text-[14px] text-[#3B3C41]">
					{data.description}
				</div>
			);
		},
	},
	{
		accessorKey: "amount",
		header: () => {
			return (
				<div className="font-[700] text-[14px] text-[#8A8A8A]">Amount</div>
			);
		},
		cell: ({ row }) => {
			const data = row.original;
			return (
				<div className="font-[400] text-[14px] text-[#3B3C41]">
					{data.amount}
				</div>
			);
		},
	},
	{
		accessorKey: "status",
		header: () => {
			return (
				<div className="font-[700] text-[14px] text-[#8A8A8A]">Status</div>
			);
		},
		cell: ({ row }) => {
			const data = row.original;
			return (
				<div className="font-[400] text-[14px] text-[#3B3C41]">
					{data.status}
				</div>
			);
		},
	},
];

const BillingContent: FC<Props> = ({}) => {
	return (
		<div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1400px] lg:pt-[40px]">
			<DataTable columns={billingColumn} data={billingTabData} />
		</div>
	);
};

export default BillingContent;
