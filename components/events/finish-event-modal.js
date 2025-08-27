import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { finishEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";

const FinishEventModal = ({ onClose, selectedEvent }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeFinishEventModal = () => {
    onClose();
  };

  const handleFinishEvent = async () => {
    try {
      setWaiting(true);

      const response = await finishEvent(selectedEvent);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("finishEvent()", response.message);
        toast.error("Unable to mark this event as finished.");
        return;
      }

      toast.success("Event has been marked as finished.");

      setWaiting(false);
      closeFinishEventModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("finishEvent()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="finish-event-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Finish event</h5>
            <button type="button" className="btn-close" onClick={closeFinishEventModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col text-center">
                  <p className="mb-0">
                    Are you sure you want to mark this event as finished? <br /> This action is irreversible and will send a finish email to the client.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleFinishEvent}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Mark as finished"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinishEventModal;
