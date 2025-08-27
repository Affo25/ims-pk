import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { clearPayment } from "@/lib/actions";

const ClearedPaymentModal = ({ onClose, selectedPayment }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeClearedPaymentModal = () => {
    onClose();
  };

  const handleClearPayment = async () => {
    try {
      setWaiting(true);

      const response = await clearPayment(selectedPayment);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("clearPayment()", response.message);
        toast.error("Unable to mark payment as cleared.");
        return;
      }

      toast.success("Payment has been marked as cleared.");

      setWaiting(false);
      closeClearedPaymentModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("clearPayment()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="cleared-payment-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cleared payment</h5>
            <button type="button" className="btn-close" onClick={closeClearedPaymentModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <p className="text-center mb-0">Are you sure you want to mark this payment as cleared?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleClearPayment}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Mark as cleared"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearedPaymentModal;
