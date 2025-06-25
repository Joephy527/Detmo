import * as React from 'react'

import { cn } from '@/lib/utils'

const Table = React.forwardRef<
	HTMLTableElement,
	React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
	<div className='relative w-full overflow-auto'>
		<table
			ref={ref}
			className={cn('w-full caption-bottom text-sm', className)}
			{...props}
		/>
	</div>
))
Table.displayName = 'Table'

const TableForKanban = React.forwardRef<
	HTMLTableElement,
	React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
	<div className='relative w-full overflow-auto'>
		<table
			ref={ref}
			className={cn(
				'w-full caption-bottom text-sm border-2',

				className
			)}
			{...props}
			style={{ borderSpacing: '0 10px' }}
		/>
	</div>
))
TableForKanban.displayName = 'TableForKanban'

const TableHeader = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		ref={ref}
		className={cn('[&_tr:last-child]:border-0', className)}
		{...props}
	/>
))
TableBody.displayName = 'TableBody'

const TableBodyForKanban = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tbody
		ref={ref}
		className={cn(
			'[&_tr]:border-2 [&_tr]:border-gray-200 [&_td]:border-0',
			className
		)}
		{...props}
	>
		{React.Children.map(props.children, (child, index) => (
			<>
				{index !== 0 && (
					<tr
						style={{
							borderRightColor: 'white',
							borderLeftColor: 'white',
						}}
					>
						<td
							colSpan={100}
							style={{
								height: '15px',
							}}
						/>
					</tr>
				)}
				{child}
			</>
		))}
	</tbody>
))
TableBodyForKanban.displayName = 'TableBodyForKanban'

const TableFooter = React.forwardRef<
	HTMLTableSectionElement,
	React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
	<tfoot
		ref={ref}
		className={cn(
			'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
			className
		)}
		{...props}
	/>
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted rounded-[20px]',
			className
		)}
		{...props}
	/>
))
TableRow.displayName = 'TableRow'

const TableRowForKanban = React.forwardRef<
	HTMLTableRowElement,
	React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
	<tr
		ref={ref}
		className={cn(
			' hover:bg-muted/50 data-[state=selected]:bg-muted rounded-[20px] border-t-2 mb-2',
			className
		)}
		{...props}
	/>
))
TableRowForKanban.displayName = 'TableRowForKanban'

const TableHead = React.forwardRef<
	HTMLTableCellElement,
	React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<th
		ref={ref}
		className={cn(
			'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
			className
		)}
		{...props}
	/>
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
			className
		)}
		{...props}
	/>
))
TableCell.displayName = 'TableCell'

const TableCellCustom = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
			className
		)}
		{...props}
	/>
))
TableCellCustom.displayName = 'TableCellCustom'

const TableCellForKanban = React.forwardRef<
	HTMLTableCellElement,
	React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
	<td
		ref={ref}
		className={cn(
			'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] flex flex-col',
			className
		)}
		{...props}
	/>
))
TableCellForKanban.displayName = 'TableCellForKanban'

const TableCaption = React.forwardRef<
	HTMLTableCaptionElement,
	React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
	<caption
		ref={ref}
		className={cn('mt-4 text-sm text-muted-foreground', className)}
		{...props}
	/>
))
TableCaption.displayName = 'TableCaption'

export {
	Table,
	TableForKanban,
	TableHeader,
	TableBody,
	TableFooter,
	TableHead,
	TableRow,
	TableRowForKanban,
	TableCell,
	TableCaption,
	TableBodyForKanban,
	TableCellForKanban,
	TableCellCustom,
}
