import { format } from "date-fns";
import parse from "html-react-parser";

const ActivityDetailsModal = ({ onClose, activityDetails }) => {
  const closeActivityDetailsModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="activity-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Activity</h5>
            <button type="button" className="btn-close" onClick={closeActivityDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="card w-100">
                    <div className="card-body">
                      <ul className="timeline-widget mb-0 position-relative">
                        {activityDetails?.map((activity, index) => (
                          <li className="timeline-item align-items-center d-flex position-relative overflow-hidden" key={index}>
                            <div className="timeline-time text-dark flex-shrink-0 text-end">{format(new Date(activity.date_time), "dd MMM yyyy h:mm a")}</div>
                            <div className="timeline-badge-wrap d-flex flex-column align-items-center">
                              <span className="timeline-badge border-2 border border-dark flex-shrink-0 my-8"></span>
                              <span className="timeline-badge-border d-block flex-shrink-0"></span>
                            </div>
                            <div className="timeline-desc fs-3 text-dark">{parse(activity.message)}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
