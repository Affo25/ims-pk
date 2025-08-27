"use client";

import Link from "next/link";
import Papa from "papaparse";
import { format } from "date-fns";
import { userData } from "@/lib/data";
import { toast } from "react-hot-toast";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getCompanies, getProposals } from "@/lib/actions";
import ProposalsModal from "@/components/sales/proposals-modal";
import LostInquiryModal from "@/components/sales/lost-inquiry-modal";
import EditInquiryModal from "@/components/sales/edit-inquiry-modal";
import AddProposalModal from "@/components/sales/add-proposal-modal";
import EditProposalModal from "@/components/sales/edit-proposal-modal";
import ConfirmInquiryModal from "@/components/sales/confirm-inquiry-modal";
import SolutionDetailsModal from "@/components/sales/solution-details-modal";
import ActivityDetailsModal from "@/components/sales/activity-details-modal";
import FollowupsDetailsModal from "@/components/sales/followups-details-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const SubmittedInquiriesDataTable = ({ data }) => {
  const { fetchCounts } = useCounts();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [companies, setCompanies] = useState([]);
  const salesPeople = ["Ben", "Saqib", "Youssef", "Shubhneet", "Modar"];
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [proposalsData, setProposalsData] = useState([]);
  const [editingInquiry, setEditingInquiry] = useState({});
  const [solutionDetails, setSolutionDetails] = useState({});
  const [activityDetails, setActivityDetails] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState({});
  const [selectedProposal, setSelectedProposal] = useState({});
  const [modalState, setModalState] = useState({
    editInquiry: false,
    confirmInquiry: false,
    lostInquiry: false,
    proposals: false,
    addProposal: false,
    editProposal: false,
    activityDetails: false,
    followupsDetail: false,
    solutionDetails: false,
  });

  const filteredData = useMemo(() => {
    return selectedSalesperson ? data.filter((item) => item?.user?.first_name === selectedSalesperson) : data;
  }, [data, selectedSalesperson]);

  const filteredCount = filteredData.length;

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
      accessorKey: "total_amount",
      header: "Total amount",
      cell: (props) => {
        const row = props.row.original;
        const user = userData.find((user) => user.country === row.user?.country);

        return (
          <>
            <h6 className="fw-semibold mb-0">
              {user.currency} {row.total_amount ? Number(row.total_amount).toLocaleString("en") : 0}
            </h6>
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
                    <button className="btn link-dark link-offset-2 text-decoration-underline p-0" type="button" onClick={() => openSolutionDetailsModal(row)}>
                      View details
                    </button>
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
              <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                <i className="ti ti-dots-vertical"></i>
              </Link>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li>
                  <button className="dropdown-item" onClick={() => openEditInquiryModal(row)}>
                    Edit inquiry
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => openConfirmInquiryModal(row)}>
                    Mark as confirmed
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => openLostInquiryModal(row)}>
                    Mark as lost
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => openProposalsModal(row)}>
                    View proposals
                  </button>
                </li>
                {row.follow_ups.status !== "PENDING" && (
                  <li>
                    <button className="dropdown-item" onClick={() => openFollowupsDetailsModal(row)}>
                      View follow ups
                    </button>
                  </li>
                )}
                <li>
                  <button className="dropdown-item" onClick={() => openActivityDetailsModal(row)}>
                    View activity
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

  const openEditInquiryModal = async (inquiry) => {
    const response = await getCompanies();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setModalState({ ...modalState, editInquiry: true });
    setEditingInquiry(inquiry);
    setCompanies(response.data);

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

  const openConfirmInquiryModal = async (inquiry) => {
    const response = await getProposals(inquiry.id);
    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setProposalsData(response.data);
    setSelectedInquiry(inquiry);
    setModalState({ ...modalState, confirmInquiry: true });

    setTimeout(() => {
      openModal("confirm-inquiry-modal");
    }, 50);
  };

  const closeConfirmInquiryModal = () => {
    closeModal("confirm-inquiry-modal");

    setTimeout(() => {
      setModalState({ ...modalState, confirmInquiry: false });
      setProposalsData([]);
      setSelectedInquiry({});
    }, 50);
  };

  const openLostInquiryModal = (inquiry) => {
    setModalState({ ...modalState, lostInquiry: true });
    setSelectedInquiry(inquiry);

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

  const openProposalsModal = async (inquiry) => {
    const response = await getProposals(inquiry.id);

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setProposalsData(response.data);
    setSelectedInquiry(inquiry);
    setModalState({ ...modalState, proposals: true });

    setTimeout(() => {
      openModal("proposals-modal");
    }, 50);
  };

  const closeProposalsModal = () => {
    closeModal("proposals-modal");

    setTimeout(() => {
      setModalState({ ...modalState, proposals: false });
    }, 50);
  };

  const openAddProposalModal = async () => {
    setModalState({ ...modalState, addProposal: true });
    setTimeout(() => {
      openModal("add-proposal-modal");
    }, 50);
  };

  const closeAddProposalModal = () => {
    closeModal("add-proposal-modal");

    setTimeout(() => {
      setModalState({ ...modalState, addProposal: false });
      setSelectedInquiry({});
      setProposalsData([]);
    }, 50);
  };

  const openEditProposalModal = (proposal) => {
    setSelectedProposal(proposal);
    setModalState({ ...modalState, editProposal: true });
    setTimeout(() => {
      openModal("edit-proposal-modal");
    }, 50);
  };

  const closeEditProposalModal = () => {
    closeModal("edit-proposal-modal");

    setTimeout(() => {
      setSelectedInquiry({});
      setSelectedProposal({});
      setProposalsData([]);
      setModalState({ ...modalState, editProposal: false });
    }, 50);
  };

  const openActivityDetailsModal = async (inquiry) => {
    setModalState({ ...modalState, activityDetails: true });
    setActivityDetails(inquiry.activity);

    setTimeout(() => {
      openModal("activity-details-modal");
    }, 50);
  };

  const closeActivityDetailsModal = () => {
    closeModal("activity-details-modal");

    setTimeout(() => {
      setModalState({ ...modalState, activityDetails: false });
      setActivityDetails([]);
    }, 50);
  };

  const openFollowupsDetailsModal = async (inquiry) => {
    setModalState({ ...modalState, followupsDetail: true });
    setSelectedInquiry(inquiry);

    setTimeout(() => {
      openModal("followups-details-modal");
    }, 50);
  };

  const closeFollowupsDetailsModal = () => {
    closeModal("followups-details-modal");

    setTimeout(() => {
      setModalState({ ...modalState, followupsDetail: false });
      setSelectedInquiry({});
    }, 50);
  };

  const openSolutionDetailsModal = async (solution) => {
    setModalState({ ...modalState, solutionDetails: true });
    setSolutionDetails({
      scopeOfWork: solution.scope_of_work,
      location: solution.location,
      comments: solution.comments,
    });

    setTimeout(() => {
      openModal("solution-details-modal");
    }, 50);
  };

  const closeSolutionDetailsModal = () => {
    closeModal("solution-details-modal");

    setTimeout(() => {
      setModalState({ ...modalState, solutionDetails: false });
      setSolutionDetails({});
    }, 50);
  };

  const handleSalesPersonChange = (e) => {
    setSelectedSalesperson(e.target.value);
  };


  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    try {
      const exportData = data.map(item => ({
        ...item,
        sales_person: item.user?.first_name || ''
      }));

      const csv = Papa.unparse({
        fields: [
          "name",
          "sales_person",
          "company",
          "country",
          "email",
          "contact",
          "source",
          "start_datetime",
          "end_datetime",
          "total_amount",
          "created_at",
          "status",
        ],
        data: exportData,
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
        <div className="col-md-5" style={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>{filteredCount} :Submitted Inquiries</div>
        <div className="col-md-2 text-end">
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

      {modalState.editInquiry && <EditInquiryModal onClose={closeEditInquiryModal} editingInquiry={editingInquiry} companies={companies} />}
      {modalState.confirmInquiry && <ConfirmInquiryModal onClose={closeConfirmInquiryModal} selectedInquiry={selectedInquiry} proposalsData={proposalsData} />}
      {modalState.lostInquiry && <LostInquiryModal onClose={closeLostInquiryModal} selectedInquiry={selectedInquiry} />}
      {modalState.proposals && (
        <ProposalsModal
          onClose={closeProposalsModal}
          proposalsData={proposalsData}
          selectedInquiry={selectedInquiry}
          onAddProposalOpen={openAddProposalModal}
          onEditProposalOpen={openEditProposalModal}
        />
      )}
      {modalState.addProposal && <AddProposalModal onClose={closeAddProposalModal} selectedInquiry={selectedInquiry} />}
      {modalState.editProposal && <EditProposalModal onClose={closeEditProposalModal} selectedInquiry={selectedInquiry} selectedProposal={selectedProposal} />}
      {modalState.activityDetails && <ActivityDetailsModal onClose={closeActivityDetailsModal} activityDetails={activityDetails} />}
      {modalState.followupsDetail && <FollowupsDetailsModal onClose={closeFollowupsDetailsModal} selectedInquiry={selectedInquiry} />}
      {modalState.solutionDetails && <SolutionDetailsModal onClose={closeSolutionDetailsModal} solutionDetails={solutionDetails} />}
    </>
  );
};

export default SubmittedInquiriesDataTable;
