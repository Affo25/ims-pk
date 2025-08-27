import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { sendReport } from "@/lib/actions";
import { useRouter } from "next/navigation";

const SendReportModal = ({ onClose, selectedEvent }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeSendReportModal = () => {
    onClose();
  };

  const handleSendReport = async () => {
    try {
      setWaiting(true);

      const response = await sendReport(selectedEvent);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("sendReport()", response.message);
        toast.error("Unable to send report.");
        return;
      }

      toast.success("Report has been sent.");

      setWaiting(false);
      closeSendReportModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("sendReport()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="send-report-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Send report</h5>
            <button type="button" className="btn-close" onClick={closeSendReportModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col text-center">
                  <p className="mb-0">Are you sure you want to send an email to the client with the report?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleSendReport}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendReportModal;
