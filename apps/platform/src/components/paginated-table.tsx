"use client";

import * as React from "react";
import {
	type Column,
	type ColumnDef,
	type ColumnFiltersState,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type VisibilityState,
	type TableOptions,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	ChevronsLeft,
	ChevronsRight,
	ChevronsUpDownIcon,
	EyeOffIcon,
} from "lucide-react";

import { cn } from "@platform/lib/utils";
import { Button } from "@platform/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@platform/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@platform/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@platform/components/ui/table";
import { Input } from "./ui/input";
import { IconAdjustmentsHorizontal } from "@tabler/icons-react";

type DataTablePaginationProps<TData> = {
	table: ReturnType<typeof useReactTable<TData>>;
	pageSizeOptions?: number[];
	showPageCount?: boolean;
	showSelectionCount?: boolean;
	showPageSize?: boolean;
};

function DataTablePagination<TData>({
	table,
	pageSizeOptions = [10, 20, 30, 40, 50],
	showPageCount = true,
	showSelectionCount = true,
	showPageSize = true,
}: DataTablePaginationProps<TData>) {
	return (
		<div className="flex items-center justify-between px-2 py-4">
			{showSelectionCount && (
				<div className="text-muted-foreground flex-1 text-sm">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
			)}
			<div className="flex items-center space-x-6 lg:space-x-8">
				{showPageSize && (
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Rows per page</p>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value));
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue
									placeholder={table.getState().pagination.pageSize}
								/>
							</SelectTrigger>
							<SelectContent side="top">
								{pageSizeOptions.map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				{showPageCount && (
					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</div>
				)}
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="icon-sm"
						className="hidden lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeft className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="currentColor"
								d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
							/>
						</svg>
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fill="currentColor"
								d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
							/>
						</svg>
					</Button>
					<Button
						variant="outline"
						size="icon-sm"
						className="hidden lg:flex"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRight className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}

type DataTableColumnHeaderProps<TData, TValue> = {
	column: Column<TData, TValue>;
	title: string;
	className?: string;
};

function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8 data-[state=open]:bg-accent"
					>
						<span>{title}</span>
						{column.getIsSorted() === "desc" ? (
							<ArrowDownIcon className="ml-2 size-4" />
						) : column.getIsSorted() === "asc" ? (
							<ArrowUpIcon className="ml-2 size-4" />
						) : (
							<ChevronsUpDownIcon className="ml-2 size-4" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
						<ArrowUpIcon className="mr-2 size-4" />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
						<ArrowDownIcon className="mr-2 size-4" />
						Desc
					</DropdownMenuItem>
					{column.getCanHide() && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
								<EyeOffIcon className="mr-2 size-4" />
								Hide
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

type DataTableViewOptionsProps<TData> = {
	table: ReturnType<typeof useReactTable<TData>>;
};

function DataTableViewOptions<TData>({
	table,
}: DataTableViewOptionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto h-8">
					<IconAdjustmentsHorizontal className="size-4" />
					View
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[150px]">
				<DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" && column.getCanHide()
					)
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

type DataTableSearchProps = {
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
};

function DataTableSearch({
	placeholder = "Search...",
	value,
	onChange,
	className,
}: DataTableSearchProps) {
	return (
		<div className={cn("flex items-center py-4", className)}>
			<Input
				placeholder={placeholder}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			/>
		</div>
	);
}

type PaginatedTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	options?: Partial<TableOptions<TData>>;
	showPagination?: boolean;
	showViewOptions?: boolean;
	showSearch?: boolean;
	searchPlaceholder?: string;
	searchColumn?: string;
	pageSizeOptions?: number[];
	showPageSize?: boolean;
	className?: string;
	tableClassName?: string;
	emptyMessage?: string;
	onRowClick?: (row: TData) => void;
	manualPagination?: boolean;
	pageCount?: number;
	pagination?: PaginationState;
	onPaginationChange?: (pagination: PaginationState) => void;
	showPageCount?: boolean;
	showSelectionCount?: boolean;
	action?: React.ReactNode;
};

export default function PaginatedTable<TData, TValue>({
	columns,
	data,
	options,
	showPagination = true,
	showViewOptions = false,
	showSearch = false,
	searchPlaceholder = "Search...",
	searchColumn,
	pageSizeOptions = [10, 20, 30, 40, 50],
	showPageSize = true,
	className,
	tableClassName,
	emptyMessage = "No results.",
	onRowClick,
	manualPagination = false,
	pageCount,
	pagination: controlledPagination,
	onPaginationChange,
	showPageCount = true,
	showSelectionCount = true,
	action,
}: PaginatedTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
	const [internalPagination, setInternalPagination] =
		React.useState<PaginationState>({
			pageIndex: 0,
			pageSize: 10,
		});

	const pagination = controlledPagination ?? internalPagination;
	const setPagination = onPaginationChange ?? setInternalPagination;

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: manualPagination
			? undefined
			: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		manualPagination,
		pageCount: manualPagination ? pageCount : undefined,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
		onPaginationChange: (updater) => {
			const newPagination =
				typeof updater === "function" ? updater(pagination) : updater;
			setPagination(newPagination);
		},
		...options,
	});

	const searchValue = searchColumn
		? ((table.getColumn(searchColumn)?.getFilterValue() as string) ?? "")
		: "";

	return (
		<div className={className}>
			{(showSearch || showViewOptions) && (
				<div className="flex items-center gap-4">
					{showSearch && searchColumn && (
						<DataTableSearch
							placeholder={searchPlaceholder}
							value={searchValue}
							onChange={(value) =>
								table.getColumn(searchColumn)?.setFilterValue(value)
							}
						/>
					)}
					{showViewOptions && <DataTableViewOptions table={table} />}
					{action}
				</div>
			)}
			<div className="overflow-hidden rounded-md border">
				<Table className={tableClassName}>
					<TableHeader>
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
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className={cn(onRowClick && "cursor-pointer")}
									onClick={() => onRowClick?.(row.original)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{showPagination && (
				<DataTablePagination
					table={table}
					pageSizeOptions={pageSizeOptions}
					showPageCount={showPageCount}
					showSelectionCount={showSelectionCount}
					showPageSize={showPageSize}
				/>
			)}
		</div>
	);
}

export {
	DataTableColumnHeader,
	DataTablePagination,
	DataTableViewOptions,
	DataTableSearch,
};
export type { PaginatedTableProps };
export type { PaginationState } from "@tanstack/react-table";
