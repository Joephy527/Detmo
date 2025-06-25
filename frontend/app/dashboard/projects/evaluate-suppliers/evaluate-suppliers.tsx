'use client';

import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { FC, useState } from 'react';
import toast from 'react-hot-toast';
import { ColumnDef } from '@tanstack/react-table';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Cards from '@/components/dashboard/project/evaluate/cards';
import { DataTable } from '@/components/datatable';
import Addsupplier from '@/components/dashboard/project/evaluate/addsupplier';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog';
import Step from '@/components/dashboard/project/singleproject/step';
import Editsupplier from '@/components/dashboard/project/evaluate/editsupplier';
import { DataTableCustom } from '@/components/datatableCustom';
import { ProjectType, SupplierEvaluationResponseType } from '@/lib/types';
import { deleteSupplierEvalById } from '@/actions/supplier-evaluation';

interface Props {
    project: ProjectType;
    supplier_evaluation_data: SupplierEvaluationResponseType[];
}

const Evaluate: FC<Props> = ({ supplier_evaluation_data, project }) => {
    const [showResults, setShowResults] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const calculateOverallRating = (data: SupplierEvaluationResponseType) => {
        return (
            data.RevenueRank +
            data.OnTimeDeliveryRank +
            data.SupplierHealthRank +
            data.OrderFulfilmentRateRank +
            data.AvgAnnualRAndDSpentRank
        );
    };

    let suppliersWithRating = supplier_evaluation_data.map((supplier) => ({
        ...supplier,
        totalRating: calculateOverallRating(supplier),
    }));

    if (showResults) {
        suppliersWithRating.sort((a, b) => b.totalRating - a.totalRating);
    }

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
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.SupplierName}
                    </div>
                );
            },
        },
        {
            accessorKey: 'location',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Location
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.LocationRank}
                    </div>
                );
            },
        },
        {
            accessorKey: 'company_size',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Company size
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.CompanySizeRank}
                    </div>
                );
            },
        },
        {
            accessorKey: 'critical_parts',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Critical parts
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.CriticalPartsRank}
                    </div>
                );
            },
        },
        {
            accessorKey: 'non_critical_parts',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Non critical parts
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.NonCriticalPartsRank}
                    </div>
                );
            },
        },
        {
            accessorKey: 'revenue',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Revenue
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.RevenueRank}
                    </div>
                );
            },
            sortDescFirst: true,
        },
        {
            accessorKey: 'on_time_delivery',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        On-time delivery
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? ' ' : ''
                        }`}
                    >
                        {data.OnTimeDeliveryRank}
                    </div>
                );
            },
            sortDescFirst: true,
        },
        {
            accessorKey: 'supplier_health',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Supplier Health
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.SupplierHealthRank}
                    </div>
                );
            },
            sortDescFirst: true,
        },
        {
            accessorKey: 'order_fulfillment_rate',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Order fulfillment rate
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.OrderFulfilmentRateRank}
                    </div>
                );
            },
            sortDescFirst: true,
        },
        {
            accessorKey: 'average_annual_rd',
            header: () => {
                return (
                    <div className="font-[700] text-[14px] text-[#8A8A8A]">
                        Average annual R&D spent by supplier
                    </div>
                );
            },
            cell: ({ row }) => {
                const data = row.original;
                const isTop3 = row.index < 3 && showResults;
                return (
                    <div
                        className={`font-[400] text-[14px] text-[#3B3C41] ${
                            isTop3 ? '' : ''
                        }`}
                    >
                        {data.AvgAnnualRAndDSpentRank}
                    </div>
                );
            },
            sortDescFirst: true,
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const data = row.original;

                return (
                    <div className="flex items-center gap-6">
                        <Editsupplier supplier_evaluation_data={data} />
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="outline-0">
                                    <Trash2
                                        strokeWidth={1}
                                        className="text-primary"
                                        size={16}
                                    />
                                </button>
                            </DialogTrigger>

                            <DialogContent className="w-full sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle className="font-[500]">
                                        Delete supplier evaluation
                                    </DialogTitle>
                                    <DialogDescription className="font-[500]">
                                        Are you sure you want to delete this
                                        supplier evaluation?
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-center sm:justify-end gap-5 mt-4">
                                    <DialogClose asChild>
                                        <Button
                                            variant={'secondary'}
                                            className="font-[400] px-10"
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>

                                    <Button
                                        className="font-[400] px-14"
                                        variant={'destructive'}
                                        disabled={isDeleting}
                                        onClick={() =>
                                            deleteAction(
                                                data.SupplierEvaluationID
                                            )
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            },
        },
    ];

    const deleteAction = async (supplier_eval_id: string) => {
        setIsDeleting(true);
        const response = await deleteSupplierEvalById(
            supplier_eval_id,
            project.SourcingProjectID
        );
        setIsDeleting(false);
        if (response?.success) {
            toast.success('Supplier has been deleted successfully');
        } else {
            toast.error(`Something went wrong - Please try again later`);
        }
    };

    return (
        <div>
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
                                {project.Name}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <h1 className="mt-4 mb-4 text-[32px] font-[700]">
                    {project.Name}
                </h1>

                <main className="bg-transparent w-full h-full grid  grid-cols-1 gap-4">
                    <div className="rounded-[12px] bg-white p-4  xl:px-9 py-6">
                        <Step currentPhase={project.Phase} />
                        <Cards
                            project={{
                                Commodity: project.Commodity,
                                StartDate: project.StartDate,
                                EndDate: project.EndDate,
                            }}
                        />
                    </div>
                    <div>
                        <div className="rounded-[12px] bg-white p-4 md:p-5 lg:p-6 xl:px-9 sm">
                            <h1 className="pb-2 text-[20px] font-[700] text-[#121212]">
                                Supplier Evaluation
                            </h1>
                            <p className="text-[14px] font-[400] text-[#8A8A8A]">
                                Evaluate suppliers for sourcing.
                            </p>

                            <div className="pt-6">
                                {showResults ? (
                                    <DataTableCustom
                                        columns={supplierColumn}
                                        data={suppliersWithRating}
                                        rowStyle="text-center"
                                    />
                                ) : (
                                    <DataTable
                                        columns={supplierColumn}
                                        data={suppliersWithRating}
                                        rowStyle="text-center"
                                    />
                                )}
                            </div>
                            <Addsupplier
                                project_id={project.SourcingProjectID}
                            />
                        </div>
                    </div>
                </main>
            </div>

            <div className="bg-white pb-7 flex items-center flex-wrap justify-center sm:justify-end gap-5 px-4 md:pr-6 mt-6">
                <Button
                    variant={'secondary'}
                    className="h-[38px] text-[14px] font-[500] px-10"
                    asChild
                >
                    <Link href={'/dashboard/spend-analysis'}>Cancel</Link>
                </Button>
                <Button
                    variant={'outline'}
                    className="h-[38px] border-primary text-[14px] text-primary font-[500]"
                    asChild
                >
                    <Link
                        href={`/dashboard/projects/${project.SourcingProjectID}/edit`}
                    >
                        Edit project information
                    </Link>
                </Button>

                <Button
                    variant={'outline'}
                    className="h-[38px] border-primary text-[14px] text-primary font-[500]"
                    onClick={() => setShowResults(!showResults)}
                >
                    {showResults ? 'Hide results' : 'Show results'}
                </Button>
                <Button
                    variant={'default'}
                    className="h-[38px] text-[14px] font-[500] px-10"
                >
                    Save
                </Button>
            </div>
        </div>
    );
};

export default Evaluate;
