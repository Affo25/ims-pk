import { useState } from "react";
import { logger } from "@/lib/utils";
import { lostInquiry } from "@/lib/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const LostInquiryModal = ({ onClose, selectedInquiry }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [lostReason, setLostReason] = useState("");

  const onInputChange = (e) => {
    setLostReason(e.target.value);
  };

  const closeLostInquiryModal = () => {
    setLostReason("");
    onClose();
  };

  const handleLostInquiry = async () => {
    try {
      if (!lostReason) {
        toast.error("Please enter the reason.");
        return;
      }

      setWaiting(true);

      const inquiry = { ...selectedInquiry, lost_reason: lostReason };

      const response = await lostInquiry(inquiry);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("lostInquiry()", response.message);
        toast.error("Unable to mark inquiry as lost.");
        return;
      }

      toast.success("Inquiry has been marked as lost.");

      setWaiting(false);
      closeLostInquiryModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("lostInquiry()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="lost-inquiry-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Lost inquiry</h5>
            <button type="button" className="btn-close" onClick={closeLostInquiryModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <p className="text-center">
                    Are you sure you want to mark this inquiry as lost? <br /> This action is irreversible and will send a lost email to the client.
                  </p>
                  <label htmlFor="lostReason" className="mb-1">
                    Lost reason
                  </label>
                  <input type="text" id="lostReason" autoComplete="off" className="form-control" value={lostReason} onChange={onInputChange} required />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleLostInquiry}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Mark as lost"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostInquiryModal;
