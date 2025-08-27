import { useState } from "react";
import { logger } from "@/lib/utils";
import { InternationalLostInquiry, InternationalConfirmInquiry } from "@/lib/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const InternationalLostConfirmModal = ({ onClose, selectedInquiry, actionType }) => {
    const router = useRouter();
    const [waiting, setWaiting] = useState(false);

    const closeModal = () => {
        onClose();
    };

    const handleAction = async () => {
        try {
            setWaiting(true);

            const inquiry = { ...selectedInquiry };

            let response;
            if (actionType === 'LOST') {
                response = await InternationalLostInquiry(inquiry);
            } else {
                response = await InternationalConfirmInquiry(inquiry);
            }

            if (response.status === "ERROR") {
                setWaiting(false);
                logger("handleAction()", response.message);
                toast.error(`Unable to mark inquiry as ${actionType === 'LOST' ? 'lost' : 'confirmed'}.`);
                return;
            }

            toast.success(`Inquiry has been marked as ${actionType === 'LOST' ? 'lost' : 'confirmed'}.`);

            setWaiting(false);
            closeModal();
            router.refresh();
        } catch (error) {
            setWaiting(false);
            logger("handleAction()", error);
            toast.error("Something went wrong.");
        }
    };


    return (
        <div className="modal fade" id="lost-inquiry-modal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {actionType === 'LOST' ? 'Lost inquiry' : 'Confirm inquiry'}
                        </h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        <div className="container">
                            <div className="row">
                                <div className="col">
                                    <p className="text-center">
                                        {actionType === 'LOST'
                                            ? 'Are you sure you want to mark this inquiry as lost? This action is irreversible and will send a lost email to the client.'
                                            : 'Are you sure you want to mark this inquiry as confirmed? This action is irreversible.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            disabled={waiting}
                            className="btn btn-primary"
                            onClick={handleAction}
                        >
                            {waiting ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                actionType === 'LOST' ? 'Mark as lost' : 'Mark as confirmed'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InternationalLostConfirmModal;
