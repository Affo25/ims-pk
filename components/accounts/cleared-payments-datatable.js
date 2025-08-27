"use client";

import Link from "next/link";
import { format } from "date-fns";
import { userData } from "@/lib/data";
import { toast } from "react-hot-toast";
import { getInvoices } from "@/lib/actions";
import { useEffect, useState } from "react";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import InvoicesModal from "@/components/accounts/invoices-modal";
import ProposalsModal from "@/components/accounts/proposals-modal";
import ActivityDetailsModal from "@/components/accounts/activity-details-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const ClearedPaymentsDataTable = ({ data }) => {
  const { fetchCounts } = useCounts();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [proposalsData, setProposalsData] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState({});
  const [selectedPayment, setSelectedPayment] = useState({});
  const [activityDetails, setActivityDetails] = useState([]);

  const [modalState, setModalState] = useState({
    proposals: false,
    activityDetails: false,
    invoices: false,
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
      accessorKey: "event.event_name",
      header: "Event name",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.event.event_name}</h6>
          </>
        );
      },
    },
    {
      accessorKey: "inquiry.start_datetime",
      header: "Event dates",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            {row.inquiry?.start_datetime && <p className="mb-0 fs-2">{format(new Date(row.inquiry?.start_datetime), "dd MMM yyyy h:mm a")}</p>}
            {row.inquiry?.end_datetime && <p className="mb-0 fs-2">{format(new Date(row.inquiry?.end_datetime), "dd MMM yyyy h:mm a")}</p>}
          </>
        );
      },
    },
    {
      accessorKey: "inquiry.name",
      header: "Client info",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-0">{row.inquiry?.name}</h6>
            <p className="mb-0">{row.inquiry?.company}</p>
          </>
        );
      },
    },
    {
      accessorKey: "inquiry.email",
      header: "Contact details",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-0">{row.inquiry?.email}</h6>
            <p className="mb-0">{row.inquiry?.contact}</p>
          </>
        );
      },
    },
    {
      header: "Accountant details",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            {row.accountant_name && <h6 className="fw-semibold mb-0">{row.accountant_name}</h6>}
            {row.accountant_email && <p className="mb-0">{row.accountant_email}</p>}
          </>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total amount",
      cell: (props) => {
        const row = props.row.original;
        const user = userData.find((user) => user.country === row.inquiry?.user?.country);

        let totalAmount = 0;

        // row.proposals.forEach((proposal) => {
        //   totalAmount += proposal.total_amount;
        // });

        if (Array.isArray(row.proposals)) {
          row.proposals.forEach((proposal) => {
            totalAmount += parseFloat(proposal.total_amount) || 0;
          });
        }

        return (
          <>
            <h6 className="fw-semibold mb-0">
              {user.currency} {totalAmount ? Number(totalAmount).toLocaleString("en") : 0}
            </h6>
            <button className="btn link-dark link-offset-2 text-decoration-underline p-0" onClick={() => openProposalsModal(row.proposals, row.inquiry)}>
              View proposals
            </button>
          </>
        );
      },
    },
    {
      header: "Status",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.status}</h6>
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
                  <button className="dropdown-item" onClick={() => openInvoicesModal(row)}>
                    View invoices
                  </button>
                </li>
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

  const openProposalsModal = async (proposals, inquiry) => {
    setProposalsData(proposals);
    setSelectedInquiry(inquiry);
    setModalState({ ...modalState, proposals: true });

    setTimeout(() => {
      openModal("proposals-modal");
    }, 50);
  };

  const closeProposalsModal = () => {
    closeModal("proposals-modal");

    setTimeout(() => {
      setProposalsData([]);
      setSelectedInquiry({});
      setModalState({ ...modalState, proposals: false });
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

  const openInvoicesModal = async (payment) => {
    const response = await getInvoices(payment.id);

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setSelectedPayment(payment);
    setInvoicesData(response.data);
    setModalState({ ...modalState, invoices: true });

    setTimeout(() => {
      openModal("invoices-modal");
    }, 50);
  };

  const closeInvoicesModal = () => {
    closeModal("invoices-modal");

    setTimeout(() => {
      setModalState({ ...modalState, invoices: false });
    }, 50);
  };

  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    try {
      const csv = Papa.unparse({
        fields: [
          "accountant_name",
          "accountant_email",
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
        <div className="col-md-8"></div>
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
                  No payments found.
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

      {modalState.proposals && <ProposalsModal onClose={closeProposalsModal} proposalsData={proposalsData} selectedInquiry={selectedInquiry} />}
      {modalState.activityDetails && <ActivityDetailsModal onClose={closeActivityDetailsModal} activityDetails={activityDetails} />}
      {modalState.invoices && <InvoicesModal onClose={closeInvoicesModal} invoicesData={invoicesData} selectedPayment={selectedPayment} />}
    </>
  );
};

export default ClearedPaymentsDataTable;
