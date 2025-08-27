"use client";

import Link from "next/link";
import Papa from "papaparse";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getCompanies } from "@/lib/actions";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import AddInternationalInquiryModal from "./add-internationalInquiry-modal";
import EditInternationalInquiryModal from "./edit-internationalinquiry-modal";
import InternationalLostConfirmModal from "./international-lost-confirm-modal";

const InternationalInquiriesDataTable = ({ data }) => {
    const { fetchCounts } = useCounts();
    const [search, setSearch] = useState("");
    const [sorting, setSorting] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [editingInquiry, setEditingInquiry] = useState({});
    const [selectedInquiry, setSelectedInquiry] = useState({});
    const [activeTab, setActiveTab] = useState('PENDING')
    const [modalState, setModalState] = useState({
        addInquiry: false,
        editInquiry: false,
        deleteInquiry: false,
        lostInquiry: false,
        proposals: false,
        addProposal: false,
        editProposal: false,
        followupsDetail: false,
        activityDetails: false,
        solutionDetails: false,
    });

    const filteredData = useMemo(() => {
        return data.filter((inquiry) => {
            if (activeTab === 'PENDING') return inquiry.status === 'PENDING';
            if (activeTab === 'CONFIRM') return inquiry.status === 'CONFIRM';
            if (activeTab === 'LOST') return inquiry.status === 'LOST';
            if (activeTab === 'ARCHIVED') return inquiry.status === 'ARCHIVED';
            return true;
        });
    }, [data, activeTab]);

    const pendingCount = data.filter((inquiry) => inquiry.status === "PENDING").length;
    const confirmCount = data.filter((inquiry) => inquiry.status === "CONFIRM").length;
    const lostCount = data.filter((inquiry) => inquiry.status === "LOST").length;
    const archivedCount = data.filter((inquiry) => inquiry.status === "ARCHIVED").length;

    useEffect(() => {
        fetchCounts();
    }, [modalState]);

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
                        <p className="mb-0">{row.company}</p>
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
            header: "Country / Source",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-0">{row.country}</h6>
                        <p className="mb-0">{row.source}</p>
                    </>
                );
            },
        },
        {
            accessorKey: "start_datetime",
            header: "Event dates",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        {row.start_datetime && <p className="mb-0 fs-2">{format(new Date(row.start_datetime), "dd MMM yyyy h:mm a")}</p>}
                        {row.end_datetime && <p className="mb-0 fs-2">{format(new Date(row.end_datetime), "dd MMM yyyy h:mm a")}</p>}
                    </>
                );
            },
        },
        {
            header: "Scope of work",
            cell: (props) => {
                const row = props.row.original;
                const scopeOfWork = row.scope_of_work;

                return (
                    <>
                        {scopeOfWork && (
                            <>
                                {scopeOfWork[0].solution?.length !== 0 && (
                                    <>
                                        <h6 className="fw-semibold mb-0">
                                            {scopeOfWork[0]?.solution} {scopeOfWork.length > 1 && " + " + (scopeOfWork.length - 1)}
                                        </h6>
                                    </>
                                )}
                            </>
                        )}
                    </>
                );
            },
        },
        {
            header: "Added",
            cell: (props) => {
                const row = props.row.original;
                return (
                    <>
                        <h6 className="fw-semibold mb-1">{row.user?.first_name}</h6>
                        {row.created_at && <p className="mb-0 fs-2">{format(new Date(row.created_at), "dd MMM yyyy h:mm a")}</p>}
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
                                {['PENDING', 'CONFIRM'].includes(data.find((inquiry) => inquiry.id === row.id)?.status) && (
                                    <li>
                                        <button className="dropdown-item" onClick={() => openEditInquiryModal(row)}>
                                            Edit inquiry
                                        </button>
                                    </li>
                                )}
                                {data.find((inquiry) => inquiry.id === row.id).status === 'PENDING' && (
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => openActionModal(row, 'CONFIRM')}
                                        >
                                            Mark as confirmed
                                        </button>
                                    </li>
                                )}
                                {['CONFIRM', 'PENDING'].includes(data.find((inquiry) => inquiry.id === row.id)?.status) && (
                                    <li>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => openActionModal(row, 'LOST')}
                                        >
                                            Mark as lost
                                        </button>
                                    </li>
                                )}

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

    const openAddInquiryModal = async () => {
        const response = await getCompanies();

        if (response.status === "ERROR") {
            toast.error(response.message);
            return;
        }

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
        }, 50);
    };

    const openEditInquiryModal = async (inquiry) => {
        const response = await getCompanies();

        if (response.status === "ERROR") {
            toast.error(response.message);
            return;
        }

        setEditingInquiry(inquiry);
        setCompanies(response.data);
        setModalState({ ...modalState, editInquiry: true });

        setTimeout(() => {
            openModal("edit-inquiry-modal");
        }, 50);
    };

    const closeEditInquiryModal = () => {
        closeModal("edit-inquiry-modal");

        setTimeout(() => {
            setModalState({ ...modalState, editInquiry: false });
            setEditingInquiry({});
            setCompanies([]);
        }, 50);
    };


    const openActionModal = (inquiry, actionType) => {
        setSelectedInquiry(inquiry);
        setModalState({
            ...modalState,
            lostInquiry: true,
            actionType: actionType
        });
        setTimeout(() => {
            openModal("lost-inquiry-modal");
        }, 50);
    };

    const closeLostInquiryModal = () => {
        closeModal("lost-inquiry-modal");

        setTimeout(() => {
            setModalState({ ...modalState, lostInquiry: false });
            setSelectedInquiry({});
        }, 50);
    };


    const handleExportCSV = () => {
        if (typeof window === "undefined") return;
        try {
            const csv = Papa.unparse({
                fields: [
                    "name",
                    "company",
                    "country",
                    "email",
                    "contact",
                    "source",
                    "start_datetime",
                    "end_datetime",
                    "status",
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
                <div className="col-md-6">
                </div>
                <div className="col-md-4 text-end">
                    <button type="button" className="btn btn-primary mt-3 mt-sm-0 me-2" onClick={() => openAddInquiryModal()}>
                        Add inquiry
                    </button>
                    <button type="button" className="btn btn-primary mt-3 mt-sm-0" onClick={() => handleExportCSV()}>
                        Export CSV
                    </button>
                </div>
            </div>
            <ul className="nav nav-tabs mb-3" id="inquiryTabs" role="tablist">
                <li className="nav-item" role="presentation">
                    <button
                        className={`btn mt-3 mt-sm-0 me-2 d-flex justify-content-between gap-2 ${activeTab === 'PENDING' ? 'btn btn-primary mt-3 mt-sm-0 me-2' : ''}`}
                        onClick={() => setActiveTab('PENDING')}
                    >
                        Pending  <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{pendingCount}</span>
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`btn mt-3 mt-sm-0 me-2 d-flex justify-content-between gap-2 ${activeTab === 'CONFIRM' ? 'btn btn-primary mt-3 mt-sm-0 me-2' : ''}`}
                        onClick={() => setActiveTab('CONFIRM')}
                    >
                        Confirmed <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{confirmCount}</span>
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`btn mt-3 mt-sm-0 me-2 d-flex justify-content-between gap-2 ${activeTab === 'LOST' ? 'btn btn-primary mt-3 mt-sm-0 me-2' : ''}`}
                        onClick={() => setActiveTab('LOST')}
                    >
                        Lost <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{lostCount}</span>
                    </button>
                </li>
                <li className="nav-item" role="presentation">
                    <button
                        className={`btn mt-3 mt-sm-0 me-2 d-flex justify-content-between gap-2 ${activeTab === 'ARCHIVED' ? 'btn btn-primary mt-3 mt-sm-0 me-2' : ''}`}
                        onClick={() => setActiveTab('ARCHIVED')}
                    >
                        Archived <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{archivedCount}</span>
                    </button>
                </li>
            </ul>
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

            {modalState.addInquiry && <AddInternationalInquiryModal onClose={closeAddInquiryModal} companies={companies} />}
            {modalState.editInquiry && <EditInternationalInquiryModal onClose={closeEditInquiryModal} editingInquiry={editingInquiry} companies={companies} />}
            {modalState.lostInquiry && (
                <InternationalLostConfirmModal
                    onClose={closeLostInquiryModal}
                    selectedInquiry={selectedInquiry}
                    actionType={modalState.actionType}
                />
            )}
        </>
    );
};

export default InternationalInquiriesDataTable;