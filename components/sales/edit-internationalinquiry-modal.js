import moment from "moment";
import Datetime from "react-datetime";
import { editInternationalInquirySimple } from "@/lib/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { logger, isEmail, isObjectEmpty } from "@/lib/utils";
import { countries, sources, solutions, extras } from "@/lib/data";

const EditInternationalInquiryModal = ({ onClose, editingInquiry, companies }) => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [source, setSource] = useState([]);
    const [company, setCompany] = useState([]);
    const [country, setCountry] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [sowFormValues, setSowFormValues] = useState([{ solution: [], extras: [] }]);
    const [inquiry, setInquiry] = useState({
        id: "",
        name: "",
        company: "",
        country: "",
        email: "",
        contact: "",
        source: "",
        startDateTime: "",
        endDateTime: "",
        location: "",
        scopeOfWork: [],
        comments: "",
        activity: [],
    });

    useEffect(() => {
        if (!isObjectEmpty(editingInquiry)) {
            handleEditingInquiry(editingInquiry);
            return;
        }
    }, [editingInquiry]);

    const onInputChange = (e) => {
        setInquiry({ ...inquiry, [e.target.id]: e.target.value });
    };

    const onTypeheadInputChange = (type, selected, i) => {
        if (type === "company") {
            setCompany(selected);

            if (selected.length === 0) {
                setInquiry({ ...inquiry, company: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setInquiry({ ...inquiry, company: selected[0].label });
            } else {
                setInquiry({ ...inquiry, company: selected[0] });
            }

            return;
        }

        if (type === "country") {
            setCountry(selected);

            if (selected.length === 0) {
                setInquiry({ ...inquiry, country: "" });
                return;
            }

            setInquiry({ ...inquiry, country: selected[0].name });

            return;
        }

        if (type === "source") {
            setSource(selected);

            if (selected.length === 0) {
                setInquiry({ ...inquiry, source: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setInquiry({ ...inquiry, source: selected[0].label });
            } else {
                setInquiry({ ...inquiry, source: selected[0] });
            }

            return;
        }

        if (type === "solution") {
            let newFormValues = [...sowFormValues];

            if (selected.length === 0) {
                newFormValues[i].solution = [];
                setSowFormValues(newFormValues);
                setInquiry({ ...inquiry, scopeOfWork: newFormValues });
                return;
            }

            if (selected[0]?.customOption) {
                newFormValues[i].solution = [selected[0].label];
                setSowFormValues(newFormValues);
                setInquiry({ ...inquiry, scopeOfWork: newFormValues });
            } else {
                newFormValues[i].solution = selected;
                setSowFormValues(newFormValues);
                setInquiry({ ...inquiry, scopeOfWork: newFormValues });
            }

            return;
        }

        if (type === "extras") {
            let newFormValues = [...sowFormValues];

            if (selected.length === 0) {
                newFormValues[i].extras = [];
                setSowFormValues(newFormValues);
                setInquiry({ ...inquiry, scopeOfWork: newFormValues });
                return;
            }

            let extrasToAdd = [];

            selected.forEach((extra) => {
                if (extra.customOption) {
                    extrasToAdd.push(extra.label);
                    return;
                }

                extrasToAdd.push(extra);
            });

            extrasToAdd = extrasToAdd.filter((x, i, a) => a.indexOf(x) == i);
            newFormValues[i].extras = extrasToAdd;
            setSowFormValues(newFormValues);
            setInquiry({ ...inquiry, scopeOfWork: newFormValues });
        }
    };

    const onDateTimeInputChange = (type, date) => {
        if (date !== "") {
            if (!moment.isMoment(date)) {
                toast.error("Please enter a valid date/time.");
                return;
            }
        }

        if (type === "inquiry-start") {
            setInquiry({ ...inquiry, startDateTime: date === "" ? "" : date.toDate() });
            return;
        }

        if (type === "inquiry-end") {
            setInquiry({ ...inquiry, endDateTime: date === "" ? "" : date.toDate() });
            return;
        }
    };

    const handleEditingInquiry = (inquiry) => {
        const currentCountry = countries.find((country) => country.name == inquiry.country);

        if (currentCountry) {
            setCountry([currentCountry]);
        }

        setCompany([inquiry.company]);
        setSource([inquiry.source]);
        setSowFormValues(inquiry.scope_of_work ? inquiry.scope_of_work : [{ solution: [], extras: [] }]);
        setInquiry({
            id: inquiry.id,
            name: inquiry.name,
            company: inquiry.company,
            country: inquiry.country,
            email: inquiry.email,
            contact: inquiry.contact,
            source: inquiry.source,
            startDateTime: inquiry.start_datetime ? new Date(inquiry.start_datetime) : "",
            endDateTime: inquiry.end_datetime ? new Date(inquiry.end_datetime) : "",
            location: inquiry.location ? inquiry.location : "",
            scopeOfWork: inquiry.scope_of_work ? inquiry.scope_of_work : [],
            comments: inquiry.comments ? inquiry.comments : "",
            activity: inquiry.activity,
        });
    };

    const closeEditInquiryModal = () => {
        setStep(1);
        setSource([]);
        setCompany([]);
        setSowFormValues([{ solution: [], extras: [] }]);
        setInquiry({
            id: "",
            name: "",
            company: "",
            country: "",
            email: "",
            contact: "",
            source: "",
            startDateTime: "",
            endDateTime: "",
            location: "",
            scopeOfWork: [],
            comments: "",
            activity: [],
        });

        onClose();
    };

    const addSowFormFields = () => {
        setSowFormValues([...sowFormValues, { solution: [], extras: [] }]);
    };

    const removeSowFormFields = (i) => {
        let newFormValues = [...sowFormValues];
        newFormValues.splice(i, 1);
        setSowFormValues(newFormValues);
        setInquiry({ ...inquiry, scopeOfWork: newFormValues });
    };

    const handleBackStep = () => {
        if (step !== 1) {
            setStep(step - 1);
        }
    };

    const handleInquirySubmit = async () => {
        try {
            if (step === 1) {
                if (inquiry.name === "") {
                    toast.error("Please enter the name.");
                    return;
                }

                if (inquiry.company === "") {
                    toast.error("Please enter the company.");
                    return;
                }

                if (inquiry.country === "") {
                    toast.error("Please select the country.");
                    return;
                }

                if (inquiry.email === "") {
                    toast.error("Please enter the email.");
                    return;
                }

                if (!isEmail(inquiry.email)) {
                    toast.error("Please enter a valid email.");
                    return;
                }

                if (inquiry.contact === "") {
                    toast.error("Please enter the contact.");
                    return;
                }

                if (inquiry.source === "") {
                    toast.error("Please enter the source.");
                    return;
                }

                setStep(2);
                return;
            }

            if (step === 2) {
                if (inquiry.startDateTime && inquiry.endDateTime) {
                    if (!moment(inquiry.endDateTime).isAfter(inquiry.startDateTime)) {
                        toast.error("Please enter a valid end date/time.");
                        return;
                    }
                }

                if (inquiry.scopeOfWork.length > 0) {
                    for (let sow of inquiry.scopeOfWork) {
                        if (sow.solution.length === 0) {
                            toast.error("Please enter a valid solution.");
                            return;
                        }
                    }
                }

                setWaiting(true);
                const response = await editInternationalInquirySimple(inquiry);

                if (response.status === "ERROR") {
                    setWaiting(false);
                    logger("editInternationalInquirySimple()", response.message);
                    toast.error("Unable to edit inquiry.");
                    return;
                }

                toast.success("Inquiry has been edited.");

                setWaiting(false);
                closeEditInquiryModal();
                router.refresh();
            }
        } catch (error) {
            setWaiting(false);
            logger("editInquiry()", error);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="modal fade" id="edit-inquiry-modal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit inquiry</h5>
                        <button type="button" className="btn-close" onClick={closeEditInquiryModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    {step === 1 && (
                                        <div className="step-one">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label htmlFor="name" className="mb-1">
                                                        Name
                                                    </label>
                                                    <input type="text" id="name" autoComplete="off" className="form-control mb-3" value={inquiry.name} onChange={onInputChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="company" className="mb-1">
                                                        Company
                                                    </label>
                                                    <Typeahead
                                                        id="company"
                                                        inputProps={{ id: "company", autoComplete: "off" }}
                                                        className="mb-3"
                                                        onChange={(selected) => onTypeheadInputChange("company", selected)}
                                                        options={companies || []}
                                                        selected={company}
                                                        paginationText={"Show more results"}
                                                        newSelectionPrefix="Add a company:"
                                                        allowNew
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label htmlFor="country" className="mb-1">
                                                        Country
                                                    </label>
                                                    <Typeahead
                                                        id="country"
                                                        inputProps={{ id: "country", autoComplete: "off" }}
                                                        className="mb-3"
                                                        labelKey={(country) => country.name}
                                                        onChange={(selected) => onTypeheadInputChange("country", selected)}
                                                        options={countries}
                                                        selected={country}
                                                        emptyLabel={"No country found"}
                                                        paginationText={"Show more results"}
                                                        renderMenuItemChildren={(option) => (
                                                            <div className="container" key={option.id}>
                                                                <div className="row mb-0">
                                                                    <div className="col-12">
                                                                        <p className="mb-0">{option.flag + " " + option.name}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="email" className="mb-1">
                                                        Email
                                                    </label>
                                                    <input type="email" id="email" autoComplete="off" className="form-control mb-3" value={inquiry.email} onChange={onInputChange} required />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label htmlFor="contact" className="mb-1">
                                                        Contact
                                                    </label>
                                                    <input type="text" id="contact" autoComplete="off" className="form-control mb-3" value={inquiry.contact} onChange={onInputChange} required />
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
                                                        paginationText={"Show more results"}
                                                        newSelectionPrefix="Add a source:"
                                                        allowNew
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {step === 2 && (
                                        <div className="step-two">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <label htmlFor="inquiryStartDatetime" className="mb-1">
                                                        Start date/time
                                                    </label>
                                                    <Datetime
                                                        inputProps={{ id: "inquiryStartDatetime", autoComplete: "off" }}
                                                        className="mb-3"
                                                        dateFormat="D MMM YYYY"
                                                        timeFormat="h:mm A"
                                                        isValidDate={(current) => {
                                                            const yesterday = moment().subtract(1, "day");
                                                            return current.isAfter(yesterday);
                                                        }}
                                                        onChange={(date) => onDateTimeInputChange("inquiry-start", date)}
                                                        value={inquiry.startDateTime}
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <label htmlFor="inquiryEndDatetime" className="mb-1">
                                                        End date/time
                                                    </label>
                                                    <Datetime
                                                        inputProps={{ id: "inquiryEndDatetime", autoComplete: "off" }}
                                                        className="mb-3"
                                                        dateFormat="D MMM YYYY"
                                                        timeFormat="h:mm A"
                                                        isValidDate={(current) => {
                                                            const yesterday = moment().subtract(1, "day");
                                                            return current.isAfter(yesterday);
                                                        }}
                                                        onChange={(date) => onDateTimeInputChange("inquiry-end", date)}
                                                        value={inquiry.endDateTime}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <label htmlFor="location" className="mb-1">
                                                        Location
                                                    </label>
                                                    <input type="text" id="location" autoComplete="off" className="form-control mb-3" value={inquiry.location} onChange={onInputChange} required />
                                                </div>
                                            </div>
                                            {sowFormValues.map((element, index) => (
                                                <div className="row" key={index}>
                                                    <div className="col-md-6">
                                                        <label htmlFor={"solution-" + index} className="mb-1">
                                                            Solution
                                                        </label>
                                                        <Typeahead
                                                            id="solution"
                                                            inputProps={{ id: "solution-" + index, autoComplete: "off" }}
                                                            className="mb-3"
                                                            onChange={(selected) => onTypeheadInputChange("solution", selected, index)}
                                                            options={solutions}
                                                            selected={element.solution}
                                                            paginationText={"Show more results"}
                                                            newSelectionPrefix="Add a solution:"
                                                            allowNew
                                                        />
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label htmlFor={"extras-" + index} className="mb-1">
                                                            Extra(s)
                                                        </label>
                                                        <Typeahead
                                                            id="extras"
                                                            inputProps={{ id: "extras-" + index, autoComplete: "off" }}
                                                            className="mb-3"
                                                            onChange={(selected) => onTypeheadInputChange("extras", selected, index)}
                                                            options={extras}
                                                            selected={element.extras}
                                                            newSelectionPrefix="Add an extra:"
                                                            paginationText={"Show more results"}
                                                            emptyLabel="No extras found."
                                                            multiple
                                                            allowNew
                                                        />
                                                    </div>
                                                    <div className="col-md-1">
                                                        {index === 0 && (
                                                            <>
                                                                <label className="d-none d-sm-flex mb-1">Add</label>
                                                                <button type="button" className="btn form-btn btn-sm bg-light-subtle d-inline-flex align-items-center justify-content-center mb-3" onClick={() => addSowFormFields()}>
                                                                    <i className="fs-5 ti ti-plus text-info"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                        {index > 0 && (
                                                            <>
                                                                <label className="d-none d-sm-flex mb-1">Remove</label>
                                                                <button
                                                                    type="button"
                                                                    className="btn form-btn btn-sm bg-light-subtle d-inline-flex align-items-center justify-content-center mb-3"
                                                                    onClick={() => removeSowFormFields(index)}>
                                                                    <i className="fs-5 ti ti-minus text-info"></i>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <label htmlFor="comments" className="mb-1">
                                                        Comments
                                                    </label>
                                                    <textarea id="comments" autoComplete="off" className="form-control mb-3" rows={3} onChange={onInputChange} value={inquiry.comments} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {step > 1 && (
                            <button type="button" className="btn btn-outline-primary" onClick={handleBackStep}>
                                Back
                            </button>
                        )}
                        <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleInquirySubmit}>
                            {waiting ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : step === 2 ? (
                                "Save"
                            ) : (
                                "Next"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditInternationalInquiryModal;
