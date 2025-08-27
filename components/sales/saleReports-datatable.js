"use client";

import Papa from "papaparse";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import { useCounts } from "@/lib/use-counts";
import { superAdmin, validStatuses } from "@/lib/data";

const SaleReportsDataTable = ({ data, users, loginUser }) => {
    const { fetchCounts } = useCounts();
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [tempSelectedUserId, setTempSelectedUserId] = useState("");
    const [tempSelectedStatus, setTempSelectedStatus] = useState("");
    const [tempStartDate, setTempStartDate] = useState("");
    const [tempEndDate, setTempEndDate] = useState("");
    const [totalSalesSum, setTotalSalesSum] = useState(0);


    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchUser = selectedUserId ? item.user_id === selectedUserId : true;
            const matchStatus = selectedStatus ? item.status === selectedStatus : true;

            const createdAt = item.created_at ? new Date(item.created_at) : null;
            const matchStart = startDate ? createdAt >= new Date(startDate) : true;
            const matchEnd = endDate ? createdAt <= new Date(endDate) : true;

            return matchUser && matchStatus && matchStart && matchEnd;
        });
    }, [data, selectedUserId, selectedStatus, startDate, endDate]);

    useEffect(() => {
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const start = firstOfMonth.toISOString().split("T")[0];
        const end = now.toISOString().split("T")[0];

        setStartDate(start);
        setEndDate(end);
        setTempStartDate(start);
        setTempEndDate(end);

        if (!superAdmin.includes(loginUser?.first_name)) {
            setSelectedUserId(loginUser?.id);
            setTempSelectedUserId(loginUser?.id);
        }

        fetchCounts();
    }, []);

    const handleApplyFilters = () => {
        setSelectedUserId(tempSelectedUserId);
        setSelectedStatus(tempSelectedStatus);
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
    };


    useEffect(() => {
        const total = filteredData.reduce((sum, item) => sum + (item.total_sales || 0), 0);
        setTotalSalesSum(total);
    }, [filteredData]);


    const columns = [
        {
            header: "#",
            cell: (props) => <p className="mb-0">{props.row.index + 1}</p>,
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: (props) => <h6 className="fw-semibold mb-0">{format(new Date(props.row.original.created_at), "dd MMM yyyy h:mm a")}</h6>,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: (props) => <h6 className="fw-semibold mb-0">{props.row.original.name}</h6>,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: (props) => <h6 className="fw-semibold mb-0">{props.row.original.email}</h6>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: (props) => <h6 className="fw-semibold mb-0">{props.row.original.status}</h6>,
        },
        {
            header: "Sale",
            cell: (props) => {
                const row = props.row.original;
                const total = row.total_sales || 0;
                return <h6 className="fw-semibold mb-0">{total.toLocaleString("en-AE", { minimumFractionDigits: 2 })}</h6>;
            },
        },
        {
            accessorKey: "start_datetime",
            header: "Start dates",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        {row.start_datetime && <p className="mb-0 fs-2">{format(new Date(row.start_datetime), "dd MMM yyyy h:mm a")}</p>}
                    </>
                );
            },
        },
        {
            accessorKey: "end_datetime",
            header: "End dates",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        {row.end_datetime && <p className="mb-0 fs-2">{format(new Date(row.end_datetime), "dd MMM yyyy h:mm a")}</p>}
                    </>
                );
            },
        },
    ];

    const table = useReactTable({
        data: filteredData,
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

    const handleUserChange = (e) => {
        setSelectedUserId(e.target.value);
    };

    const handleExportCSV = () => {
        if (typeof window === "undefined") return;
        try {
            const exportData = filteredData.map(item => ({
                name: item.name,
                email: item.email,
                status: item.status,
                sales_person: item.user?.first_name || '',
                total_sales: item.total_sales || 0,
            }));

            const csv = Papa.unparse({
                fields: [
                    "name",
                    "email",
                    "status",
                    "sales_person",
                    "total_sales"
                ],
                data: exportData,
            });

            const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const csvURL = URL.createObjectURL(csvData);
            window.open(csvURL);
            toast.success("CSV has been downloaded.");
        } catch (error) {
            toast.error("CSV could not be downloaded.");
        }
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={tempSelectedUserId}
                        onChange={(e) => setTempSelectedUserId(e.target.value)}
                        disabled={!superAdmin.includes(loginUser?.first_name)}
                    >
                        {superAdmin.includes(loginUser?.first_name) && (
                            <option value="">All Users</option>
                        )}
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} ({user.designation})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                    />
                </div>

                <div className="col-md-2">
                    <input
                        type="date"
                        className="form-control"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                    />
                </div>
                <div className="col-md-2">
                    <select
                        className="form-select"
                        value={tempSelectedStatus}
                        onChange={(e) => setTempSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {validStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-1" style={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>{totalSalesSum} :Total Sales</div>
                <div className="col-md-3 text-end">
                    <button className="btn btn-primary me-2" onClick={handleApplyFilters}>
                        Apply Filters
                    </button>
                    <button className="btn btn-primary" onClick={handleExportCSV}>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="table-responsive-lg border rounded">
                <table className="table align-middle text-center text-nowrap mb-0">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getIsSorted() === "asc" ? " 🔼" : header.column.getIsSorted() === "desc" ? " 🔽" : ""}
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
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center">
                                    No inquiries found.
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

export default SaleReportsDataTable;