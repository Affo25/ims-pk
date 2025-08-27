import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { logger } from "@/lib/utils";
import { userData } from "@/lib/data";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { sendProposals } from "@/lib/actions";

const ProposalsModal = ({ onClose, proposalsData, selectedInquiry, onAddProposalOpen, onEditProposalOpen }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState([]);
  const user = userData.find((user) => user.country === selectedInquiry?.user?.country);

  const closeProposalsModal = () => {
    setSelectedProposals([]);
    onClose();
  };

  const openAddProposalModal = () => {
    if (!selectedInquiry.start_datetime) {
      toast.error("Please add the start date.");
      return;
    }

    if (!selectedInquiry.end_datetime) {
      toast.error("Please add the end date.");
      return;
    }

    if (!selectedInquiry.location) {
      toast.error("Please add the location.");
      return;
    }

    if (!selectedInquiry.scope_of_work || selectedInquiry.scope_of_work[0].solution?.length === 0) {
      toast.error("Please add the scope of work.");
      return;
    }

    closeProposalsModal();

    setTimeout(() => {
      onAddProposalOpen();
    }, 50);
  };

  const openEditProposalModal = (proposal) => {
    if (!selectedInquiry.start_datetime) {
      toast.error("Please add the start date.");
      return;
    }

    if (!selectedInquiry.end_datetime) {
      toast.error("Please add the end date.");
      return;
    }

    if (!selectedInquiry.location) {
      toast.error("Please add the location.");
      return;
    }

    if (!selectedInquiry.scope_of_work || selectedInquiry.scope_of_work[0].solution?.length === 0) {
      toast.error("Please add the scope of work.");
      return;
    }

    closeProposalsModal();

    setTimeout(() => {
      onEditProposalOpen(proposal);
    }, 50);
  };

  const handleSendProposals = async () => {
    try {
      if (selectedProposals.length === 0) {
        toast.error("Please select the proposal(s) first.");
        return;
      }

      setWaiting(true);

      const response = await sendProposals(selectedProposals, selectedInquiry);

      if (response.status === "ERROR") {
        setWaiting(false);

        logger("sendProposals()", response.message);
        toast.error("Unable to submit proposal(s).");
        return;
      }

      toast.success("Proposal(s) have been submitted.");
      setWaiting(false);
      closeProposalsModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("sendProposals()", error);
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
    <>
      <div className="modal fade" id="proposals-modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Proposals</h5>
              <button type="button" className="btn-close" onClick={closeProposalsModal}></button>
            </div>
            <div className="modal-body">
              <div className="container">
                <div className="row">
                  <div className="col-md-12">
                    {proposalsData?.length > 0 ? (
                      <p className="d-flex align-items-center h-100 mb-3">Here are the proposals for this inquiry.</p>
                    ) : (
                      <p className="d-flex align-items-center h-100 mb-0">No proposals found.</p>
                    )}
                  </div>
                </div>
                <div className="row">
                  {proposalsData?.map((proposal, index) => (
                    <div className="col-md-4" key={index}>
                      <div className={"card " + (selectedProposals.map((p) => p.id).includes(proposal.id) ? "selected-card" : "")}>
                        <div className="card-body">
                          {(selectedInquiry?.status === "NEW" || selectedInquiry?.status === "SUBMITTED") && (
                            <div className="form-check proposal-check p-0 m-0">
                              <input
                                type="checkbox"
                                className="form-check-input p-0 m-0"
                                checked={selectedProposals.map((p) => p.id).includes(proposal.id)}
                                onChange={() => handleProposalSelect(proposal)}
                              />
                            </div>
                          )}
                          {proposal.confirmed && (
                            <div className="proposal-confirmed p-0 m-0 fs-6">
                              <i className="ti ti-check"></i>
                            </div>
                          )}
                          <Link className="fw-semibold d-block mb-2" href={"/proposals/" + proposal.number} target="_blank">
                            #{proposal.number.toUpperCase()}
                          </Link>
                          <p className="mb-0">{proposal.title}</p>
                          <p>{format(new Date(proposal.created_at), "dd MMM yyyy h:mm a")}</p>
                          <p className="fw-semibold mb-0">
                            {user.currency} {Number(proposal.total_amount).toLocaleString("en")}
                          </p>
                          {(selectedInquiry?.status === "NEW" || selectedInquiry?.status === "SUBMITTED") && (
                            <div className="d-flex justify-content-start">
                              <button className="btn link-dark link-offset-2 text-decoration-underline p-0 mt-3" type="button" onClick={() => openEditProposalModal(proposal)}>
                                Edit proposal
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer d-flex justify-content-between">
              {proposalsData.length > 0 && (selectedInquiry?.status === "NEW" || selectedInquiry?.status === "SUBMITTED") && (
                <button type="button" disabled={waiting} className="btn btn-outline-primary" onClick={handleSendProposals}>
                  {waiting ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "Send proposal"
                  )}
                </button>
              )}
              {(selectedInquiry?.status === "NEW" || selectedInquiry?.status === "SUBMITTED") && (
                <button type="button" className="btn btn-primary ms-auto" onClick={openAddProposalModal}>
                  Add proposal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalsModal;
