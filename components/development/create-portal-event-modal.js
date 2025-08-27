import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createPortalEvent } from "@/lib/actions";
import axios from "axios";

const CreatePortalEventModal = ({ onClose, selectedSoftware }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState([]);

  const closeCreatePortalEventModal = () => {
    setSelectedSolution([]);
    onClose();
  };

  const handleSolutionSelect = (solution) => {
    const solutionToSave = Array.isArray(solution) ? solution[0] : solution;
    setSelectedSolution((prevSelected) => {
      if (prevSelected.includes(solutionToSave)) {
        return [];
      } else {
        return [solutionToSave];
      }
    });
  };

  const handleCreatePortalEvent = async () => {
    try {
      if (selectedSolution.length === 0) {
        toast.error("Please choose a solution first.");
        return;
      }

      setWaiting(true);

      const data = {
        selectedSoftware,
        selectedSolution,
      };

      const response = await axios.post("/api/create-portal-event", data);
      if (response.data.status === "ERROR") {
        setWaiting(false);

        logger("createPortalEvent()", response.data.message);
        toast.error(response.data.message);
        return;
      }

      toast.success("Event has been created on the portal.");
      setWaiting(false);
      closeCreatePortalEventModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("createPortalEvent()", error);
      toast.error("Something went wrong.");
    }
  };

  const parsedScopeOfWork = Array.isArray(selectedSoftware?.scopeOfWork)
    ? selectedSoftware.scopeOfWork
    : JSON.parse(selectedSoftware?.scopeOfWork || "[]");

  return (
    <div className="modal fade" id="create-portal-event-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create portal event(s)</h5>
            <button type="button" className="btn-close" onClick={closeCreatePortalEventModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                {parsedScopeOfWork.map((sow, index) => (
                  <div className="col-md-6" key={index}>
                    <div className={"card " + (selectedSolution.includes(sow.solution[0]) ? "selected-card" : "")}>
                      <div className="card-body">
                        {!selectedSoftware.portalEvents?.some((event) => event.solution === (Array.isArray(sow.solution) ? sow.solution[0] : sow.solution)) && (
                          <div className="form-check solution-check p-0 m-0">
                            <input
                              type="checkbox"
                              className="form-check-input p-0 m-0"
                              checked={selectedSolution.includes(Array.isArray(sow.solution) ? sow.solution[0] : sow.solution)}
                              onChange={() => handleSolutionSelect(Array.isArray(sow.solution) ? sow.solution[0] : sow.solution)}
                            />
                          </div>
                        )}
                        {sow.solution?.length !== 0 && (
                          <div>
                            <h6 className="fw-semibold">Solution</h6>
                            <p className="mb-3">{Array.isArray(sow.solution) ? sow.solution[0] : sow.solution}</p>
                          </div>
                        )}
                        <div>
                          <h6 className="fw-semibold">Event code</h6>
                          <p className="mb-0">{selectedSoftware.portalEvents?.find((event) => event.solution === (Array.isArray(sow.solution) ? sow.solution[0] : sow.solution))?.event_code || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary btn-sm mt-3" onClick={() => handleCreatePortalEvent()}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Create portal event"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePortalEventModal;
