import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { logger } from "@/lib/utils";
import { userData } from "@/lib/data";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { confirmInquiry } from "@/lib/actions";

const ConfirmInquiryModal = ({ onClose, selectedInquiry, proposalsData }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [eventName, setEventName] = useState("");
  const [selectedProposals, setSelectedProposals] = useState([]);
  const user = userData.find((user) => user.country === selectedInquiry?.user?.country);

  const closeConfirmInquiryModal = () => {
    onClose();
  };

  const onInputChange = (e) => {
    setEventName(e.target.value);
  };

  const handleConfirmInquiry = async () => {
    try {
      if (!eventName) {
        toast.error("Please enter an event name.");
        return;
      }

      selectedInquiry.eventName = eventName;

      if (selectedProposals.length === 0) {
        toast.error("Please select the proposal(s) first.");
        return;
      }

      setWaiting(true);

      const response = await confirmInquiry(selectedInquiry, selectedProposals);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("confirmInquiry()", response.message);
        toast.error("Unable to mark this inquiry as confirmed.");
        return;
      }

      toast.success("Inquiry has been marked as confirmed.");

      setWaiting(false);
      closeConfirmInquiryModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("confirmInquiry()", error);
      toast.error("Something went wrong.");
    }
  };

  const handleProposalSelect = (proposal) => {
    setSelectedProposals((prevSelected) => {
      const isAlreadySelected = prevSelected.some((p) => p.id === proposal.id);

      if (isAlreadySelected) {
        return prevSelected.filter((p) => p.id !== proposal.id);
      } else {
        return [...prevSelected, proposal];
      }
    });
  };

  return (
    <div className="modal fade" id="confirm-inquiry-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm inquiry</h5>
            <button type="button" className="btn-close" onClick={closeConfirmInquiryModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row mb-3">
                <div className="col">
                  <p className=" text-center">
                    Are you sure you want to mark this inquiry as confirmed? <br /> This action is irreversible and will send a confirmation email to the client.
                  </p>
                  <label htmlFor="eventName" className="mb-1 text-start">
                    Event name
                  </label>
                  <input type="text" id="eventName" autoComplete="off" className="form-control mb-2" value={eventName} onChange={onInputChange} required />
                </div>
              </div>
              <div className="row">
                <p>Select the final proposal(s)</p>
                {proposalsData?.map((proposal, index) => (
                  <div className="col-md-4" key={index}>
                    <div className={"card " + (selectedProposals.map((p) => p.id).includes(proposal.id) ? "selected-card" : "")}>
                      <div className="card-body">
                        <div className="form-check proposal-check p-0 m-0">
                          <input
                            type="checkbox"
                            className="form-check-input p-0 m-0"
                            checked={selectedProposals.map((p) => p.id).includes(proposal.id)}
                            onChange={() => handleProposalSelect(proposal)}
                          />
                        </div>
                        <Link className="fw-semibold d-block mb-2" href={"/proposals/" + proposal.number} target="_blank">
                          #{proposal.number.toUpperCase()}
                        </Link>
                        <p className="mb-0">{proposal.title}</p>
                        <p>{format(new Date(proposal.created_at), "dd MMM yyyy h:mm a")}</p>
                        <p className="fw-semibold mb-0">
                          {user.currency} {Number(proposal.total_amount).toLocaleString("en")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleConfirmInquiry}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Mark as confirmed"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmInquiryModal;
