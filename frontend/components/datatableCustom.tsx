'use client'

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
} from '@tanstack/react-table'

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

import {
	Table,
	TableBody,
	TableCell,
	TableCellCustom,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	rowStyle?: string
	headerStyle?: string
	buttonWrapper?: string
	infive?: boolean
}

export function DataTableCustom<TData, TValue>({
	columns,
	data,
	rowStyle,
	headerStyle,
	buttonWrapper,
	infive,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(), //load client-side pagination code
		initialState: {
			pagination: {
				//custom initial page index
				pageSize: infive ? 5 : 10, //custom default page size
			},
		},
	})

	const handleChange = (value: string) => {
		table.setPageSize(Number(value))
	}
	return (
		<div className=''>
			<Table>
				<TableHeader
					className={cn('bg-[#F6F6F6] h-[34px]', headerStyle && headerStyle)}
				>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</TableHead>
								)
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row, index) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								className={cn(
									'h-[63px]',
									index < 3 ? 'bg-green-200' : '',
									rowStyle && rowStyle
								)}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCellCustom key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCellCustom>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className='h-24 text-center'>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<div
				className={cn(
					'flex items-center justify-center md:justify-end flex-wrap gap-2 my-8',
					buttonWrapper && buttonWrapper
				)}
			>
				<Button
					variant={'secondary'}
					className='border rounded px-3'
					onClick={() => table?.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronsLeft size={16} />
				</Button>
				<Button
					variant={'secondary'}
					className='border rounded px-3'
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeft size={16} />
				</Button>
				<Button
					variant={'secondary'}
					className='border rounded px-3'
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRight size={16} />
				</Button>
				<Button
					variant={'secondary'}
					className='border rounded px-3'
					onClick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronsRight size={16} />
				</Button>
				<span className='flex items-center gap-1 text-[#8A8A8A] text-[14px]'>
					<div>Page</div>
					<strong>
						{table.getState().pagination.pageIndex + 1} of{' '}
						{table.getPageCount().toLocaleString()}
					</strong>
				</span>
				<span className='flex items-center gap-1 text-[#8A8A8A] text-[14px]'>
					Go to
					<Input
						type='number'
						defaultValue={table.getState().pagination.pageIndex + 1}
						onChange={(e) => {
							const page = e.target.value ? Number(e.target.value) - 1 : 0
							table.setPageIndex(page)
						}}
						className='border p-1 rounded w-16'
					/>
				</span>

				<Select
					value={table.getState().pagination.pageSize.toString()}
					onValueChange={handleChange}
				>
					<SelectTrigger className='w-[120px]'>
						<SelectValue placeholder='Page size' />
					</SelectTrigger>
					<SelectContent className=''>
						{[5, 10, 20, 30, 40, 50].map((pageSize) => (
							<SelectItem key={pageSize} value={pageSize.toString()}>
								Show {pageSize}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
