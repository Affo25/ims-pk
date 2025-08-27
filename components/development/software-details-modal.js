const SoftwareDetailsModal = ({ onClose, selectedSoftware }) => {
  
  const closeSoftwareDetailsModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="software-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Software details</h5>
            <button type="button" className="btn-close" onClick={closeSoftwareDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <p style={{ whiteSpace: "pre-wrap" }}>{selectedSoftware.softwareDetails}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwareDetailsModal;
