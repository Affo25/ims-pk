"use client";

import Link from "next/link";
import Papa from "papaparse";
import { format } from "date-fns";
import { userData } from "@/lib/data";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useCounts } from "@/lib/use-counts";
import { openModal, closeModal } from "@/lib/utils";
import { getLists, getCompanies } from "@/lib/actions";
import AddClientModal from "@/components/marketing/add-client-modal";
import UploadCSVModal from "@/components/marketing/upload-csv-modal";
import EditClientModal from "@/components/marketing/edit-client-modal";
import DeleteClientModal from "@/components/marketing/delete-client-modal";
import { useReactTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";

const ClientsDataTable = ({ data }) => {
  const { fetchCounts } = useCounts();
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [editingClient, setEditingClient] = useState({});
  const [selectedClient, setSelectedClient] = useState({});
  const [selectedList, setSelectedList] = useState("");
  // const [loading, setLoading] = useState(false);
  // const [statusMessage, setStatusMessage] = useState("");
  const [modalState, setModalState] = useState({
    addClient: false,
    editClient: false,
    deleteClient: false,
    uploadCSV: false,
  });

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedList) {
      result = result.filter((item) => item.list === selectedList);
    }

    return result;
  }, [data, selectedList]);

  const filteredCount = filteredData.length;

  useEffect(() => {
    fetchLists();
    fetchCounts();
  }, [modalState]);

  const fetchLists = async () => {
    try {
      const response = await getLists();
      if (response.status === "ERROR") {
        toast.error(response.message);
        return;
      }
      setLists(response.data);
    } catch (error) {
      toast.error("Failed to fetch lists");
      console.error("Error fetching lists:", error);
    }
  };

  // useEffect(() => {
  //   const runBirthdayCampaign = async () => {
  //     setLoading(true);
  //     const response = await getBirthdayClients();

  //     if (response.status === "ERROR") {
  //       console.error("getBirthdayClients error:", response.message);
  //       setStatusMessage("Error fetching birthday clients.");
  //       setLoading(false);
  //       return;
  //     }

  //     const clients = response.data;

  //     if (!clients || clients.length === 0) {
  //       setStatusMessage("No birthdays today.");
  //       setLoading(false);
  //       return;
  //     }

  //     const currentYear = new Date().getFullYear();

  //     for (const client of clients) {
  //       const lastWishedYear = client.last_wished_datetime
  //         ? new Date(client.last_wished_datetime).getFullYear()
  //         : null;

  //       if (lastWishedYear === currentYear) {
  //         continue;
  //       }



  //       const result = await addBirthdayCampaign(client);

  //       if (result.status === "ERROR") {
  //         console.error("Error adding birthday campaign:", result.message);
  //         setStatusMessage("Error sending campaign.");
  //         setLoading(false);
  //         return;
  //       }
  //     }

  //     setStatusMessage("Birthday campaigns created successfully.");
  //     setLoading(false);
  //   };

  //   runBirthdayCampaign();
  // }, []);

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
      header: "Website",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-0">
              <a href={row.website} target="_blank">
                {row.website}
              </a>
            </h6>
          </>
        );
      },
    },

    {
      accessorKey: "date_of_birth",
      header: "Date of birth / Last wished",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            {row.date_of_birth && <h6 className="fw-semibold mb-0">{format(new Date(row.date_of_birth), "dd MMM")}</h6>}
            {row.last_wished_datetime ? <p className="mb-0 fs-2">{format(new Date(row.last_wished_datetime), "dd MMM yyyy h:mm a")}</p> : "N/A"}
          </>
        );
      },
    },
    {
      header: "Inquiries / Events",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-0">
              {row.total_inquiries ? row.total_inquiries : 0} / {row.total_events ? row.total_events : 0}
            </h6>
          </>
        );
      },
    },
    {
      accessorKey: "total_spent",
      header: "Total spent",
      cell: (props) => {
        const row = props.row.original;
        const user = userData.find((user) => user.country === row.user?.country);

        return (
          <>
            <h6 className="fw-semibold mb-0">{row.total_spent && user && user.currency + " " + Number(row.total_spent).toLocaleString("en")}</h6>
          </>
        );
      },
    },
    {
      header: "List / Subscribed",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="fw-semibold mb-0 text-capitalize">{row.list}</h6>
            <p className="mb-0">{row.subscribed ? "Yes" : "No"}</p>
          </>
        );
      },
    },
    {
      header: "Fish",
      cell: (props) => {
        const row = props.row.original;
        return (
          <>
            <h6 className="mb-0">{row.fish}</h6>
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
            <div className="btn-group mb-2">
              <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                <i className="ti ti-dots-vertical"></i>
              </Link>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li>
                  <button className="dropdown-item" onClick={() => openEditClientModal(row)}>
                    Edit client
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => openDeleteClientModal(row)}>
                    Mark as deleted
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

  const openAddClientModal = async () => {
    let response = await getLists();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setLists(response.data);

    response = await getCompanies();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setCompanies(response.data);
    setModalState({ ...modalState, addClient: true });

    setTimeout(() => {
      openModal("add-client-modal");
    }, 50);
  };

  const closeAddClientModal = () => {
    closeModal("add-client-modal");

    setTimeout(() => {
      setModalState({ ...modalState, addClient: false });
      setLists([]);
      setCompanies([]);
    }, 50);
  };

  const openEditClientModal = async (client) => {
    let response = await getLists();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setLists(response.data);

    response = await getCompanies();

    if (response.status === "ERROR") {
      toast.error(response.message);
      return;
    }

    setCompanies(response.data);

    setModalState({ ...modalState, editClient: true });
    setEditingClient(client);
    setTimeout(() => {
      openModal("edit-client-modal");
    }, 50);
  };

  const closeEditClientModal = () => {
    closeModal("edit-client-modal");

    setTimeout(() => {
      setModalState({ ...modalState, editClient: false });
      setEditingClient({});
      setLists([]);
      setCompanies([]);
    }, 50);
  };

  const openDeleteClientModal = (client) => {
    setModalState({ ...modalState, deleteClient: true });
    setSelectedClient(client);

    setTimeout(() => {
      openModal("delete-client-modal");
    }, 50);
  };

  const closeDeleteClientModal = () => {
    closeModal("delete-client-modal");

    setTimeout(() => {
      setModalState({ ...modalState, deleteClient: false });
      setSelectedClient({});
    }, 50);
  };

  const openUploadCSVModal = () => {
    setModalState({ ...modalState, uploadCSV: true });

    setTimeout(() => {
      openModal("upload-csv-modal");
    }, 50);
  };

  const closeUploadCSVModal = () => {
    closeModal("upload-csv-modal");

    setTimeout(() => {
      setModalState({ ...modalState, uploadCSV: false });
    }, 50);
  };

  const handleListChange = (e) => {
    setSelectedList(e.target.value);
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
          "website",
          "date_of_birth",
          "total_inquiries",
          "total_events",
          "last_event_date",
          "last_wished_date",
          "list",
          "subscribed",
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
              Add List
            </span>
            <select
              className="form-select"
              id="list-filter"
              value={selectedList}
              onChange={handleListChange}
            >
              <option value="">All</option>
              {lists.map((list) => (
                <option key={list.name} value={list.name}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-md-1" style={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>{filteredCount} :Client</div>
        <div className="col-md-6 text-end">
          <button type="button" className="btn btn-primary mt-3 mt-sm-0 me-2" onClick={() => openAddClientModal()}>
            Add client
          </button>
          <button type="button" className="btn btn-primary mt-3 mt-sm-0 me-2" onClick={() => openUploadCSVModal()}>
            Upload CSV
          </button>
          <button type="button" className="btn btn-primary mt-3 mt-sm-0" onClick={() => handleExportCSV()}>
            Export CSV
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
                  No clients found.
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

      {modalState.addClient && <AddClientModal onClose={closeAddClientModal} lists={lists} companies={companies} />}
      {modalState.editClient && <EditClientModal onClose={closeEditClientModal} editingClient={editingClient} lists={lists} companies={companies} />}
      {modalState.deleteClient && <DeleteClientModal onClose={closeDeleteClientModal} selectedClient={selectedClient} />}
      {modalState.uploadCSV && < UploadCSVModal onClose={closeUploadCSVModal} />}
    </>
  );
};

export default ClientsDataTable;
