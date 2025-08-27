import { useState } from "react";
import dynamic from "next/dynamic";
import { cleanHtml, logger } from "@/lib/utils";
import { emptyHTML } from "@/lib/data";
import { toast } from "react-hot-toast";
import { names, emails } from "@/lib/data";
import { useRouter } from "next/navigation";
import { addTemplate } from "@/lib/actions";
import { Typeahead } from "react-bootstrap-typeahead";

const HTMLEditor = dynamic(
  () => {
    return import("@/components/marketing/html-editor");
  },
  { ssr: false }
);

const AddTemplateModal = ({ onClose }) => {
  const router = useRouter();
  const [senderName, setSenderName] = useState([]);
  const [fromEmail, setFromEmail] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [closeHTMLEditor, setCloseHTMLEditor] = useState(false);
  const [template, setTemplate] = useState({
    key: "",
    name: "",
    senderName: "",
    fromEmail: "",
    subject: "",
    content: "",
  });

  const onInputChange = (e) => {
    setTemplate({ ...template, [e.target.id]: e.target.value });
  };

  const onTypeheadInputChange = (type, selected, i) => {
    if (type === "senderName") {
      setSenderName(selected);

      if (selected.length === 0) {
        setTemplate({ ...template, senderName: "" });
        return;
      }

      setTemplate({ ...template, senderName: selected[0] });

      return;
    }

    if (type === "fromEmail") {
      setFromEmail(selected);

      if (selected.length === 0) {
        setTemplate({ ...template, fromEmail: "" });
        return;
      }

      setTemplate({ ...template, fromEmail: selected[0] });

      return;
    }
  };

  const onHtmlChange = (html) => {
    const cleanedHtml = cleanHtml(html);
    setTemplate({ ...template, content: cleanedHtml });
  };

  const closeAddTemplateModal = () => {
    setCloseHTMLEditor(true);
    setTemplate({
      key: "",
      name: "",
      senderName: "",
      fromEmail: "",
      subject: "",
      content: "",
    });
    onClose();
  };

  const handleTemplateSubmit = async () => {
    try {
      if (template.key === "") {
        toast.error("Please enter the key.");
        return;
      }

      if (template.name === "") {
        toast.error("Please enter the name.");
        return;
      }

      if (template.senderName === "") {
        toast.error("Please select the sender name.");
        return;
      }

      if (template.fromEmail === "") {
        toast.error("Please select the from email.");
        return;
      }

      if (template.subject === "") {
        toast.error("Please enter the subject.");
        return;
      }

      if (!template.content || template.content === emptyHTML) {
        toast.error("Please enter the content.");
        return;
      }

      setWaiting(true);
      const response = await addTemplate(template);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("addTemplate()", response.message);
        toast.error("Unable to add template.");
        return;
      }

      if (response.status === "EXISTS") {
        setWaiting(false);
        toast.error("Template already exists.");
        return;
      }

      toast.success("Template has been added.");

      setWaiting(false);
      closeAddTemplateModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("addTemplate()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="add-template-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add template</h5>
            <button type="button" className="btn-close" onClick={closeAddTemplateModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="row">
                    <div className="col-md-4">
                      <label htmlFor="key" className="mb-1">
                        Key
                      </label>
                      <input type="text" id="key" autoComplete="off" className="form-control mb-3" value={template.key} onChange={onInputChange} required />
                    </div>
                    <div className="col-md-8">
                      <label htmlFor="name" className="mb-1">
                        Name
                      </label>
                      <input type="text" id="name" autoComplete="off" className="form-control mb-3" value={template.name} onChange={onInputChange} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="senderName" className="mb-1">
                        Sender name
                      </label>
                      <Typeahead
                        id="senderName"
                        inputProps={{ id: "senderName", autoComplete: "off" }}
                        className="mb-3"
                        paginationText={"Show more results"}
                        onChange={(selected) => onTypeheadInputChange("senderName", selected)}
                        options={names}
                        selected={senderName}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="fromEmail" className="mb-1">
                        From email
                      </label>
                      <Typeahead
                        id="fromEmail"
                        inputProps={{ id: "fromEmail", autoComplete: "off" }}
                        className="mb-3"
                        paginationText={"Show more results"}
                        onChange={(selected) => onTypeheadInputChange("fromEmail", selected)}
                        options={emails}
                        selected={fromEmail}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <label htmlFor="subject" className="mb-1">
                        Subject
                      </label>
                      <input type="text" id="subject" autoComplete="off" className="form-control mb-3" value={template.subject} onChange={onInputChange} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <label htmlFor="content" className="mb-1">
                        Content
                      </label>
                      <HTMLEditor onClose={closeHTMLEditor} onChange={onHtmlChange} id={"#add-template-modal"} defaultHTML={emptyHTML} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="d-flex">
              <span className="badge fs-2 text-dark">[FIRST_NAME]</span>
              <span className="badge fs-2 text-dark">[LAST_NAME]</span>
              <span className="badge fs-2 text-dark">[EMAIL]</span>
              <span className="badge fs-2 text-dark">[COMPANY]</span>
              <span className="badge fs-2 text-dark">[UNSUBSCRIBE]</span>
            </div>
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleTemplateSubmit}>
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

export default AddTemplateModal;
