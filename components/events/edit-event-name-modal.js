import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { editEventName } from "@/lib/actions";

const EditEventNameModal = ({ onClose, selectedEvent }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [eventName, setEventName] = useState("");

  useEffect(() => {
    if (selectedEvent.event_name) {
      handleEditName(selectedEvent);
      return;
    }
  }, [selectedEvent]);

  const closeEditEventNameModal = () => {
    setEventName("");
    onClose();
  };

  const onInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleEditName = (event) => {
    setEventName(event.event_name);
  };

  const handleEditEventName = async () => {
    try {
      if (!eventName) {
        toast.error("Please enter an event name.");
        return;
      }

      setWaiting(true);

      const event = {
        eventId: selectedEvent.id,
        eventName: eventName,
        activity: selectedEvent.activity,
      };

      const response = await editEventName(event);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("editEventName()", response.message);
        toast.error("Unable to edit event name.");
        return;
      }

      toast.success("Event name has been edited.");

      setWaiting(false);
      closeEditEventNameModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("updateEventName()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="edit-event-name-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit event name</h5>
            <button type="button" className="btn-close" onClick={closeEditEventNameModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <label htmlFor="eventName" className="mb-1">
                    Event name
                  </label>
                  <input type="text" id="eventName" autoComplete="off" className="form-control" value={eventName} onChange={onInputChange} required />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleEditEventName}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventNameModal;
