const CancelReasonModal = ({ onClose, cancelReason }) => {
  const closeCancelReasonModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="cancel-reason-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Cancel reason</h5>
            <button type="button" className="btn-close" onClick={closeCancelReasonModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <p>{cancelReason}</p>
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

export default CancelReasonModal;
