import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { uploadInvoice } from "@/lib/actions";

const UploadInvoiceModal = ({ onClose, selectedPayment }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [fileToUpload, setFileToUpload] = useState(null);

  const onInputChange = (e) => {
    setInvoiceNumber(e.target.value);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (!file) {
        toast.error("Something with wrong which selecting the file.");
      }

      setFileToUpload(file);
    },
    onDropRejected: (fileRejections) => {
      toast.error(fileRejections[0].errors[0].message);
    },
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    noDrag: true,
  });

  const closeUploadInvoiceModal = () => {
    setInvoiceNumber("");
    setFileToUpload(null);
    onClose();
  };

  const handleUploadInvoiceSubmit = async () => {
    try {
      if (!invoiceNumber) {
        toast.error("Please enter an invoice number.");
        return;
      }

      setWaiting(true);

      const invoice = {
        number: invoiceNumber,
        file: fileToUpload,
      };

      const response = await uploadInvoice(invoice, selectedPayment);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("uploadInvoice()", response.message);
        toast.error("Unable to upload invoice.");
        return;
      }

      toast.success("Invoice has been uploaded.");
      setWaiting(false);
      closeUploadInvoiceModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("uploadInvoice()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="upload-invoice-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload invoice</h5>
            <button type="button" className="btn-close" onClick={closeUploadInvoiceModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <label htmlFor="invoiceNumber" className="mb-1">
                    Invoice number
                  </label>
                  <input type="text" id="invoiceNumber" autoComplete="off" className="form-control mb-3" value={invoiceNumber} onChange={onInputChange} required />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <form className="dropzone dz-clickable">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <p className="mb-0">Click to select an invoice</p>
                    </div>
                  </form>
                  {fileToUpload && <p className="mt-3 mb-0">Selected file: {fileToUpload.name}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={!fileToUpload || waiting} className="btn btn-primary ms-auto" onClick={handleUploadInvoiceSubmit}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadInvoiceModal;
