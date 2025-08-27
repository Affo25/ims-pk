import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { deleteInquiry } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DeleteInquiryModal = ({ onClose, selectedInquiry }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeDeleteInquiryModal = () => {
    onClose();
  };

  const handleDeleteInquiry = async () => {
    try {
      setWaiting(true);

      const response = await deleteInquiry(selectedInquiry);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("deleteInquiry()", response.message);
        toast.error("Unable to delete inquiry.");
        return;
      }

      toast.success("Inquiry has been deleted.");

      setWaiting(false);
      closeDeleteInquiryModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("deleteInquiry()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="delete-inquiry-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Delete inquiry</h5>
            <button type="button" className="btn-close" onClick={closeDeleteInquiryModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col text-center">
                  <p className="mb-0"> 
                    Are you sure you want to delete this inquiry? This action is irreversible and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleDeleteInquiry}>
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

export default DeleteInquiryModal;
