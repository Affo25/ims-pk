"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import AddTargetModal from "./add-target-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import DeleteTargetModal from "./delete-target-modal";
import EditTargetModal from "./edit-target-modal";

const TargetSalesDataTable = ({ data }) => {
    const { fetchCounts } = useCounts();
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState([]);
    const [editingTarget, setEditingTarget] = useState({});
    const [selectedTarget, setSelectedTarget] = useState({});
    const [modalState, setModalState] = useState({
        addTarget: false,
        deleteTarget: false,
        editTarget: false,
    });

    useEffect(() => {
        fetchCounts();
    }, [modalState]);

    const columns = [
        {
            header: "#",
            cell: (props) => <p className="mb-0">{props.row.index + 1}</p>,
        },
        {
            accessorKey: "month",
            header: "Month",
            cell: (props) => {
                const row = props.row.original;
                return <h6 className="fw-semibold mb-0">{row.month}</h6>;
            },
        },
        {
            accessorKey: "year",
            header: "Year",
            cell: (props) => {
                const row = props.row.original;
                return <h6 className="fw-semibold mb-0">{row.year}</h6>;
            },
        },
        {
            header: "Target Amount",
            cell: (props) => {
                const row = props.row.original;
                return <h6 className="fw-semibold mb-0">{row.target_amount}</h6>;
            },
        },
        {
            header: "Sales Amount",
            cell: (props) => {
                const row = props.row.original;
                return <h6 className="fw-semibold mb-0">{row.sales_amount}</h6>;
            },
        },
        // {
        //     accessorKey: "status",
        //     header: "Status",
        //     cell: (props) => {
        //         const row = props.row.original;
        //         return <span className="badge bg-secondary">{row.status || "N/A"}</span>;
        //     },
        // },
        {
            header: "Actions",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <div className="btn-group mb-2">
                        <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="ti ti-dots-vertical"></i>
                        </Link>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li>
                                <button className="dropdown-item" onClick={() => openEditTargetModal(row)}>
                                    Edit target
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" onClick={() => openDeleteTargetModal(row)}>
                                    Mark as deleted
                                </button>
                            </li>
                        </ul>
                    </div>
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

    const onSearchInputChange = (e) => {
        setSearch(e.target.value);
    };

    const openAddTargetModal = async () => {

        setModalState({ ...modalState, addTarget: true });

        setTimeout(() => {
            openModal("add-target-modal");
        }, 50);
    };

    const closeAddTargetModal = () => {
        closeModal("add-target-modal");

        setTimeout(() => {
            setModalState({ ...modalState, addTarget: false });
        }, 50);
    };

    const openEditTargetModal = (target) => {
        setModalState({ ...modalState, editTarget: true });
        setEditingTarget(target);
        setTimeout(() => {
            openModal("edit-target-modal");
        }, 50);
    };


    const closeEditTargetModal = () => {
        closeModal("edit-target-modal");

        setTimeout(() => {
            setModalState({ ...modalState, editTarget: false });
            setEditingTarget({});
        }, 50);
    };
    const openDeleteTargetModal = (target) => {
        setModalState({ ...modalState, deleteTarget: true });
        setSelectedTarget(target);

        setTimeout(() => {
            openModal("delete-target-modal");
        }, 50);
    };

    const closeDeleteTargetModal = () => {
        closeModal("delete-target-modal");

        setTimeout(() => {
            setModalState({ ...modalState, deleteTarget: false });
            setSelectedTarget({});
        }, 50);
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-2">
                    <div className="position-relative">
                        <input type="text" id="search" autoComplete="off" className="form-control py-2 ps-5" placeholder="Search..." value={search} onChange={onSearchInputChange} />
                        <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3"></i>
                    </div>
                </div>
                <div className="col-md-8"></div>
                <div className="col-md-2 text-end">
                    <button type="button" className="btn btn-primary mt-3 mt-sm-0" onClick={() => openAddTargetModal()}>
                        Add Target
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
                                    No targets found.
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
                        onChange={(e) => table.setPageSize(e.target.value)}>
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

            {modalState.addTarget && <AddTargetModal onClose={closeAddTargetModal} />}
            {modalState.editTarget && <EditTargetModal onClose={closeEditTargetModal} editingTarget={editingTarget} />}
            {modalState.deleteTarget && <DeleteTargetModal onClose={closeDeleteTargetModal} selectedTarget={selectedTarget} />}

        </>
    );
};

export default TargetSalesDataTable;

