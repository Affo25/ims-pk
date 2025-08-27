"use client";

import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCounts } from "@/lib/use-counts";
import { updateSoftwareStatus } from "@/lib/actions";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { logger, openModal, closeModal } from "@/lib/utils";
import SoftwareDetailsModal from "@/components/development/software-details-modal";
import CreatePortalEventModal from "@/components/development/create-portal-event-modal";
import EditSoftwareDetailsModal from "@/components/development/edit-software-details-modal";

const SoftwareBoard = ({ data }) => {
  const router = useRouter();
  const { fetchCounts } = useCounts();
  const [softwareItems, setSoftwareItems] = useState([]);
  const [selectedSoftware, setSelectedSoftware] = useState({});
  const [modalState, setModalState] = useState({
    editSoftwareDetails: false,
    softwareDetails: false,
    createPortalEvent: false,
  });

  useEffect(() => {
    handleSoftwareList(data);
  }, [data]);

  const handleSoftwareList = (softwares) => {
    const softwareList = softwares.map((software) => ({
      id: software.id,
      eventName: software.event_name,
      startDatetime: software.start_datetime,
      endDatetime: software.end_datetime,
      portalEvents: software.portal_events,
      softwareDetails: software.software_details,
      softwareStatus: software.software_status,
      scopeOfWork: software.scope_of_work,
      salesManager: software.user.first_name,
      activity: software.activity,
    }));

    setSoftwareItems(softwareList);
  };

  const statuses = ["PENDING", "IN PROGRESS", "TESTING", "SNAGGING", "READY"];

  const handleSoftwareStatusUpdate = async (softwareItem, newStatus) => {
    try {
      const previousStatus = softwareItem.softwareStatus;
      softwareItem.softwareStatus = newStatus;

      const newSoftwareItems = [...softwareItems];
      setSoftwareItems(newSoftwareItems);

      const response = await updateSoftwareStatus(softwareItem);

      if (response.status === "ERROR") {
        softwareItem.softwareStatus = previousStatus;
        setSoftwareItems([...newSoftwareItems]);
        logger("handleSoftwareStatusUpdate()", response.message);
        toast.error("Failed to update status, reverting changes.");
        return;
      }

      router.refresh();
      fetchCounts();
      toast.success("Software status has been updated.");
    } catch (error) {
      softwareItem.softwareStatus = previousStatus;
      setSoftwareItems([...newSoftwareItems]);
      logger("handleSoftwareStatusUpdate()", error);
      toast.error("Something went wrong, reverting changes.");
    }
  };

  const moveCard = (taskId, toStatus) => {
    const movedSoftware = softwareItems.find((item) => item.id === taskId);
    handleSoftwareStatusUpdate(movedSoftware, toStatus);
  };

  const handleArchiveSoftware = (softwareItem) => {
    handleSoftwareStatusUpdate(softwareItem, "ARCHIVED");
  };

  const openEditSoftwareDetailsModal = async (softwareItem) => {
    setModalState({ ...modalState, editSoftwareDetails: true });
    setSelectedSoftware(softwareItem);

    setTimeout(() => {
      openModal("edit-software-details-modal");
    }, 50);
  };

  const closeEditSoftwareDetailsModal = () => {
    closeModal("edit-software-details-modal");

    setTimeout(() => {
      setModalState({ ...modalState, editSoftwareDetails: false });
      setSelectedSoftware({});
    }, 50);
  };

  const openCreatePortalEventModal = (softwareItem) => {
    setModalState({ ...modalState, createPortalEvent: true });
    setSelectedSoftware(softwareItem);

    setTimeout(() => {
      openModal("create-portal-event-modal");
    }, 50);
  };

  const closeCreatePortalEventModal = () => {
    closeModal("create-portal-event-modal");

    setTimeout(() => {
      setModalState({ ...modalState, createPortalEvent: false });
      setSelectedSoftware({});
    }, 50);
  };

  const openSoftwareDetailsModal = (softwareItem) => {
    setModalState({ ...modalState, softwareDetails: true });
    setSelectedSoftware(softwareItem);

    setTimeout(() => {
      openModal("software-details-modal");
    }, 50);
  };

  const closeSoftwareDetailsModal = () => {
    closeModal("software-details-modal");

    setTimeout(() => {
      setModalState({ ...modalState, softwareDetails: false });
      setSelectedSoftware({});
    }, 50);
  };

  const getItemsByStatus = (status) => softwareItems.filter((item) => item.softwareStatus === status);

  const Column = ({ status }) => {
    const [, drop] = useDrop({
      accept: "CARD",
      drop: (item) => {
        if (item.softwareStatus !== status) {
          moveCard(item.id, status, softwareItems.filter((item) => item.softwareStatus === status).length);
          item.softwareStatus = status;
          item.index = softwareItems.filter((item) => item.softwareStatus === status).length;
        }
      },
    });

    return (
      <div ref={drop} className="card kanban-column">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0 text-capitalize">{status}</h5>
        </div>
        <div className="kanban-card-body card-body p-3">
          {getItemsByStatus(status).map((item, index) => (
            <Card key={item.id} index={index} softwareItem={item} moveCard={moveCard} />
          ))}
        </div>
      </div>
    );
  };

  const Card = ({ softwareItem, index }) => {

    const [, ref] = useDrag({
      type: "CARD",
      item: { id: softwareItem.id, index, status: softwareItem.softwareStatus },
    });

    const [, drop] = useDrop({
      accept: "CARD",
      hover: (draggedItem) => {
        if (draggedItem.id !== softwareItem.id) {
          const dragIndex = softwareItems.findIndex((item) => item.id === draggedItem.id);
          const hoverIndex = softwareItems.findIndex((item) => item.id === softwareItem.id);
          if (dragIndex !== hoverIndex) {
            const newSoftwareItems = [...softwareItems];
            const [removed] = newSoftwareItems.splice(dragIndex, 1);
            newSoftwareItems.splice(hoverIndex, 0, removed);
            setSoftwareItems(newSoftwareItems);
            draggedItem.index = hoverIndex;
          }
        }
      },
    });

    // const parsedScopeOfWork = softwareItem.scopeOfWork
    //   ? JSON.parse(softwareItem.scopeOfWork)
    //   : [];


    // const parsedScopeOfWork = Array.isArray(softwareItem.scopeOfWork)
    //   ? softwareItem.scopeOfWork
    //   : [];

    let parsedScopeOfWork = [];

    if (typeof softwareItem.scopeOfWork === "string") {
      try {
        parsedScopeOfWork = JSON.parse(softwareItem.scopeOfWork);
      } catch (e) {
        parsedScopeOfWork = [];
      }
    } else if (Array.isArray(softwareItem.scopeOfWork)) {
      parsedScopeOfWork = softwareItem.scopeOfWork;
    }


    return (
      <div ref={(node) => ref(drop(node))} className="card kanban-task">
        <div className="card-body p-0">
          <h6 className="card-title fw-semibold mb-3">{softwareItem.eventName}</h6>
          <hr />
          <p className="fw-semibold mb-1">Solution details</p>
          {parsedScopeOfWork.map((sow, index) => (
            <div className="mb-2" key={index}>
              <ul className="list-group">
                <li style={{ whiteSpace: "pre-wrap" }}>{sow.solution}</li>
                {sow.extras?.map((extra, index) => (
                  <li style={{ whiteSpace: "pre-wrap" }} key={index}>
                    - {extra}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {softwareItem.portalEvents?.length > 0 && (
            <>
              <hr />
              <div className="mb-2">
                <p className="fw-semibold mb-1">Event codes</p>
                {softwareItem.portalEvents.map((portalEvent, index) => (
                  <p className="mb-0" key={index}>
                    {portalEvent.solution} - {portalEvent.event_code}
                  </p>
                ))}
              </div>
            </>
          )}
          <hr />
          <div className="d-flex justify-content-between align-items-center mt-2">
            <div>
              <div className="d-flex align-items-center mb-2">
                <i className="ti ti-calendar me-2"></i>
                <p className="card-text fs-2">{format(new Date(softwareItem.startDatetime), "dd MMM yyyy")}</p>
              </div>
              <span className="badge fs-2 text-bg-primary">{softwareItem.salesManager}</span>
            </div>

            <div className="btn-group">
              <Link className="dropdown-toggle" id="dropdownMenuButton" href={{}} data-bs-toggle="dropdown" aria-expanded="false">
                <i className="ti ti-dots-vertical"></i>
              </Link>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <li>
                  <button className="dropdown-item" onClick={() => openCreatePortalEventModal(softwareItem)}>
                    Create portal event(s)
                  </button>
                  <button className="dropdown-item" onClick={() => openEditSoftwareDetailsModal(softwareItem)}>
                    Edit software details
                  </button>
                  {softwareItem.softwareDetails && (
                    <button className="dropdown-item" onClick={() => openSoftwareDetailsModal(softwareItem)}>
                      View software details
                    </button>
                  )}
                  {softwareItem.softwareStatus === "READY" && (
                    <button className="dropdown-item" onClick={() => handleArchiveSoftware(softwareItem)}>
                      Mark as archived
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {data?.length > 0 ? (
        <DndProvider backend={HTML5Backend}>
          <div className="kanban-board container-fluid">
            <div className="row">
              {statuses.map((status) => (
                <div key={status} className="col mb-3">
                  <Column status={status} />
                </div>
              ))}
            </div>
          </div>
        </DndProvider>
      ) : (
        <p>No softwares found.</p>
      )}
      {modalState.editSoftwareDetails && <EditSoftwareDetailsModal onClose={closeEditSoftwareDetailsModal} selectedSoftware={selectedSoftware} />}
      {modalState.softwareDetails && <SoftwareDetailsModal onClose={closeSoftwareDetailsModal} selectedSoftware={selectedSoftware} />}
      {modalState.createPortalEvent && <CreatePortalEventModal onClose={closeCreatePortalEventModal} selectedSoftware={selectedSoftware} />}
    </>
  );
};

export default SoftwareBoard;
