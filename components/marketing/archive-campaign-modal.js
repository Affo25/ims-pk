import { useState } from "react";
import { logger } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { archiveCampaign } from "@/lib/actions";
import { useRouter } from "next/navigation";

const ArchiveCampaignModal = ({ onClose, selectedCampaign }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  const closeArchiveCampaignModal = () => {
    onClose();
  };

  const handleArchiveCampaign = async () => {
    try {
      setWaiting(true);

      const response = await archiveCampaign(selectedCampaign);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("archiveCampaign()", response.message);
        toast.error("Unable to archive campaign.");
        return;
      }

      toast.success("Campaign has been arhived.");

      setWaiting(false);
      closeArchiveCampaignModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("archiveCampaign()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="archive-campaign-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Archive campaign</h5>
            <button type="button" className="btn-close" onClick={closeArchiveCampaignModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col text-center">
                  <p>Are you sure you want to archive this campaign? <br /> This action is irreversible and cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary" onClick={handleArchiveCampaign}>
              {waiting ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                "Archive"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveCampaignModal;
