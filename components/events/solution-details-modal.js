const SolutionDetailsModal = ({ onClose, solutionDetails }) => {
  const closeSolutionDetailsModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="solution-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Solution details</h5>
            <button type="button" className="btn-close" onClick={closeSolutionDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="row">
                    {solutionDetails?.scopeOfWork?.map((sow, index) => (
                      <div className="col-md-6" key={index}>
                        <div className="card">
                          <div className="card-body">
                            <div className="mb-3">
                              <h6 className="fw-semibold">{sow.solution?.length !== 0 && "Solution"}</h6>
                              <p className="mb-0">{sow.solution?.length !== 0 && sow.solution}</p>
                            </div>
                            <div>
                              <h6 className="fw-semibold">Extra(s)</h6>
                              <ul className="list-group list-group-horizontal">
                                {sow.extras && sow.extras.length > 0 ? (
                                  sow.extras.map((extra, index) => (
                                    <li style={{ whiteSpace: "pre-wrap" }} key={index}>
                                      {extra}
                                      {index < sow.extras.length - 1 ? ", " : ""}
                                    </li>
                                  ))
                                ) : (
                                  <li style={{ whiteSpace: "pre-wrap" }}>{"-"}</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {solutionDetails?.salesManager && (
                <div className="row">
                  <div className="col">
                    <p className="mb-0">
                      <span className="fw-semibold">Sales manager:</span> {solutionDetails?.salesManager}
                    </p>
                  </div>
                </div>
              )}
              {solutionDetails?.eventComments && (
                <div className="row">
                  <div className="col">
                    <p>
                      <span className="fw-semibold">Comments:</span> {solutionDetails?.eventComments}
                    </p>
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
