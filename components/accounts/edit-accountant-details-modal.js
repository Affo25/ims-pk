import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isEmail, logger } from "@/lib/utils";
import { editAccountantDetails } from "@/lib/actions";

const EditAccountantDetailsModal = ({ onClose, selectedPayment }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [payment, setPayment] = useState({
    accountantName: "",
    accountantEmail: "",
  });

  useEffect(() => {
    if (selectedPayment) {
      handleAccountantDetails(selectedPayment);
    }
  }, [selectedPayment]);

  const closeEditAccountantDetailsModal = () => {
    setPayment({
      accountantName: "",
      accountantEmail: "",
    });
    onClose();
  };

  const onInputChange = (e) => {
    setPayment({ ...payment, [e.target.id]: e.target.value });
  };

  const handleAccountantDetails = (payment) => {
    setPayment({
      accountantName: payment.accountant_name ? payment.accountant_name : "",
      accountantEmail: payment.accountant_email ? payment.accountant_email : "",
    });
  };

  const handleEditAccountantDetails = async () => {
    try {
      if (!payment.accountantName) {
        toast.error("Please enter the accountant name.");
        return;
      }

      if (!payment.accountantEmail) {
        toast.error("Please enter the accountant email.");
        return;
      }

      if (!isEmail(payment.accountantEmail)) {
        toast.error("Please enter a valid email.");
        return;
      }

      setWaiting(true);

      const accountantDetails = {
        paymentId: selectedPayment.id,
        accountantName: payment.accountantName,
        accountantEmail: payment.accountantEmail,
        activity: selectedPayment.activity,
      };

      const response = await editAccountantDetails(accountantDetails);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("editAccountantDetails()", response.message);
        toast.error("Unable to edit accountant details.");
        return;
      }

      toast.success("Account details have been edited.");

      setWaiting(false);
      closeEditAccountantDetailsModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("editAccountantDetails()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="edit-accountant-details-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit accountant details</h5>
            <button type="button" className="btn-close" onClick={closeEditAccountantDetailsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <label htmlFor="accountantName" className="mb-1">
                    Accountant name
                  </label>
                  <input type="text" id="accountantName" autoComplete="off" className="form-control mb-3" value={payment.accountantName} onChange={onInputChange} required />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="accountantEmail" className="mb-1">
                    Accountant email
                  </label>
                  <input type="email" id="accountantEmail" autoComplete="off" className="form-control" value={payment.accountantEmail} onChange={onInputChange} required />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleEditAccountantDetails}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccountantDetailsModal;
