import { format } from "date-fns";
import { logger } from "@/lib/utils";
import { userData } from "@/lib/data";
import { toast } from "react-hot-toast";
import { addProposal } from "@/lib/actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AddProposalModal = ({ onClose, selectedInquiry }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [proposalFormValues, setProposalFormValues] = useState([{ description: "", price: "", quantity: "1" }]);
  const [proposal, setProposal] = useState({
    title: "",
    subtotalAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    details: [],
  });

  const user = userData.find((user) => user.country === selectedInquiry?.user?.country);
  const vatAmount = user.vat;
  const currencySymbol = user.currency;

  useEffect(() => {
    calculateTotal();
  }, [proposalFormValues]);

  const calculateTotal = () => {
    const subTotal = proposalFormValues.reduce((accumulator, { price, quantity }) => accumulator + Number(price) * Number(quantity), 0);
    const vat = subTotal * (vatAmount / 100);
    const total = subTotal + vat;
    setProposal({ ...proposal, subtotalAmount: subTotal.toFixed(2), vatAmount: vat.toFixed(2), totalAmount: total.toFixed(2) });
  };

  const onInputChange = (type, e, i) => {
    if (type === "proposal") {
      setProposal({ ...proposal, [e.target.id]: e.target.value });
      return;
    }

    if (type === "description") {
      let newProposalValues = [...proposalFormValues];
      newProposalValues[i].description = e.target.value;
      setProposalFormValues(newProposalValues);
      setProposal({ ...proposal, details: newProposalValues });
      return;
    }

    if (type === "price") {
      let newProposalValues = [...proposalFormValues];
      newProposalValues[i].price = e.target.value;
      setProposalFormValues(newProposalValues);
      setProposal({ ...proposal, details: newProposalValues });
      return;
    }

    if (type === "quantity") {
      let newProposalValues = [...proposalFormValues];
      newProposalValues[i].quantity = e.target.value;
      setProposalFormValues(newProposalValues);
      setProposal({ ...proposal, details: newProposalValues });
      return;
    }
  };

  const addProposalFormFields = () => {
    setProposalFormValues([...proposalFormValues, { description: "", price: "", quantity: 1 }]);
  };

  const removeProposalFormFields = (i) => {
    let newProposalValues = [...proposalFormValues];
    newProposalValues.splice(i, 1);
    setProposalFormValues(newProposalValues);
    setProposal({ ...proposal, details: newProposalValues });
  };

  const closeAddProposalModal = () => {
    setProposalFormValues([{ description: "", price: "", quantity: "1" }]);
    setProposal({
      title: "",
      subtotalAmount: 0,
      vatAmount: 0,
      totalAmount: 0,
      details: [],
    });

    onClose();
  };

  const handleProposalSubmit = async () => {
    try {
      if (proposal.title === "") {
        toast.error("Please enter the title.");
        return;
      }

      if (proposal.details.length === 0) {
        toast.error("Please enter the details.");
        return;
      }

      for (const detail of proposal.details) {
        for (const [key, value] of Object.entries(detail)) {
          if (key === "description" && value === "") {
            toast.error("Please enter the description.");
            return;
          }
          if (key === "quantity" && value === "") {
            toast.error("Please enter the quantity.");
            return;
          }
          if (key === "quantity" && value <= 0) {
            toast.error("Please enter a valid quantity.");
            return;
          }
          if (key === "price" && value === "") {
            toast.error("Please enter the price.");
            return;
          }
        }
      }

      setWaiting(true);
      const response = await addProposal(proposal, selectedInquiry);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("addProposal()", response.message);
        toast.error("Unable to add proposal.");
        return;
      }

      toast.success("Proposal has been added.");

      setWaiting(false);
      closeAddProposalModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("addProposal()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="add-proposal-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add proposal</h5>
            <button type="button" className="btn-close" onClick={closeAddProposalModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <h6 className="fw-bold">Client info</h6>
                          <p className="mb-0">{selectedInquiry?.name}</p>
                          <p className="mb-0">{selectedInquiry?.company}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <h6 className="fw-bold">Contact details</h6>
                          <p className="mb-0">{selectedInquiry?.email}</p>
                          <p className="mb-0">{selectedInquiry?.contact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-12">
                          <h6 className="fw-bold">Event dates</h6>
                          {selectedInquiry?.start_datetime && <p className="mb-0">{format(new Date(selectedInquiry?.start_datetime), "dd MMM yyyy h:mm a")}</p>}
                          {selectedInquiry?.end_datetime && <p className="mb-0">{format(new Date(selectedInquiry?.end_datetime), "dd MMM yyyy h:mm a")}</p>}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <h6 className="fw-bold">Location</h6>
                          {selectedInquiry?.location && <p className="mb-0">{selectedInquiry?.location}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="fw-bold">Scope of work</h6>
                      {selectedInquiry?.scope_of_work?.map((sow, index) => (
                        <div key={index}>
                          <ul className="list-group list-group-horizontal">
                            <li style={{ whiteSpace: "pre-wrap" }}>
                              {sow.solution} {sow.extras?.length !== 0 && "-"}{" "}
                            </li>
                            {sow.extras?.map((extra, index) => (
                              <li style={{ whiteSpace: "pre-wrap" }} key={index}>
                                {extra}
                                {index < sow.extras.length - 1 ? ", " : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <label htmlFor="title" className="mb-1">
                    Title
                  </label>
                  <input type="text" id="title" autoComplete="off" className="form-control mb-3" value={proposal.title} onChange={(e) => onInputChange("proposal", e)} required />
                </div>
              </div>
              {proposalFormValues.map((element, index) => (
                <div className="row" key={index}>
                  <div className="col-md-1">
                    <label htmlFor={"index-" + index} className="mb-1">
                      Item
                    </label>
                    <div className="btn btn-index form-btn btn-sm d-flex justify-content-center">
                      <p className="fs-4">{index + 1}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor={"description-" + index} className="mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      id={"description-" + index}
                      autoComplete="off"
                      className="form-control mb-3"
                      value={element.description}
                      onChange={(e) => onInputChange("description", e, index)}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label htmlFor={"price-" + index} className="mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      pattern="[0-9]*"
                      id={"price-" + index}
                      autoComplete="off"
                      className="form-control mb-3"
                      value={element.price}
                      onChange={(e) => onInputChange("price", e, index)}
                      min={1}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label htmlFor={"quantity-" + index} className="mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      pattern="[0-9]*"
                      id={"quantity-" + index}
                      autoComplete="off"
                      className="form-control mb-3"
                      value={element.quantity}
                      onChange={(e) => onInputChange("quantity", e, index)}
                      min={1}
                      required
                    />
                  </div>
                  <div className="col-md-1 text-end">
                    {index === 0 && (
                      <>
                        <label className="d-none d-sm-flex justify-content-center mb-1">Add</label>
                        <button type="button" className="btn form-btn btn-sm bg-light-subtle d-flex align-items-center justify-content-center mb-3" onClick={() => addProposalFormFields()}>
                          <i className="fs-5 ti ti-plus text-info"></i>
                        </button>
                      </>
                    )}
                    {index > 0 && (
                      <>
                        <label className="d-none d-sm-flex justify-content-center mb-1">Remove</label>
                        <button type="button" className="btn form-btn btn-sm bg-light-subtle d-flex align-items-center justify-content-center mb-3" onClick={() => removeProposalFormFields(index)}>
                          <i className="fs-5 ti ti-minus text-info"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <table></table>
              <div className="row">
                <div className="col-md-8"></div>
                <div className="col-md-2 text-end">
                  <p className="mb-1">Sub-total:</p>
                </div>
                <div className="col-md-2 text-end ps-0">
                  <h6 className="fw-bold">
                    {currencySymbol} {Number(proposal.subtotalAmount).toLocaleString("en")}
                  </h6>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8"></div>
                <div className="col-md-2 text-end">
                  <p className="mb-1">VAT ({vatAmount}%):</p>
                </div>
                <div className="col-md-2 text-end ps-0">
                  <h6 className="fw-bold">
                    {currencySymbol} {Number(proposal.vatAmount).toLocaleString("en")}
                  </h6>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8"></div>
                <div className="col-md-2 text-end">
                  <h6 className="fw-bold">Total:</h6>
                </div>
                <div className="col-md-2 text-end ps-0">
                  <h6 className="fw-bold">
                    {currencySymbol} {Number(proposal.totalAmount).toLocaleString("en")}
                  </h6>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleProposalSubmit}>
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

export default AddProposalModal;
