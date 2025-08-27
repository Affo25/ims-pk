import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { deletetarget } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DeleteTargetModal = ({ onClose, selectedTarget }) => {
    const router = useRouter();
    const [waiting, setWaiting] = useState(false);

    const closeDeleteTargetModal = () => {
        onClose();
    };

    const handleDeleteTarget = async () => {
        try {
            setWaiting(true);

            const response = await deletetarget(selectedTarget);

            if (response.status === "ERROR") {
                setWaiting(false);
                logger("deletetarget()", response.message);
                toast.error("Unable to delete target.");
                return;
            }

            toast.success("target has been deleted.");

            setWaiting(false);
            closeDeleteTargetModal();
            router.refresh();
        } catch (error) {
            setWaiting(false);
            logger("deletetarget()", error);
            toast.error("Something went wrong.");
        }
    };

    return (
        <div className="modal fade" id="delete-target-modal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Delete target</h5>
                        <button type="button" className="btn-close" onClick={closeDeleteTargetModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row">
                                <div className="col text-center">
                                    <p className="mb-0">
                                        Are you sure you want to delete this target? <br /> This action is irreversible and cannot be undone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleDeleteTarget}>
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

export default DeleteTargetModal;
