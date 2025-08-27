import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { editSoftwareDetails } from "@/lib/actions";

const EditSoftwareDetailsModal = ({ onClose, selectedSoftware }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [software, setSoftware] = useState({
    softwareDetails: "",
  });

  useEffect(() => {
    if (selectedSoftware) {
      handleSoftwareDetails(selectedSoftware);
      return;
    }
  }, [selectedSoftware]);

  const closeEditSoftwareDetailsModal = () => {
    setSoftware({
      softwareDetails: "",
    });
    onClose();
  };

  const onInputChange = (e) => {
    setSoftware({ ...software, softwareDetails: e.target.value });
  };

  const handleSoftwareDetails = (software) => {
    setSoftware({
      softwareDetails: software.softwareDetails ? software.softwareDetails : "",
    });
  };

  const handleEditSoftwareDetails = async () => {
    try {
      setWaiting(true);

      const event = {
        eventId: selectedSoftware.id,
        softwareDetails: software.softwareDetails,
        activity: selectedSoftware.activity,
      };

      const response = await editSoftwareDetails(event);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("editSoftwareDetails()", response.message);
        toast.error("Unable to edit software details.");
        return;
      }

      toast.success("Software details have been edited.");

      setWaiting(false);
      closeEditSoftwareDetailsModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("editSoftwareDetails()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="edit-software-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit software details</h5>
            <button type="button" className="btn-close" onClick={closeEditSoftwareDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <label htmlFor="softwareDetails" className="mb-1">
                    Software details
                  </label>
                  <textarea id="softwareDetails" autoComplete="off" className="form-control" rows={3} onChange={onInputChange} value={software.softwareDetails} required />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleEditSoftwareDetails}>
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

export default EditSoftwareDetailsModal;
