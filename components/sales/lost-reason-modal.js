const LostReasonModal = ({ onClose, lostReason }) => {
  const closeLostReasonModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="lost-reason-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Lost reason</h5>
            <button type="button" className="btn-close" onClick={closeLostReasonModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <p>{lostReason}</p>
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

export default LostReasonModal;
