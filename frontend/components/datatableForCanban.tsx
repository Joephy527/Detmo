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
	TableForKanban,
	TableBodyForKanban,
	TableCell,
	TableCellForKanban,
	TableRowForKanban,
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

export function DataTableForKanban<TData, TValue>({
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
			<TableForKanban>
				<TableBodyForKanban>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRowForKanban
								key={row.id}
								data-state={row.getIsSelected() && 'selected'}
								className={cn('h-[63px]', rowStyle && rowStyle)}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCellForKanban key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCellForKanban>
								))}
							</TableRowForKanban>
						))
					) : (
						<TableRowForKanban>
							<TableCell colSpan={columns.length} className='h-24 text-center'>
								No results.
							</TableCell>
						</TableRowForKanban>
					)}
				</TableBodyForKanban>
			</TableForKanban>
		</div>
	)
}
