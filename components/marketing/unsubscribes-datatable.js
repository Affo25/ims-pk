"use client";

import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const UnSubscribesDataTable = ({ data }) => {

    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState([]);

    const columns = [
        {
            header: "#",
            cell: (props) => <p className="mb-0">{props.row.index + 1}</p>,
        },
        {
            accessorKey: "Name",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-0">{row.name}</h6>
                    </>
                );
            },
        },
        {
            accessorKey: "Email",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-0">{row.email}</h6>
                    </>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter: search,
            sorting: sorting,
        },
        onGlobalFilterChange: setSearch,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
    });
    const handleExportCSV = () => {
        if (typeof window === "undefined") return;
        try {
            const csv = Papa.unparse({
                fields: [
                    "name",
                    "email",
                ],
                data: data,
            });

            var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            var csvURL = URL.createObjectURL(csvData);
            window.open(csvURL);
            toast.success("CSV has been downloaded.");
        } catch (error) {
            toast.error("CSV could not be downloaded.");
        }
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-10">
                </div>
                <div className="col-md-2 text-end">
                    <button type="button" className="btn btn-primary mt-3 mt-sm-0" onClick={() => handleExportCSV()}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="table-responsive border rounded">
                <table className="table align-middle text-center text-nowrap mb-0">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th scope="col" key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{ asc: <i className="ti ti-chevron-down"></i>, desc: <i className="ti ti-chevron-up"></i> }[header.column.getIsSorted() ?? "null"]}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    No clients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="d-flex align-items-center justify-content-end py-1">
                    <p className="mb-0 fs-2">Rows per page:</p>
                    <select
                        id="pageSize"
                        className="form-select w-auto ms-0 ms-sm-2 me-8 me-sm-4 py-1 pe-7 ps-2 border-0"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => {
                            table.setPageSize(e.target.value);
                        }}>
                        {[1, 10, 50, 100].map((pageSize) => (
                            <option key={pageSize} value={pageSize}>
                                {pageSize}
                            </option>
                        ))}
                    </select>
                    <p className="mb-0 fs-2">
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </p>
                    <nav>
                        <ul className="pagination justify-content-center mb-0 ms-8 ms-sm-9">
                            <li className="page-item p-1">
                                <button
                                    className="page-link border-0 rounded-circle text-dark fs-6 round-32 d-flex align-items-center justify-content-center"
                                    disabled={!table.getCanPreviousPage()}
                                    onClick={() => table.previousPage()}>
                                    <i className="ti ti-chevron-left"></i>
                                </button>
                            </li>
                            <li className="page-item p-1">
                                <button
                                    className="page-link border-0 rounded-circle text-dark fs-6 round-32 d-flex align-items-center justify-content-center"
                                    disabled={!table.getCanNextPage()}
                                    onClick={() => table.nextPage()}>
                                    <i className="ti ti-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

        </>
    );
};

export default UnSubscribesDataTable;
