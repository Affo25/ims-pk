import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { deleteClient } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DeleteClientModal = ({ onClose, selectedClient }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeDeleteClientModal = () => {
    onClose();
  };

  const handleDeleteClient = async () => {
    try {
      setWaiting(true);

      const response = await deleteClient(selectedClient);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("deleteClient()", response.message);
        toast.error("Unable to delete client.");
        return;
      }

      toast.success("Client has been deleted.");

      setWaiting(false);
      closeDeleteClientModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("deleteClient()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="delete-client-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Delete client</h5>
            <button type="button" className="btn-close" onClick={closeDeleteClientModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col text-center">
                  <p className="mb-0">
                    Are you sure you want to delete this client? <br /> This action is irreversible and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleDeleteClient}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientModal;
