const ContentModal = ({ onClose, template }) => {
  const closeContentModal = () => {
    onClose();
  };

  return (
    <div className="modal fade" id="content-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Content</h5>
            <button type="button" className="btn-close" onClick={closeContentModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <h6 className="fw-semibold">
                    Subject: <span className="fw-normal">{template.subject}</span>
                  </h6>
                </div>
                <div className="col-md-12">
                  <h6 className="fw-semibold">Body:</h6>
                  <iframe title="template content" width="100%" height="400px" srcDoc={template.content} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;
