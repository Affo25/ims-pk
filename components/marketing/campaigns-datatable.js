"use client";

import Link from "next/link";
import { format } from "date-fns";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getLists, getTemplates } from "@/lib/actions";
import ContentModal from "@/components/marketing/content-modal";
import AddCampaignModal from "@/components/marketing/add-campaign-modal";
import ArchiveCampaignModal from "@/components/marketing/archive-campaign-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const CampaignsDataTable = ({ data }) => {
  const { fetchCounts } = useCounts();
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [template, setTemplate] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [templatesData, setTemplatesData] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState({});
  const [modalState, setModalState] = useState({
    addCampaign: false,
    archiveCampaign: false,
    content: false,
  });

  const filteredData = useMemo(() => {
    return showAll ? data : data.filter((item) => item.status !== "ARCHIVED");
  }, [data, showAll]);

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
      header: "Name",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">{row.name}</p>
          </>
        );
      },
    },
    {
      header: "Template",
      cell: (props) => {
        const row = props.row.original;
        const template = row.template;

        if (!template || !template.key) {
          return <span className="text-muted">No Template</span>;
        }

        return (
          <>
            <h6 className="fw-semibold mb-0">[{template.key.toUpperCase()}]</h6>
            <button
              className="btn link-dark link-offset-2 text-decoration-underline p-0"
              type="button"
              onClick={() => openContentModal(template)}
            >
              View content
            </button>
          </>
        );
      },
    },
    {
      header: "List / Send on",
      cell: (props) => {
        const row = props.row.original;
        const list = row.list;

        return (
          <>
            {list && <h6 className="fw-semibold mb-1 text-capitalize">{list}</h6>}
            <p className="mb-0 fs-2">{format(new Date(row.send_on), "dd MMM yyyy h:mm a")}</p>
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
            <p className="mb-0">{row.status}</p>
            {(row.status === "COMPLETED" || row.status === "ARCHIVED") && (
              <Link className="btn link-dark link-offset-2 text-decoration-underline p-0" href={"/marketing/campaign-reports/" + row.id}>
                View report
              </Link>
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
            <h6 className="fw-semibold mb-1">{row && row.user && row.user.first_name}</h6>
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
            {row.status !== "ARCHIVED" && (
              <div className="btn-group mb-2">
                <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="ti ti-dots-vertical"></i>
                </Link>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li>
                    <button className="dropdown-item" onClick={() => openArchiveCampaignModal(row)}>
                      Mark as archived
                    </button>
                  </li>
                </ul>
              </div>
            )}
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

  const openAddCampaignModal = async () => {
    let response = await getTemplates();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    const templates = response.data.filter((template) => template.type === "USER");
    setTemplatesData(templates);

    response = await getLists();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setLists(response.data);
    setModalState({ ...modalState, addCampaign: true });

    setTimeout(() => {
      openModal("add-campaign-modal");
    }, 50);
  };

  const closeAddCampaignModal = () => {
    closeModal("add-campaign-modal");

    setTimeout(() => {
      setModalState({ ...modalState, addCampaign: false });
      setTemplatesData([]);
      setLists([]);
    }, 50);
  };

  const openArchiveCampaignModal = (campaign) => {
    setModalState({ ...modalState, archiveCampaign: true });
    setSelectedCampaign(campaign);

    setTimeout(() => {
      openModal("archive-campaign-modal");
    }, 50);
  };

  const closeArchiveCampaignModal = () => {
    closeModal("archive-campaign-modal");

    setTimeout(() => {
      setModalState({ ...modalState, archiveCampaign: false });
      setSelectedCampaign({});
    }, 50);
  };

  const openContentModal = async (template) => {
    setModalState({ ...modalState, content: true });
    setTemplate(template);

    setTimeout(() => {
      openModal("content-modal");
    }, 50);
  };

  const closeContentModal = () => {
    closeModal("content-modal");

    setTimeout(() => {
      setModalState({ ...modalState, content: false });
      setTemplate({});
    }, 50);
  };

  const onToggleChange = () => {
    setShowAll(!showAll);
  };

  const handleExportCSV = () => {
    if (typeof window === "undefined") return;
    try {
      const csv = Papa.unparse({
        fields: [
          "name",
          "list",
          "send_on",
          "send_to",
          "type",

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
        <div className="col-md-4">
          <div className="form-check form-switch mt-3 mt-sm-0 p-0">
            <span className="me-5">Show all campaigns</span>
            <input className="form-check-input" type="checkbox" id="showAll" checked={showAll} onChange={onToggleChange} />
          </div>
        </div>
        <div className="col-md-2"></div>
        <div className="col-md-4 text-end">
          <button type="button" className="btn btn-primary mt-3 mt-sm-0 me-2" onClick={() => openAddCampaignModal()}>
            Add campaign
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
                  No campaigns found.
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

      {modalState.addCampaign && <AddCampaignModal onClose={closeAddCampaignModal} templatesData={templatesData} lists={lists} />}
      {modalState.archiveCampaign && <ArchiveCampaignModal onClose={closeArchiveCampaignModal} selectedCampaign={selectedCampaign} />}
      {modalState.content && <ContentModal onClose={closeContentModal} template={template} />}
    </>
  );
};

export default CampaignsDataTable;
