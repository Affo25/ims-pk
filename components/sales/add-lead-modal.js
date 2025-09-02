import { useState } from "react";
import { toast } from "react-hot-toast";
import { addLead } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { isEmail, logger } from "@/lib/utils";
import { boundData, contactStatus, solutions, sources } from "@/lib/data";
import { Typeahead } from "react-bootstrap-typeahead";

const AddLeadModal = ({ onClose }) => {
    const router = useRouter();
    const salesPeople = ["Ben", "Saqib", "Modar"];
    const [waiting, setWaiting] = useState(false);
    const [contact_status, setContact_status] = useState([]);
    const [solution, setSolution] = useState([]);
    const [source, setSource] = useState([]);
    const [bound, setBound] = useState([]);
    const [sale, setSale] = useState([]);
    const [lead, setLead] = useState({
        name: "",
        email: "",
        contact: "",
        source: "",
        bound: "",
        request: "",
        sale: "",
        contact_status: "",
        solution: [],
        comments: "",
    });
    const onInputChange = (e) => {
        setLead({ ...lead, [e.target.id]: e.target.value });
    };

    const onTypeheadInputChange = (type, selected, i) => {

        if (type === "sale") {
            setSale(selected);

            if (selected.length === 0) {
                setLead({ ...lead, sale: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setLead({ ...lead, sale: selected[0].label });
            } else {
                setLead({ ...lead, sale: selected[0] });
            }

            return;
        }
        if (type === "contact_status") {
            setContact_status(selected);

            if (selected.length === 0) {
                setLead({ ...lead, contact_status: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setLead({ ...lead, contact_status: selected[0].label });
            } else {
                setLead({ ...lead, contact_status: selected[0] });
            }

            return;
        }

        if (type === "solution") {
            setSolution(selected);

            if (selected.length === 0) {
                setLead({ ...lead, solution: [] });
                return;
            }

            const solutionObjects = selected.map(item => ({
                extras: [],
                solution: [typeof item === "string" ? item : item.name]
            }));

            setLead({ ...lead, solution: solutionObjects });
            return;
        }


        if (type === "source") {
            setSource(selected);

            if (selected.length === 0) {
                setLead({ ...lead, source: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setLead({ ...lead, source: selected[0].label });
            } else {
                setLead({ ...lead, source: selected[0] });
            }

            return;
        }


        if (type === "bound") {
            setBound(selected);

            if (selected.length === 0) {
                setLead({ ...lead, bound: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setLead({ ...lead, bound: selected[0].label });
            } else {
                setLead({ ...lead, bound: selected[0] });
            }

            return;
        }
    };

    const closeAddLeadModal = () => {
        setSale([]);
        setContact_status([]);
        setSolution([]);
        setSource([]);
        setBound([]);
        setLead({
            name: "",
            email: "",
            contact: "",
            source: "",
            bound: "",
            request: "",
            sale: "",
            contact_status: "",
            solution: [],
            comments: "",
        });
        onClose();
    };

    const handleLeadSubmit = async () => {
        try {
            if (lead.name === "") return toast.error("Please enter the name.");
            if (lead.email === "") return toast.error("Please enter the email.");
            if (!isEmail(lead.email)) return toast.error("Please enter a valid email.");
            if (lead.contact === "") return toast.error("Please enter the contact.");
            if (lead.bound === "") return toast.error("Please Select the bound.");

            setWaiting(true);
            const response = await addLead(lead);

            if (response.status === "ERROR") {
                logger("addLead()", response.message);
                toast.error("Unable to add lead.");
                setWaiting(false);
                return;
            }

            toast.success("Lead has been added.");
            setWaiting(false);
            closeAddLeadModal();
            router.refresh();
        } catch (error) {
            logger("addLead()", error);
            toast.error("Something went wrong.");
            setWaiting(false);
        }
    };

    return (
        <div className="modal fade" id="add-lead-modal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Add Lead</h5>
                        <button type="button" className="btn-close" onClick={closeAddLeadModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    <label htmlFor="name" className="mb-1">Name</label>
                                    <input type="text" id="name" className="form-control mb-3" value={lead.name} onChange={onInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="email" className="mb-1">Email</label>
                                    <input type="email" id="email" className="form-control mb-3" value={lead.email} onChange={onInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="contact" className="mb-1">Contact</label>
                                    <input type="text" id="contact" className="form-control mb-3" value={lead.contact} onChange={onInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="request" className="mb-1">Request</label>
                                    <input type="text" id="request" className="form-control mb-3" value={lead.request} onChange={onInputChange} />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="source" className="mb-1">
                                        Source
                                    </label>
                                    <Typeahead
                                        id="source"
                                        inputProps={{ id: "source", autoComplete: "off" }}
                                        className="mb-3"
                                        onChange={(selected) => onTypeheadInputChange("source", selected)}
                                        options={sources}
                                        selected={source}
                                        newSelectionPrefix="Add a source:"
                                        paginationText={"Show more results"}
                                        allowNew
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="sale" className="mb-1">
                                        Sales
                                    </label>
                                    <Typeahead
                                        id="sale"
                                        inputProps={{ id: "sale", autoComplete: "off" }}
                                        className="mb-3"
                                        onChange={(selected) => onTypeheadInputChange("sale", selected)}
                                        options={salesPeople}
                                        selected={sale}
                                        newSelectionPrefix="Add a sale:"
                                        paginationText={"Show more results"}
                                        allowNew
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="contact_status" className="mb-1">
                                        Contact Status
                                    </label>
                                    <Typeahead
                                        id="contact_status"
                                        inputProps={{ id: "contact_status", autoComplete: "off" }}
                                        className="mb-3"
                                        onChange={(selected) => onTypeheadInputChange("contact_status", selected)}
                                        options={contactStatus}
                                        selected={contact_status}
                                        newSelectionPrefix="Add a contact_status:"
                                        paginationText={"Show more results"}
                                        allowNew
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="bound" className="mb-1">
                                        Bound
                                    </label>
                                    <Typeahead
                                        id="bound"
                                        inputProps={{ id: "bound", autoComplete: "off" }}
                                        className="mb-3"
                                        onChange={(selected) => onTypeheadInputChange("bound", selected)}
                                        options={boundData}
                                        selected={bound}
                                        newSelectionPrefix="Add a bound:"
                                        paginationText={"Show more results"}
                                        allowNew
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="solution" className="mb-1">
                                        Product
                                    </label>
                                    <Typeahead
                                        id="solution"
                                        inputProps={{ id: "solution", autoComplete: "off" }}
                                        className="mb-3"
                                        onChange={(selected) => onTypeheadInputChange("solution", selected)}
                                        options={solutions}
                                        selected={solution}
                                        newSelectionPrefix="Add an extra:"
                                        paginationText={"Show more results"}
                                        emptyLabel="No extras found."
                                        multiple
                                        allowNew
                                    />
                                </div>
                                <div className="col-md-12">
                                    <label htmlFor="comments" className="mb-1">Comments</label>
                                    <textarea id="comments" className="form-control mb-3" rows={3} value={lead.comments} onChange={onInputChange}></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={handleLeadSubmit} disabled={waiting}>
                            {waiting ? "Saving..." : "Save Lead"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLeadModal;