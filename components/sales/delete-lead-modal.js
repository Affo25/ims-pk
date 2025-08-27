import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { deleteLead } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DeleteLeadModal = ({ onClose, selectedLead }) => {
    const router = useRouter();
    const [waiting, setWaiting] = useState(false);

    const closeDeleteleadModal = () => {
        onClose();
    };

    const handleDeleteLead = async () => {
        try {
            setWaiting(true);

            const response = await deleteLead(selectedLead);

            if (response.status === "ERROR") {
                setWaiting(false);
                logger("deletelead()", response.message);
                toast.error("Unable to delete lead.");
                return;
            }

            toast.success("lead has been deleted.");

            setWaiting(false);
            closeDeleteleadModal();
            router.refresh();
        } catch (error) {
            setWaiting(false);
            logger("deleteLead()", error);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="modal fade" id="delete-lead-modal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Delete lead</h5>
                        <button type="button" className="btn-close" onClick={closeDeleteleadModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row">
                                <div className="col text-center">
                                    <p className="mb-0">
                                        Are you sure you want to delete this lead? This action is irreversible and cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleDeleteLead}>
                            {waiting ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteLeadModal;
