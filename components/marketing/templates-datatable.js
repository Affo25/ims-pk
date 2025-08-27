"use client";

import Link from "next/link";
import { format } from "date-fns";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import ContentModal from "@/components/marketing/content-modal";
import AddTemplateModal from "@/components/marketing/add-template-modal";
import EditTemplateModal from "@/components/marketing/edit-template-modal";
import DeleteTemplateModal from "@/components/marketing/delete-template-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const TemplatesDataTable = ({ data }) => {
  const { fetchCounts } = useCounts();
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [template, setTemplate] = useState({});
  const [showAll, setShowAll] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [modalState, setModalState] = useState({
    addTemplate: false,
    editTemplate: false,
    deleteTemplate: false,
    content: false,
  });

  const filteredData = useMemo(() => {
    return showAll ? data : data.filter((item) => item.type !== "AUTO");
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
      accessorKey: "key",
      header: "Key",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">[{row.key.toUpperCase()}]</p>
          </>
        );
      },
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
      header: "Sender details",
      cell: (props) => {
        const row = props.row.original;

        return (
          <>
            <h6 className="fw-semibold mb-0">{row.sender_name}</h6>
            <p className="mb-0">{row.from_email}</p>
          </>
        );
      },
    },
    {
      header: "Subject",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">{row.subject}</p>
          </>
        );
      },
    },
    {
      header: "Content",
      cell: (props) => {
        const row = props.row.original;

        return (
          <button className="btn link-dark link-offset-2 text-decoration-underline p-0" type="button" onClick={() => openContentModal(row)}>
            View content
          </button>
        );
      },
    },
    {
      header: "Added",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.user.first_name}</h6>
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
            {row.type === "USER" && (
              <div className="btn-group mb-2">
                <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="ti ti-dots-vertical"></i>
                </Link>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li>
                    <button className="dropdown-item" onClick={() => openEditTemplateModal(row)}>
                      Edit template
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => openDeleteTemplateModal(row)}>
                      Delete template
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

  const openAddTemplateModal = () => {
    setModalState({ ...modalState, addTemplate: true });

    setTimeout(() => {
      openModal("add-template-modal");
    }, 50);
  };

  const closeAddTemplateModal = () => {
    closeModal("add-template-modal");

    setTimeout(() => {
      setModalState({ ...modalState, addTemplate: false });
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

  const openEditTemplateModal = (template) => {
    setModalState({ ...modalState, editTemplate: true });
    setEditingTemplate(template);

    setTimeout(() => {
      openModal("edit-template-modal");
    }, 50);
  };

  const closeEditTemplateModal = () => {
    closeModal("edit-template-modal");

    setTimeout(() => {
      setModalState({ ...modalState, editTemplate: false });
      setEditingTemplate({});
    }, 50);
  };

  const openDeleteTemplateModal = (template) => {
    setModalState({ ...modalState, deleteTemplate: true });
    setSelectedTemplate(template);

    setTimeout(() => {
      openModal("delete-template-modal");
    }, 50);
  };

  const closeDeleteTemplateModal = () => {
    closeModal("delete-template-modal");

    setTimeout(() => {
      setModalState({ ...modalState, deleteTemplate: false });
      setSelectedTemplate({});
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
          "from_email",
          "sender_name",
          "status",
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
            <span className="me-5">Show all templates</span>
            <input className="form-check-input" type="checkbox" id="showAll" checked={showAll} onChange={onToggleChange} />
          </div>
        </div>
        <div className="col-md-2"></div>
        <div className="col-md-4 text-end">
          <button type="button" className="btn btn-primary mt-3 mt-sm-0 me-2" onClick={() => openAddTemplateModal()}>
            Add template
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
                  No templates found.
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

      {modalState.addTemplate && <AddTemplateModal onClose={closeAddTemplateModal} />}
      {modalState.editTemplate && <EditTemplateModal onClose={closeEditTemplateModal} editingTemplate={editingTemplate} />}
      {modalState.deleteTemplate && <DeleteTemplateModal onClose={closeDeleteTemplateModal} selectedTemplate={selectedTemplate} />}
      {modalState.content && <ContentModal onClose={closeContentModal} template={template} />}
    </>
  );
};

export default TemplatesDataTable;
