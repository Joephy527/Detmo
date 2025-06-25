'use client';
import { DataTable } from '@/components/datatable';
import { SupplierEvaluationResponseType } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { PencilLine } from 'lucide-react';
import Link from 'next/link';
import { FC, use } from 'react';

interface Props {
    supplier_evaluation_promise: Promise<{
        items: SupplierEvaluationResponseType[];
    } | null>;
    project_id: string;
}
const RatingSummary: FC<Props> = ({
    project_id,
    supplier_evaluation_promise,
}) => {
    const supplier_evaluation_data = use(supplier_evaluation_promise);

    const supplierColumn: ColumnDef<SupplierEvaluationResponseType>[] = [
        {
            accessorKey: 'name',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Supplier Name
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="font-[600] text-[14px] text-[#3B3C41]">
                        {data.SupplierName}
                    </div>
                );
            },
        },

        {
            accessorKey: 'average_annual_rd',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Sum of ratings
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;

                const { RankingTotalResult } = data;

                return (
                    <div className="font-[400] text-[14px] text-[#3B3C41]">
                        {RankingTotalResult}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="rounded-[12px] bg-white p-4 md:p-5 lg:p-6 xl:px-9 sm:col-span-2">
            <h1 className="pb-6 text-[20px] font-[700] text-[#121212] flex items-center justify-between">
                Supplier rating summary{' '}
                <span className="ml-3">
                    {' '}
                    <Link
                        href={`/dashboard/projects/evaluate-suppliers?project_id=${project_id}`}
                    >
                        <PencilLine
                            className="text-primary"
                            strokeWidth={'1'}
                        />
                    </Link>
                </span>
            </h1>
            <hr />
            <div className="pt-6">
                <DataTable
                    columns={supplierColumn}
                    data={supplier_evaluation_data?.items ?? []}
                    infive
                />
            </div>
        </div>
    );
};

export default RatingSummary;
