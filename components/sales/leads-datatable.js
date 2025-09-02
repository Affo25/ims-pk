"use client";

import Link from "next/link";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import AddLeadModal from "./add-lead-modal";
import EditLeadModal from "./edit-lead-modal";
import DeleteLeadModal from "./delete-lead-modal";
import { getCompanies } from "@/lib/actions";
import AddInquiryModal from "./add-inquiry-modal";

const LeadsDataTable = ({ data, user }) => {
    const { fetchCounts } = useCounts();
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState([]);
    const salesPeople = ["Ben", "Saqib", "Modar"];
    const [selectedSalesperson, setSelectedSalesperson] = useState("");
    const [addLead, setAddLead] = useState({});
    const [companies, setCompanies] = useState([]);
    const [editingLead, setEditingLead] = useState({});
    const [selectedLead, setSelectedLead] = useState({});
   const [addLeadOpen, setAddLeadOpen] = useState(false);
const [editLeadOpen, setEditLeadOpen] = useState(false);
const [deleteLeadOpen, setDeleteLeadOpen] = useState(false);
const [addInquiryOpen, setAddInquiryOpen] = useState(false);


    const filteredData = useMemo(() => {
        return selectedSalesperson ? data.filter((item) => item?.sale === selectedSalesperson) : data;
    }, [data, selectedSalesperson]);

    const filteredCount = filteredData.length;

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    const columns = [
        {
            header: "#",
            cell: (props) => <p className="mb-0">{props.row.index + 1}</p>,
        },
        {
            accessorKey: "name",
            header: "Client info",
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
            accessorKey: "email",
            header: "Contact details",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-0">{row.email}</h6>
                        <p className="mb-0">{row.contact}</p>
                    </>
                );
            },
        },
        {
            accessorKey: "source",
            header: "Source",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-0">{row.source}</h6>
                        <p className="mb-0">{row.contact_status}</p>
                    </>
                );
            },
        },
        {
            accessorKey: "solution",
            header: "Products",
            cell: (props) => {
                const row = props.row.original;
                let parsed = [];

                try {
                    parsed = typeof row.solution === "string"
                        ? JSON.parse(row.solution)
                        : row.solution;
                } catch (err) {
                    return <span className="badge bg-danger">Invalid Data</span>;
                }

                return (
                    <>
                        {parsed && Array.isArray(parsed) && parsed.map((item, index) => {
                            if (!item || !item.solution || !Array.isArray(item.solution)) {
                                return null;
                            }
                            return item.solution.map((solution, subIndex) => (
                                <span
                                    key={`${index}-${subIndex}`}
                                    className="badge bg-primary text-white fw-semibold me-1 fs-2"
                                >
                                    {solution}
                                </span>
                            ));
                        })}
                    </>
                );
            },
        },
        {
            accessorKey: "contact_status",
            header: "Contact Status",
            cell: (props) => {
                const row = props.row.original;
                const status = row.contact_status;

                let badgeClass = "";
                if (status === "Hot") badgeClass = "bg-success";
                else if (status === "Cold") badgeClass = "bg-primary";
                else if (status === "Lost") badgeClass = "bg-danger";

                return (
                    <span className={`badge ${badgeClass} text-white fw-semibold`}>
                        {status}
                    </span>
                );
            },
        },
        {
            header: "Saleperson",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-0">{row.sale}</h6>
                    </>
                );
            },
        },
        {
            header: "Actions",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <div className="btn-group mb-2">
                            <Link className="dropdown-toggle" id="dropdown-menu-button" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="ti ti-dots-vertical"></i>
                            </Link>
                            <ul className="dropdown-menu" aria-labelledby="dropdown-menu-button">
                                <li>
                                    <button className="dropdown-item" onClick={() => openEditLeadModal(row)}>
                                        Edit lead
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => openAddInquiryModal(row)}>
                                        Add inquiry
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" onClick={() => openDeleteLeadModal(row)}>
                                        Delete lead
                                    </button>
                                </li>
                            </ul>
                        </div>
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

    const onSearchInputChange = (e) => {
        setSearch(e.target.value);
    };

    const openAddLeadModal = async () => {
        setModalState({ ...modalState, addLead: true });
        setTimeout(() => {
            openModal("add-lead-modal");
        }, 50);
    };

    const closeAddLeadModal = () => {
        closeModal("add-lead-modal");
        setTimeout(() => {
            setModalState({ ...modalState, addLead: false });
        }, 50);
    };

    const openEditLeadModal = async (lead) => {
        setEditingLead(lead);
        setModalState({ ...modalState, editLead: true });
        setTimeout(() => {
            openModal("edit-lead-modal");
        }, 50);
    };

    const closeEditLeadModal = () => {
        closeModal("edit-lead-modal");

        setTimeout(() => {
            setModalState({ ...modalState, editLead: false });
            setEditingLead({});
        }, 50);
    };

    const openDeleteLeadModal = (lead) => {
        setModalState({ ...modalState, deleteLead: true });
        setSelectedLead(lead);

        setTimeout(() => {
            openModal("delete-lead-modal");
        }, 50);
    };

    const closeDeleteLeadModal = () => {
        closeModal("delete-lead-modal");

        setTimeout(() => {
            setModalState({ ...modalState, deleteLead: false });
            setSelectedLead({});
        }, 50);
    };

    const openAddInquiryModal = async (lead) => {
        const response = await getCompanies();

        if (response.status === "ERROR") {
            toast.error(response.message);
            return;
        }
        setAddLead(lead);
        setCompanies(response.data);
        setModalState({ ...modalState, addInquiry: true });
        setTimeout(() => {
            openModal("add-inquiry-modal");
        }, 50);
    };

    const closeAddInquiryModal = () => {
        closeModal("add-inquiry-modal");
        setTimeout(() => {
            setCompanies([]);
            setModalState({ ...modalState, addInquiry: false });
            setAddLead({});
        }, 50);
    };

    const handleSalesPersonChange = (e) => {
        setSelectedSalesperson(e.target.value);
    };

    const handleExportCSV = () => {
        if (typeof window === "undefined") return;
        try {
            const csv = Papa.unparse({
                fields: [
                    "name",
                    "email",
                    "contact",
                    "source",
                    "request",
                    "contact_status",
                    "sale",
                    "comments",

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
                <div className="col-md-2">
                    <div className="position-relative">
                        <input type="text" id="search" autoComplete="off" className="form-control py-2 ps-5" placeholder="Search..." value={search} onChange={onSearchInputChange} />
                        <i className="ti ti-search position-absolute top-50 start-0 translate-middle-y fs-6 text-dark ms-3"></i>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="mt-3 mt-sm-0 p-0 d-flex align-items-center">
                        <span className="me-2 mb-0" style={{ whiteSpace: "pre" }}>
                            Added by
                        </span>
                        <select className="form-select" id="sales-person-filter" value={selectedSalesperson} onChange={handleSalesPersonChange}>
                            <option value="">All</option>
                            {salesPeople.map((person) => (
                                <option key={person} value={person}>
                                    {person}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="col-md-3" style={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>{filteredCount} :Leads</div>
                <div className="col-md-4 text-end">
                    <button type="button" className="btn btn-primary mt-3 mt-sm-0 me-2" onClick={() => openAddLeadModal()}>
                        Add lead
                    </button>
                    <button type="button" className="btn btn-primary mt-3 mt-sm-0" onClick={() => handleExportCSV()}>
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

            {modalState.addLead && <AddLeadModal onClose={closeAddLeadModal} />}
            {modalState.addInquiry && <AddInquiryModal onClose={closeAddInquiryModal} companies={companies} addLead={addLead} />}
            {modalState.editLead && <EditLeadModal onClose={closeEditLeadModal} editingLead={editingLead} />}
            {modalState.deleteLead && <DeleteLeadModal onClose={closeDeleteLeadModal} selectedLead={selectedLead} />}
        </>
    );
};

export default LeadsDataTable;