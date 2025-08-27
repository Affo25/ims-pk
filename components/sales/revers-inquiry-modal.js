import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { revertToSubmitted } from "@/lib/actions";

const ReversInquiryModal = ({ onClose, selectedInquiry, proposalsData }) => {
    const router = useRouter();
    const [waiting, setWaiting] = useState(false);

    const closeModal = () => {
        onClose();
    };

    const handleRevertInquiry = async () => {
        try {
            if (!selectedInquiry) {
                toast.error("Inquiry not selected.");
                return;
            }

            if (!proposalsData || proposalsData.length === 0) {
                toast.error("No proposals found for this inquiry.");
                return;
            }

            setWaiting(true);

            const response = await revertToSubmitted(selectedInquiry, proposalsData);

            if (response.status === "ERROR") {
                toast.error("Unable to revert inquiry.");
                setWaiting(false);
                return;
            }

            toast.success("Inquiry reverted to Submitted.");
            setWaiting(false);
            closeModal();
            router.refresh();
        } catch (error) {
            console.error("handleRevertInquiry()", error);
            toast.error("Something went wrong.");
            setWaiting(false);
        }
    };

    return (
        <div className="modal fade" id="revert-inquiry-modal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-md modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Revert to Submitted</h5>
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        <p className="text-center">
                            Are you sure you want to move this inquiry back to the Submitted section?
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            disabled={waiting}
                            className="btn btn-warning"
                            onClick={handleRevertInquiry}
                        >
                            {waiting ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            ) : (
                                "Revert to Submitted"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReversInquiryModal;
