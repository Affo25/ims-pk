import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cancelEvent } from "@/lib/actions";

const CancelEventModal = ({ onClose, selectedEvent }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const onInputChange = (e) => {
    setCancelReason(e.target.value);
  };

  const closeCancelEventModal = () => {
    setCancelReason("");
    onClose();
  };

  const handleCancelEvent = async () => {
    try {
      if (!cancelReason) {
        toast.error("Please enter the reason.");
        return;
      }

      setWaiting(true);

      const event = { ...selectedEvent, cancelled_reason: cancelReason };

      const response = await cancelEvent(event);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("cancelEvent()", response.message);
        toast.error("Unable to mark event as cancelled.");
        return;
      }

      toast.success("Event has been marked as cancelled.");

      setWaiting(false);
      closeCancelEventModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("cancelEvent()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="cancel-event-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cancel event</h5>
            <button type="button" className="btn-close" onClick={closeCancelEventModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <p className="text-center">Are you sure you want to mark this event as cancelled?</p>
                  <label htmlFor="cancelReason" className="mb-1">
                    Cancel reason
                  </label>
                  <input type="text" id="cancelReason" autoComplete="off" className="form-control" value={cancelReason} onChange={onInputChange} required />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleCancelEvent}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Mark as cancelled"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelEventModal;
