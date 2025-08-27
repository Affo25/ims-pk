import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { restoreCancelEvent } from "@/lib/actions";

const RestoreCancelEventModal = ({ onClose, selectedEvent }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeRestoreCancelEventModal = () => {
    onClose();
  };

  const handleRestoreCancelEvent = async () => {
    try {
      setWaiting(true);
      const response = await restoreCancelEvent(selectedEvent);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("restoreCancelEvent()", response.message);
        toast.error("Unable to mark event as active.");
        return;
      }

      toast.success("Event has been marked as active.");

      setWaiting(false);
      closeRestoreCancelEventModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("restoreCancelEvent()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="restore-cancel-event-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Restore cancel event</h5>
            <button type="button" className="btn-close" onClick={closeRestoreCancelEventModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <p className="text-center mb-0">Are you sure you want to mark this event as active?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleRestoreCancelEvent}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Mark as active"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestoreCancelEventModal;
