import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { userData } from "@/lib/data";

const ProposalsModal = ({ onClose, proposalsData, selectedInquiry }) => {
  const [selectedProposals, setSelectedProposals] = useState([]);
  const user = userData.find((user) => user.country === selectedInquiry?.user?.country);

  const closeProposalsModal = () => {
    setSelectedProposals([]);
    onClose();
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
                <div className="row mb-3">
                  <div className="col-md-6">
                    {proposalsData?.length > 0 ? (
                      <p className="d-flex align-items-center h-100">Here are the proposals for this inquiry.</p>
                    ) : (
                      <p className="d-flex align-items-center h-100">No proposals found.</p>
                    )}
                  </div>
                  <div className="col-md-6 text-end"></div>
                </div>
                <div className="row">
                  {proposalsData?.map((proposal, index) => (
                    <div className="col-md-4" key={index}>
                      <div className={"card " + (selectedProposals.map((p) => p.id).includes(proposal.id) ? "selected-card" : "")}>
                        <div className="card-body">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalsModal;
