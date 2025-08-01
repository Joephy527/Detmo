'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';

import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    FormItem,
    FormLabel,
    Form,
    FormControl,
    FormMessage,
    FormField,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { updateSupplierEvalById } from '@/actions/supplier-evaluation';
import {
    SupplierEvaluationCreateType,
    SupplierEvaluationResponseType,
} from '@/lib/types';

// Define the form schema with validation
const formSchema = z.object({
    SupplierName: z.string().min(1, { message: 'Supplier name is required' }),
    LocationRank: z.coerce.number().min(1).max(5),
    CompanySizeRank: z.coerce.number().min(1).max(5),
    CriticalPartsRank: z.coerce.number().min(1).max(5),
    NonCriticalPartsRank: z.coerce.number().min(1).max(5),
    RevenueRank: z.coerce.number().min(1).max(5),
    OnTimeDeliveryRank: z.coerce.number().min(1).max(5),
    SupplierHealthRank: z.coerce.number().min(1).max(5),
    OrderFulfilmentRateRank: z.coerce.number().min(1).max(5),
    AvgAnnualRAndDSpentRank: z.coerce.number().min(1).max(5),
});

interface Props {
    supplier_evaluation_data: SupplierEvaluationResponseType;
}

export default function EditSupplierEval({ supplier_evaluation_data }: Props) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        SupplierName,
        LocationRank,
        CompanySizeRank,
        CriticalPartsRank,
        NonCriticalPartsRank,
        RevenueRank,
        OnTimeDeliveryRank,
        SupplierHealthRank,
        OrderFulfilmentRateRank,
        AvgAnnualRAndDSpentRank,
    } = supplier_evaluation_data;

    // Initialize form with validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            SupplierName,
            LocationRank,
            CompanySizeRank,
            CriticalPartsRank,
            NonCriticalPartsRank,
            RevenueRank,
            OnTimeDeliveryRank,
            SupplierHealthRank,
            OrderFulfilmentRateRank,
            AvgAnnualRAndDSpentRank,
        },
    });

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            // Extract the numeric value from the rank strings
            const supplierData: SupplierEvaluationCreateType = {
                SupplierName: data.SupplierName,
                LocationRank: data.LocationRank,
                CompanySizeRank: data.CompanySizeRank,
                CriticalPartsRank: data.CriticalPartsRank,
                NonCriticalPartsRank: data.NonCriticalPartsRank,
                RevenueRank: data.RevenueRank,
                OnTimeDeliveryRank: data.OnTimeDeliveryRank,
                SupplierHealthRank: data.SupplierHealthRank,
                OrderFulfilmentRateRank: data.OrderFulfilmentRateRank,
                AvgAnnualRAndDSpentRank: data.AvgAnnualRAndDSpentRank,
            };

            const result = await updateSupplierEvalById(
                supplier_evaluation_data.SupplierEvaluationID,
                supplierData,
                supplier_evaluation_data.SourcingProjectID
            );

            if (result?.success) {
                toast.success('Supplier has been updated successfully');
                setOpen(false);
            } else {
                toast.error('Failed to update supplier. Please try again.');
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to extract rank number from select value
    const extractRank = (value: string): number => {
        const match = value.match(/^(\d+)/);
        return match ? Number.parseInt(match[1], 10) : 0;
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="outline-0 mt-1.5">
                        <PenLine
                            strokeWidth={1}
                            className="text-primary"
                            size={16}
                        />
                    </button>
                </DialogTrigger>

                <DialogContent className="w-full max-w-[700px] h-full overflow-y-scroll md:h-auto lg:overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="font-[500]">
                            {' '}
                            Edit supplier ratings
                        </DialogTitle>
                        <DialogDescription className="font-[500]">
                            edit a supplier and provide ratings for supplier
                            attributes
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="mt-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="SupplierName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Supplier name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter your supplier name"
                                                    className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="LocationRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Location
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? field.value.toString()
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose a location" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={'1'}>
                                                        1 - Intercontinental
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - International
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - Interstate/province
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - Intercounty
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - Intercity
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="CompanySizeRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Company size (in employees)
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose company size" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - 50 - 100
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 100 - 200
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - 200 - 300
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - 300 - 500
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - More than 500
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="CriticalPartsRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Critical parts
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose critical parts" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - 50 - 100
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 100 - 200
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - 200 - 300
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - 300 - 500
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - More than 500
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="NonCriticalPartsRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Non-critical parts
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose non critical parts" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - 50 - 100
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 100 - 200
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - 200 - 300
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - 300 - 500
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - More than 500
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="RevenueRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Revenue
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? field.value.toString()
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose revenue" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - $0 - $1M
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - $1M - $100M
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - $100M - $500M
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - $500M - $1B
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - More than $1 billion
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="OnTimeDeliveryRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                On-time delivery
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose on-time delivery" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - 0% - 20%
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 20% - 40%
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - 40% - 60%
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - 60% - 80%
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - 80% - 100%
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="SupplierHealthRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Part Acceptance rate
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose part acceptance rate" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - 0% - 20%
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 20% - 40%
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - 40% - 60%
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - 60% - 80%
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - 80% - 100%
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="OrderFulfilmentRateRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Order Fulfillment rate
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose fulfillment rate" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - 0% - 20%
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 20% - 40%
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - 40% - 60%
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - 60% - 80%
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - 80% - 100%
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="AvgAnnualRAndDSpentRank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                                                Average annual R&D spent by
                                                supplier
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) =>
                                                    field.onChange(
                                                        extractRank(value)
                                                    )
                                                }
                                                value={
                                                    field.value
                                                        ? `${field.value}`
                                                        : undefined
                                                }
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                                                        <SelectValue placeholder="Choose average amount" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">
                                                        1 - No R&D
                                                    </SelectItem>
                                                    <SelectItem value="2">
                                                        2 - 0 - 100k
                                                    </SelectItem>
                                                    <SelectItem value="3">
                                                        3 - $100K - $1M
                                                    </SelectItem>
                                                    <SelectItem value="4">
                                                        4 - $1M - $10M
                                                    </SelectItem>
                                                    <SelectItem value="5">
                                                        5 - More than $10M
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-center sm:justify-end gap-5 mt-5 mb-4">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="font-[400] px-6"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    variant="default"
                                    className="font-[400] px-10"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        </>
                                    ) : (
                                        'Edit supplier'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
