import { useRef } from "react";
import { format } from "date-fns";

const LogisticsDetailsModal = ({ onClose, logisticsDetails }) => {
  const pdfRef = useRef();

  const closeLogisticsDetailsModal = () => {
    onClose();
  };

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = pdfRef.current;

    const opt = {
      margin: 0,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: "px", format: [700, 700], orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .output("blob")
      .then((pdfBlob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl);
      });
  };

  return (
    <div className="modal fade" id="logistics-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Logistics details</h5>
            <button type="button" className="btn-close" onClick={closeLogisticsDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container" ref={pdfRef}>
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="mb-3">
                        <h6 className="fw-semibold">Event name</h6>
                        <p className="mb-0">{logisticsDetails.eventName ? logisticsDetails.eventName : "-"}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Promoter(s)</h6>
                        <p className="mb-0">{logisticsDetails.promoters ? logisticsDetails.promoters : "-"}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Contact person name</h6>
                        <p className="mb-0">{logisticsDetails.contactPersonName ? logisticsDetails.contactPersonName : "-"}</p>
                      </div>
                      <div className="mb-0">
                        <h6 className="fw-semibold">Contact person number</h6>
                        <p className="mb-0">{logisticsDetails.contactPersonNumber ? logisticsDetails.contactPersonNumber : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="mb-3">
                        <h6 className="fw-semibold">Solution(s)</h6>
                        {logisticsDetails.solutionDetails?.map((sow, index) => (
                          <ul className="list-group" key={index}>
                            <li style={{ whiteSpace: "pre-wrap" }}>{sow.solution}</li>
                          </ul>
                        ))}
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Event end date/time</h6>
                        <p className="mb-0">{format(new Date(logisticsDetails.eventEndDateTime), "dd MMM yyyy h:mm a")}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Installation date/time</h6>
                        <p className="mb-0">{logisticsDetails.installationDateTime ? format(new Date(logisticsDetails.installationDateTime), "dd MMM yyyy h:mm a") : "-"}</p>
                      </div>
                      <div className="mb-0">
                        <h6 className="fw-semibold">Removal date/time</h6>
                        <p className="mb-0">{logisticsDetails.removalDateTime ? format(new Date(logisticsDetails.removalDateTime), "dd MMM yyyy h:mm a") : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="card mb-0">
                    <div className="card-body">
                      <div className="mb-3">
                        <h6 className="fw-semibold">Event start date/time</h6>
                        <p className="mb-0">{format(new Date(logisticsDetails.eventStartDateTime), "dd MMM yyyy h:mm a")}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Event end date/time</h6>
                        <p className="mb-0">{format(new Date(logisticsDetails.eventEndDateTime), "dd MMM yyyy h:mm a")}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Installation date/time</h6>
                        <p className="mb-0">{logisticsDetails.installationDateTime ? format(new Date(logisticsDetails.installationDateTime), "dd MMM yyyy h:mm a") : "-"}</p>
                      </div>
                      <div className="mb-0">
                        <h6 className="fw-semibold">Removal date/time</h6>
                        <p className="mb-0">{logisticsDetails.removalDateTime ? format(new Date(logisticsDetails.removalDateTime), "dd MMM yyyy h:mm a") : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card mb-0">
                    <div className="card-body">
                      <div className="mb-3">
                        <h6 className="fw-semibold">Permits needed</h6>
                        <p className="mb-0">{logisticsDetails.permitsNeeded ? "Yes" : "No"}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Branding needed</h6>
                        <p className="mb-0">{logisticsDetails.brandingNeeded ? "Yes" : "No"}</p>
                      </div>
                      <div className="mb-3">
                        <h6 className="fw-semibold">Location</h6>
                        <p className="mb-0">{logisticsDetails.location}</p>
                      </div>
                      <div className="mb-0">
                        <h6 className="fw-semibold">Location comments</h6>
                        <p className="mb-0">{logisticsDetails.locationComments ? logisticsDetails.locationComments : "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleDownloadPDF}>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDetailsModal;
