import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { sendInvoices } from "@/lib/actions";

const InvoicesModal = ({ onClose, invoicesData, selectedPayment, onOpen }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const closeInvoicesModal = () => {
    setSelectedInvoices([]);
    onClose();
  };

  const openUploadInvoiceModal = () => {
    closeInvoicesModal();

    setTimeout(() => {
      onOpen();
    }, 50);
  };

  const handleSendInvoices = async () => {
    try {
      if (selectedInvoices.length === 0) {
        toast.error("Please select the invoice(s) first.");
        return;
      }

      setWaiting(true);

      const response = await sendInvoices(selectedInvoices, selectedPayment);

      if (response.status === "ERROR") {
        setWaiting(false);

        logger("sendInvoices()", response.message);
        toast.error("Unable to send invoice(s).");
        return;
      }

      toast.success("Invoices(s) have been sent.");
      setWaiting(false);
      closeInvoicesModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("sendInvoices()", error);
      toast.error("Something went wrong.");
    }
  };

  const handleInvoiceSelect = (invoice) => {
    setSelectedInvoices((prevSelected) => {
      const isAlreadySelected = prevSelected.some((i) => i.id === invoice.id);

      if (isAlreadySelected) {
        return prevSelected.filter((i) => i.id !== invoice.id);
      } else {
        return [...prevSelected, invoice];
      }
    });
  };

  return (
    <>
      <div className="modal fade" id="invoices-modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Invoices</h5>
              <button type="button" className="btn-close" onClick={closeInvoicesModal}></button>
            </div>
            <div className="modal-body">
              <div className="container">
                <div className="row mb-3">
                  <div className="col-md-6">
                    {invoicesData?.length > 0 ? (
                      <p className="d-flex align-items-center h-100">Here are the invoices for this event.</p>
                    ) : (
                      <p className="d-flex align-items-center h-100">No invoices found.</p>
                    )}
                  </div>
                </div>
                <div className="row">
                  {invoicesData?.map((invoice, index) => (
                    <div className="col-md-4" key={index}>
                      <div className={"card " + (selectedInvoices.map((i) => i.id).includes(invoice.id) ? "selected-card" : "")}>
                        <div className="card-body">
                          {(selectedPayment?.status === "PENDING" || selectedPayment?.status === "UNPAID") && (
                            <div className="form-check invoice-check p-0 m-0">
                              <input
                                type="checkbox"
                                className="form-check-input p-0 m-0"
                                checked={selectedInvoices.map((i) => i.id).includes(invoice.id)}
                                onChange={() => handleInvoiceSelect(invoice)}
                              />
                            </div>
                          )}
                          <Link className="fw-semibold d-block mb-2" href={invoice.url} target="_blank">
                            #{invoice.number.toUpperCase()}
                          </Link>
                          <p className="mb-0">{invoice.title}</p>
                          <p className="mb-0">{format(new Date(invoice.created_at), "dd MMM yyyy h:mm a")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              {invoicesData.length > 0 && (selectedPayment?.status === "PENDING" || selectedPayment?.status === "UNPAID") && (
                <button type="button" disabled={waiting} className="btn btn-outline-primary" onClick={handleSendInvoices}>
                  {waiting ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "Send invoice"
                  )}
                </button>
              )}
              {(selectedPayment?.status === "PENDING" || selectedPayment?.status === "UNPAID") && (
                <button type="button" className="btn btn-primary ms-auto" onClick={openUploadInvoiceModal}>
                  Upload invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicesModal;
