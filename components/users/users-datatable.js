"use client";

import Link from "next/link";
import { useState } from "react";
import { openModal, closeModal } from "@/lib/utils";
import EditUserModal from "@/components/users/edit-user-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const UsersDataTable = ({ data }) => {
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [editingUser, setEditingUser] = useState({});
  const [modalState, setModalState] = useState({
    editUser: false,
  });

  const columns = [
    {
      header: "#",
      cell: (props) => <p className="mb-0">{props.row.index + 1}</p>,
    },
    {
      accessorKey: "first_name",
      header: "Full name",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.first_name + " " + row.last_name}</h6>
          </>
        );
      },
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.designation}</h6>
          </>
        );
      },
    },
    {
      header: "Type",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.type}</h6>
          </>
        );
      },
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-1">{row.country}</h6>
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
            {row.first_name !== "IMS" && (
              <div className="btn-group mb-2">
                <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="ti ti-dots-vertical"></i>
                </Link>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li>
                    <button className="dropdown-item" onClick={() => openEditUserModal(row)}>
                      Edit user
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

  const openEditUserModal = (user) => {
    setModalState({ ...modalState, editUser: true });
    setEditingUser(user);

    setTimeout(() => {
      openModal("edit-user-modal");
    }, 50);
  };

  const closeEditUserModal = () => {
    closeModal("edit-user-modal");

    setTimeout(() => {
      setModalState({ ...modalState, editUser: false });
      setEditingUser({});
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
        <div className="col-md-2 text-end"></div>
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
                  No archived softwares found.
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

      {modalState.editUser && <EditUserModal onClose={closeEditUserModal} editingUser={editingUser} />}
    </>
  );
};

export default UsersDataTable;
