import React, { useState } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	ColumnDef,
	flexRender,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type User = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
};

type ApiResponse = {
	data: User[];
	meta: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
};

const fetchUsers = async (
	page: number,
	limit: number
): Promise<ApiResponse> => {
	const response = await axios.get("http://localhost:3000/api/users", {
		params: { page, limit },
	});
	return response.data;
};

export const UserTable: React.FC = () => {
	const [rowSelection, setRowSelection] = useState({});
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const { data, isLoading } = useQuery(
        {
            queryKey: ["users", pagination.pageIndex, pagination.pageSize],
            queryFn: () => fetchUsers(pagination.pageIndex + 1, pagination.pageSize),
        }
	);

	const columns: ColumnDef<User>[] = [
		{
			id: "select",
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllPageRowsSelected()}
					onChange={table.getToggleAllPageRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			accessorKey: "id",
			header: "ID",
		},
		{
			accessorKey: "first_name",
			header: "First Name",
		},
		{
			accessorKey: "last_name",
			header: "Last Name",
		},
		{
			accessorKey: "email",
			header: "Email",
		},
	];

	const table = useReactTable({
		data: data?.data ?? [],
		columns,
		state: {
			rowSelection,
			pagination,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		pageCount: data?.meta.pages ?? -1,
	});

	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="p-4">
			<table className="min-w-full table-auto border-collapse border border-gray-300 rounded-md">
				<thead className="bg-gray-100">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b"
								>
									{header.isPlaceholder ? null : (
										<div
											className="flex items-center"
											onClick={header.column.getToggleSortingHandler()}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{header.column.getIsSorted()
												? header.column.getIsSorted() === "asc"
													? " 🔼"
													: " 🔽"
												: null}
										</div>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className="hover:bg-gray-50 border-b border-dotted border-gray-300"
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-4 py-2 text-sm text-gray-800">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>

			<div className="flex items-center justify-between mt-4">
				<div className="text-sm text-gray-600">
					Rows per page:
					<select
						className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
						value={table.getState().pagination.pageSize}
						onChange={(e) => table.setPageSize(Number(e.target.value))}
					>
						{[10, 20, 30].map((pageSize) => (
							<option key={pageSize} value={pageSize}>
								{pageSize}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center gap-2">
					<button
						className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Prev
					</button>
					<span className="text-sm">
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</span>
					<button
						className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</button>
				</div>
			</div>

			<div className="mt-4 text-sm text-gray-600">
				Selected rows: {Object.keys(rowSelection).length}
			</div>
		</div>
	);
};

export default UserTable;
