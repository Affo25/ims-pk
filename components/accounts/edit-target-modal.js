import { useEffect, useRef, useState } from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isObjectEmpty, logger } from "@/lib/utils";
import { handleFocus, months } from "@/lib/data";
import { editTarget } from "@/lib/actions";

const EditTargetModal = ({ onClose, editingTarget }) => {
    const router = useRouter();
    const [month, setMonth] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [target, setTarget] = useState({
        id: "",
        month: "",
        year: 0,
        target_amount: 0,
        sales_amount: 0,
    });


    useEffect(() => {
        if (!isObjectEmpty(editingTarget)) {
            handleEditingTarget(editingTarget);
            return;
        }
    }, [editingTarget]);

    const onInputChange = (e) => {
        setTarget({ ...target, [e.target.id]: e.target.value });
    };

    const onTypeheadInputChange = (type, selected) => {
        // if (selected.length > 0) {
        //     setMonth(selected[0]);
        //     setTarget({ ...target, month: selected[0] });
        // }

        if (type === "month") {
            setMonth(selected);

            if (selected.length === 0) {
                setTarget({ ...target, month: "" });
                return;
            }

            if (selected[0]?.customOption) {
                setTarget({ ...target, month: selected[0].label });
            } else {
                setTarget({ ...target, month: selected[0] });
            }

            return;
        }
    };

    const handleEditingTarget = (target) => {
        if (target.month) {
            setMonth([target.month]);
        }
        setTarget({
            id: target.id,
            month: target.month || "",
            year: target.year || 0,
            target_amount: target.target_amount || 0,
            sales_amount: target.sales_amount || 0,
        });
    };



    const closeEditTargetModal = () => {
        setMonth([]);
        setTarget({
            month: "",
            year: 0,
            target_amount: 0,
            sales_amount: 0,
        });
        onClose();
    };

    const handleTargetSubmit = async () => {
        try {
            setWaiting(true);

            const response = await editTarget(target);
            if (response.status === "ERROR") {
                console.error("Error:", response.message);
                toast.error("Unable to edit target.");
            }

            if (response.status === "EXISTS") {
                setWaiting(false);
                toast.error("Target already exists.");
                return;
            }

            toast.success("Target has been edited.");
            setWaiting(false);
            closeEditTargetModal();
            router.refresh();
        } catch (error) {
            setWaiting(false);
            logger("editTarget()", error);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div
            className="modal fade"
            id="edit-target-modal"
            tabIndex="-1"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Target</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={closeEditTargetModal}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    <label htmlFor="month" className="mb-1">
                                        Month
                                    </label>
                                    <Typeahead
                                        id="month"
                                        inputProps={{ id: "month", autoComplete: "off" }}
                                        className="mb-3"
                                        onChange={(selected) => onTypeheadInputChange("month", selected)}
                                        options={months}
                                        selected={month}
                                        paginationText={"Show more results"}
                                        newSelectionPrefix="Add a month:"
                                        allowNew
                                    />

                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="year" className="mb-1">
                                        Year
                                    </label>
                                    <input
                                        type="text"
                                        id="year"
                                        autoComplete="off"
                                        className="form-control mb-3"
                                        value={target.year}
                                        onChange={onInputChange}
                                        onFocus={handleFocus}
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label htmlFor="target_amount" className="mb-1">
                                        Target Amount
                                    </label>
                                    <input
                                        type="number"
                                        id="target_amount"
                                        autoComplete="off"
                                        className="form-control mb-3"
                                        value={target.target_amount}
                                        onChange={onInputChange}
                                        onFocus={handleFocus}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="sales_amount" className="mb-1">
                                        Sales Amount
                                    </label>
                                    <input
                                        type="number"
                                        id="sales_amount"
                                        autoComplete="off"
                                        className="form-control mb-3"
                                        value={target.sales_amount}
                                        onChange={onInputChange}
                                        onFocus={handleFocus}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            disabled={waiting}
                            className="btn btn-primary ms-auto"
                            onClick={handleTargetSubmit}
                        >
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

export default EditTargetModal;
