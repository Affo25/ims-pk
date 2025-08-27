const SolutionDetailsModal = ({ onClose, solutionDetails }) => {
  const closeSolutionDetailsModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="solution-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Solution / software details</h5>
            <button type="button" className="btn-close" onClick={closeSolutionDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="row">
                    {solutionDetails.scopeOfWork?.map((sow, index) => (
                      <div className="col-md-6" key={index}>
                        <div className="card">
                          <div className="card-body">
                            {sow.solution?.length !== 0 && (
                              <div>
                                <h6 className="fw-semibold">Solution</h6>
                                <p className="mb-3">{sow.solution[0]}</p>
                              </div>
                            )}
                            <div>
                              <h6 className="fw-semibold">Event code</h6>
                              <p className="mb-0">{solutionDetails.portalEvents?.find((event) => event.solution === sow.solution[0])?.event_code || "-"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {solutionDetails?.softwareDetails && (
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="fw-semibold">Software details</h6>
                    <p style={{ whiteSpace: "pre-wrap" }}>{solutionDetails.softwareDetails}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDetailsModal;
