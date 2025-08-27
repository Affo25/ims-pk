"use client";

import Link from "next/link";
import { format } from "date-fns";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const CampaignReportsDataTable = ({ data }) => {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const filteredData = useMemo(() => {
    return showAll ? data : data.filter((item) => item.status !== "ARCHIVED");
  }, [data, showAll]);

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
      accessorKey: "send_on",
      header: "List / Sent on",
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
      header: "Sent",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">{row.sent ? row.sent : 0}</p>
          </>
        );
      },
    },
    {
      header: "Opens",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">{row.opens ? row.opens : 0}</p>
          </>
        );
      },
    },
    {
      header: "Clicks",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">{row.clicks ? row.clicks : 0}</p>
          </>
        );
      },
    },
    {
      header: "Bounce",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <p className="mb-0">{row.hard_bounce ? row.hard_bounce : 0}</p>
          </>
        );
      },
    },
    {
      header: "Report",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <Link className="btn link-dark link-offset-2 text-decoration-underline p-0" href={"/marketing/campaign-reports/" + row.id}>
              View report
            </Link>
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
          "send_to",
          "send_on:",
          "status:",
          "type:",
          "sent",
          "opens:",
          "clicks:",
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
            <span className="me-5">Show all campaign reports</span>
            <input className="form-check-input" type="checkbox" id="showAll" checked={showAll} onChange={onToggleChange} />
          </div>
        </div>
        <div className="col-md-4"></div>
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
                  No campaign reports found.
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

export default CampaignReportsDataTable;
