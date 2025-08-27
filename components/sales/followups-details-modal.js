import { useState } from "react";
import { format } from "date-fns";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cancelFollowups } from "@/lib/actions";

const FollowupsDetailsModal = ({ onClose, selectedInquiry }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const followupsDetails = selectedInquiry.follow_ups;

  const closeFollowupsDetailsModal = () => {
    onClose();
  };

  const handleCancelFollowups = async () => {
    try {
      setWaiting(true);

      const response = await cancelFollowups(selectedInquiry.id);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("cancelFollowups()", response.message);
        toast.error("Unable to cancel follow ups.");
        return;
      }

      toast.success("Follow ups have been cancelled.");

      setWaiting(false);
      router.refresh();
      closeFollowupsDetailsModal();
    } catch (error) {
      setWaiting(false);
      logger("cancelFollowups()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="followups-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Follow ups</h5>
            <button type="button" className="btn-close" onClick={closeFollowupsDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  {followupsDetails.data.length > 0 ? (
                    <div className="card w-100">
                      <div className="card-body">
                        <ul className="timeline-widget mb-0 position-relative">
                          {followupsDetails?.data.map((followup, index) => (
                            <li className="timeline-item align-items-center d-flex position-relative overflow-hidden" key={index}>
                              <div className="timeline-time text-dark flex-shrink-0 text-end">{format(new Date(followup.date), "dd MMM yyyy h:mm a")}</div>
                              <div className="timeline-badge-wrap d-flex flex-column align-items-center">
                                <span className="timeline-badge border-2 border border-dark flex-shrink-0 my-8"></span>
                                <span className="timeline-badge-border d-block flex-shrink-0"></span>
                              </div>
                              <div className="timeline-desc fs-3 text-dark">{followup.type + " email - " + followup.status}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p>No follow ups scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {followupsDetails.data.length > 0 && (
            <div className="modal-footer">
              <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleCancelFollowups}>
                {waiting ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Cancel follow ups"
                )}
              </button>{" "}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowupsDetailsModal;
