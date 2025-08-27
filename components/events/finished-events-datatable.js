"use client";

import Link from "next/link";
import Papa from "papaparse";
import { format } from "date-fns";
import { reportUrl } from "@/lib/data";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import SendReportModal from "@/components/events/send-report-modal";
import ActivityDetailsModal from "@/components/events/activity-details-modal";
import SolutionDetailsModal from "@/components/events/solution-details-modal";
import LogisticsDetailsModal from "@/components/events/logistics-details-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const FinishedEventsDataTable = ({ data }) => {
  const { fetchCounts } = useCounts();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [activityDetails, setActivityDetails] = useState([]);
  const [solutionDetails, setSolutionDetails] = useState({});
  const [logisticsDetails, setLogisticsDetails] = useState([]);
  const [modalState, setModalState] = useState({
    activityDetails: false,
    solutionDetails: false,
    logisticsDetails: false,
    sendReport: false,
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
      accessorKey: "event_name",
      header: "Event name",
      cell: (props) => {
        const row = props.row.original;
        return <>{row?.event_name && <h6 className="fw-semibold mb-1">{row.event_name}</h6>}</>;
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
      header: "Solution details",
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
      header: "Logistics details",
      cell: (props) => {
        const row = props.row.original;

        return (
          <button className="btn link-dark link-offset-2 text-decoration-underline p-0" type="button" onClick={() => openLogisticsDetailsModal(row)}>
            View details
          </button>
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
                  <button className="dropdown-item" onClick={() => openSendReportModal(row)}>
                    Send report
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => openViewReport(row)}>
                    View report
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

  const openSolutionDetailsModal = (solution) => {
    setModalState({ ...modalState, solutionDetails: true });
    setSolutionDetails({
      scopeOfWork: solution.scope_of_work,
      salesManager: solution.user.first_name,
      eventComments: solution.event_comments,
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

  const openLogisticsDetailsModal = async (logistics) => {
    setModalState({ ...modalState, logisticsDetails: true });
    setLogisticsDetails({
      eventName: logistics.event_name,
      eventStartDateTime: logistics.start_datetime,
      eventEndDateTime: logistics.end_datetime,
      promoters: logistics.promoters,
      location: logistics.location,
      locationComments: logistics.location_comments,
      permitsNeeded: logistics.permits_needed,
      brandingNeeded: logistics.branding_needed,
      installationDateTime: logistics.installation_datetime,
      removalDateTime: logistics.removal_datetime,
      contactPersonName: logistics.contact_person_name,
      contactPersonNumber: logistics.contact_person_number,
      solutionDetails: logistics.scope_of_work,
    });

    setTimeout(() => {
      openModal("logistics-details-modal");
    }, 50);
  };

  const closeLogisticsDetailsModal = () => {
    closeModal("logistics-details-modal");

    setTimeout(() => {
      setModalState({ ...modalState, logisticsDetails: false });
      setLogisticsDetails({});
    }, 50);
  };

  const openSendReportModal = (event) => {
    const eventCodes = event.portal_events.map((software) => software.event_code);

    if (eventCodes.length === 0) {
      toast.error("Please add the event code(s) first.");
      return;
    }

    setModalState({ ...modalState, sendReport: true });
    setSelectedEvent(event);

    setTimeout(() => {
      openModal("send-report-modal");
    }, 50);
  };

  const closeSendReportModal = () => {
    closeModal("send-report-modal");

    setTimeout(() => {
      setModalState({ ...modalState, sendReport: false });
      setSelectedEvent({});
    }, 50);
  };

  const openViewReport = (event) => {
    const eventCodes = event.portal_events.map((software) => software.event_code);

    if (eventCodes.length === 0) {
      toast.error("Please add the event code(s) first.");
      return;
    }

    const reportLink = reportUrl + eventCodes[0] + "?ids=" + eventCodes;
    window.open(reportLink);
  };

  const openActivityDetailsModal = async (event) => {
    setModalState({ ...modalState, activityDetails: true });
    setActivityDetails(event.activity);

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

  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    try {
      const csv = Papa.unparse({
        fields: [
          "event_name",
          "name",
          "company",
          "country",
          "email",
          "contact",
          "contact_person_name",
          "contact_person_number",
          "start_datetime",
          "end_datetime",
          "removal_datetime",
          "status",
          "software_status",
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
                  No events found.
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

      {modalState.activityDetails && <ActivityDetailsModal onClose={closeActivityDetailsModal} activityDetails={activityDetails} />}
      {modalState.solutionDetails && <SolutionDetailsModal onClose={closeSolutionDetailsModal} solutionDetails={solutionDetails} />}
      {modalState.logisticsDetails && <LogisticsDetailsModal onClose={closeLogisticsDetailsModal} logisticsDetails={logisticsDetails} />}
      {modalState.sendReport && <SendReportModal onClose={closeSendReportModal} selectedEvent={selectedEvent} />}
    </>
  );
};

export default FinishedEventsDataTable;
