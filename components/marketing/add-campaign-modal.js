import moment from "moment";
import { useState } from "react";
import { format } from "date-fns";
import Datetime from "react-datetime";
import { logger } from "@/lib/utils";
import { addUserCampaign } from "@/lib/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Typeahead } from "react-bootstrap-typeahead";

const AddCampaignModal = ({ onClose, templatesData, lists }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState([]);
  const [campaign, setCampaign] = useState({
    name: "",
    templateId: "",
    list: "",
    sendOn: "",
  });

  const onInputChange = (e) => {
    setCampaign({ ...campaign, [e.target.id]: e.target.value });
  };

  const onTypeheadInputChange = (type, selected) => {
    if (type === "template") {
      setSelectedTemplate(selected);

      if (selected.length === 0) {
        setCampaign({ ...campaign, templateId: "" });
        return;
      }

      setCampaign({ ...campaign, templateId: selected[0].id });
      return;
    }

    // if (type === "list") {
    //   setSelectedList(selected);

    //   if (selected.length === 0) {
    //     setCampaign({ ...campaign, list: "" });
    //     return;
    //   }

    //   setCampaign({ ...campaign, list: selected[0].name });
    //   return;
    // }
    if (type === "list") {
      setSelectedList(selected);

      if (selected.length === 0) {
        setCampaign({ ...campaign, list: [] });
        return;
      }

      setCampaign({ ...campaign, list: selected.map((item) => item.name).join(',') });
      return;
    }
  };

  const onDateTimeInputChange = (date) => {
    if (date !== "") {
      if (!moment.isMoment(date)) {
        toast.error("Please enter a valid date/time.");
        return;
      }
    }

    setCampaign({ ...campaign, sendOn: date === "" ? "" : date.toDate() });
    return;
  };

  const closeAddCampaignModal = () => {
    setCampaign({
      name: "",
      templateId: "",
      list: "",
      sendOn: "",
    });
    setSelectedTemplate([]);
    setSelectedList([]);
    onClose();
  };

  const handleCampaignSubmit = async () => {
    try {
      if (campaign.name === "") {
        toast.error("Please enter the name.");
        return;
      }

      if (campaign.templateId === "") {
        toast.error("Please select a template.");
        return;
      }

      if (campaign.list === "") {
        toast.error("Please select a list.");
        return;
      }

      if (!campaign.sendOn) {
        toast.error("Please add the send on date.");
        return;
      }

      setWaiting(true);
      const response = await addUserCampaign(campaign);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("addUserCampaign()", response.message);
        toast.error("Unable to add campaign.");
        return;
      }

      if (response.status === "EXISTS") {
        setWaiting(false);
        toast.error("Campaign already exists.");
        return;
      }

      toast.success("Campaign has been added.");

      setWaiting(false);
      closeAddCampaignModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("addUserCampaign()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="add-campaign-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add campaign</h5>
            <button type="button" className="btn-close" onClick={closeAddCampaignModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="row">
                    <div className="col-md-12">
                      <label htmlFor="name" className="mb-1">
                        Name
                      </label>
                      <input type="text" id="name" autoComplete="off" className="form-control mb-3" value={campaign.name} onChange={onInputChange} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <label htmlFor="selectedTemplate" className="mb-1">
                        Template
                      </label>
                      <Typeahead
                        id="selectedTemplate"
                        inputProps={{ id: "selectedTemplate" }}
                        className="mb-3"
                        labelKey={(template) => template.name}
                        onChange={(selected) => onTypeheadInputChange("template", selected)}
                        options={templatesData || []}
                        selected={selectedTemplate}
                        emptyLabel={"No templates found"}
                        paginationText={"Show more results"}
                        renderMenuItemChildren={(option) => (
                          <div className="container" key={option.id}>
                            <div className="row mb-0">
                              <div className="col-8">
                                <p className="mb-0">{option.name}</p>
                                <p className="mb-0">Created on {format(new Date(option.created_at), "dd MMM yyyy h:mm a")}</p>
                              </div>
                              <div className="col-4 text-end align-self-center">
                                <p className="fw-semibold mb-0">[{option.key.toUpperCase()}]</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="selectedList" className="mb-1">
                        List
                      </label>
                      <Typeahead
                        id="selectedList"
                        inputProps={{ id: "selectedList", autoComplete: "off" }}
                        className="mb-3"
                        labelKey={(list) => list.name}
                        onChange={(selected) => onTypeheadInputChange("list", selected)}
                        options={lists.filter(list => list.name !== "REMOVED")}
                        selected={selectedList}
                        newSelectionPrefix="Add an extra:"
                        paginationText={"Show more results"}
                        emptyLabel="No extras found."
                        multiple
                        allowNew
                      />
                    </div>
                    {/* <div className="col-md-6">
                      <label htmlFor="selectedList" className="mb-1">
                        List
                      </label>
                      <Typeahead
                        id="selectedList"
                        inputProps={{ id: "selectedList" }}
                        className="mb-3"
                        labelKey={(list) => list.name}
                        onChange={(selected) => onTypeheadInputChange("list", selected)}
                        options={lists || []}
                        selected={selectedList}
                        emptyLabel={"No lists found"}
                        paginationText={"Show more results"}
                        renderMenuItemChildren={(option) => (
                          <div className="container" key={option.name}>
                            <div className="row mb-0">
                              <div className="col-8">
                                <p className="mb-0 text-capitalize">{option.name}</p>
                              </div>
                              <div className="col-4 text-end align-self-center">
                                <p className="fw-semibold mb-0">{option.size} contact(s)</p>
                              </div>
                            </div>
                          </div>
                        )}
                      />
                    </div> */}
                    <div className="col-md-6">
                      <label htmlFor="sendOn" className="mb-1">
                        Send on
                      </label>
                      <Datetime
                        inputProps={{ id: "sendOn" }}
                        className="mb-3"
                        dateFormat="D MMM YYYY"
                        timeFormat="h:mm A"
                        isValidDate={(current) => {
                          const yesterday = moment().subtract(1, "day");
                          return current.isAfter(yesterday);
                        }}
                        onChange={(date) => onDateTimeInputChange(date)}
                        value={campaign.sendOn}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleCampaignSubmit}>
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

export default AddCampaignModal;
