import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { deleteTemplate } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DeleteTemplateModal = ({ onClose, selectedTemplate }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeDeleteTemplateModal = () => {
    onClose();
  };

  const handleDeleteTemplate = async () => {
    try {
      setWaiting(true);

      const response = await deleteTemplate(selectedTemplate);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("deleteTemplate()", response.message);
        toast.error("Unable to delete template.");
        return;
      }

      toast.success("Template has been deleted.");

      setWaiting(false);
      closeDeleteTemplateModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("deleteTemplate()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="delete-template-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Delete template</h5>
            <button type="button" className="btn-close" onClick={closeDeleteTemplateModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col text-center">
                  <p>
                    Are you sure you want to delete this template? <br /> This action is irreversible and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleDeleteTemplate}>
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

export default DeleteTemplateModal;
