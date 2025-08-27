import moment from "moment";
import { editClient } from "@/lib/actions";
import Datetime from "react-datetime";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { countries, sources, fishs } from "@/lib/data";
import { Typeahead } from "react-bootstrap-typeahead";
import { logger, isEmail, isObjectEmpty } from "@/lib/utils";

const EditClientModal = ({ onClose, editingClient, lists, companies }) => {

  const router = useRouter();
  const typeaheadRef = useRef(null);
  const [source, setSource] = useState([]);
  const [fish, setFish] = useState([]);
  const [company, setCompany] = useState([]);
  const [country, setCountry] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [client, setClient] = useState({
    id: "",
    name: "",
    company: "",
    country: "",
    email: "",
    contact: "",
    source: "",
    fish: "",
    website: "",
    dateOfBirth: "",
    list: "",
    subscribed: true,
  });

  useEffect(() => {
    if (!isObjectEmpty(editingClient)) {
      handleEditingClient(editingClient);
      return;
    }
  }, [editingClient]);

  const onToggleChange = () => {
    setClient({ ...client, subscribed: !client.subscribed });
  };

  const onInputChange = (e) => {
    setClient({ ...client, [e.target.id]: e.target.value });
  };

  const onTypeheadInputChange = (type, selected) => {
    if (type === "company") {
      setCompany(selected);

      if (selected.length === 0) {
        setClient({ ...client, company: "" });
        return;
      }

      if (selected[0]?.customOption) {
        setClient({ ...client, company: selected[0].label });
      } else {
        setClient({ ...client, company: selected[0] });
      }

      return;
    }

    if (type === "country") {
      setCountry(selected);

      if (selected.length === 0) {
        setClient({ ...client, country: "" });
        return;
      }

      setClient({ ...client, country: selected[0].name });

      return;
    }

    if (type === "source") {
      setSource(selected);

      if (selected.length === 0) {
        setClient({ ...client, source: "" });
        return;
      }

      if (selected[0]?.customOption) {
        setClient({ ...client, source: selected[0].label });
      } else {
        setClient({ ...client, source: selected[0] });
      }

      return;
    }

    if (type === "fish") {
      setFish(selected);

      if (selected.length === 0) {
        setClient({ ...client, fish: "" });
        return;
      }

      if (selected[0]?.customOption) {
        setClient({ ...client, fish: selected[0].label });
      } else {
        setClient({ ...client, fish: selected[0] });
      }

      return;
    }

    if (type === "list") {
      setSelectedList(selected);

      if (selected.length === 0) {
        setClient({ ...client, list: "" });
        return;
      }

      const selectedListNames = selected.map(item => item.name || item.label).join(',');
      setSelectedList(selected);
      setClient({ ...client, list: selectedListNames });
      return;
    }

  };

  const handleEditingClient = (client) => {
    let currentCountry = "";

    if (client.country) {
      currentCountry = countries.find((country) => country.name == client.country);

      if (currentCountry) {
        setCountry([currentCountry]);
      }
    }

    const clientLists = Array.isArray(client.list)
      ? client.list
      : client.list.split(",").map(item => item.trim());

    let currentList = clientLists
      .map(name => lists.find(list => list.name === name))
      .filter(Boolean);



    // const currentList = lists.find((list) => list.name == client.list);


    setSelectedList(currentList);

    if (currentList) {
      setSelectedList(currentList);
      //   setSelectedList([currentList]);
    }

    if (client.company) {
      setCompany([client.company]);
    }

    if (client.source) {
      setSource([client.source]);
    }
    if (client.fish) {
      setFish([client.fish]);
    }

    setClient({
      id: client.id,
      name: client.name ? client.name : "",
      company: client.company ? client.company : "",
      country: client.country ? client.country : "",
      email: client.email,
      contact: client.contact ? client.contact : "",
      source: client.source ? client.source : "",
      fish: client.fish ? client.fish : "",
      website: client.website ? client.website : "",
      dateOfBirth: client.date_of_birth ? new Date(client.date_of_birth) : "",
      list: clientLists.join(','),
      subscribed: client.subscribed,
    });
  };

  const onDateTimeInputChange = (date) => {
    if (date !== "") {
      if (!moment.isMoment(date)) {
        toast.error("Please enter a valid birthday date.");
        return;
      }
    }

    setClient({ ...client, dateOfBirth: date === "" ? "" : date.toDate() });
    return;
  };

  const closeEditClientModal = () => {
    setCompany([]);
    setCountry([]);
    setSource([]);
    setFish([]);
    setSelectedList([]);
    setClient({
      name: "",
      company: "",
      country: "",
      email: "",
      contact: "",
      source: "",
      fish: "",
      website: "",
      dateOfBirth: "",
      list: "",
      subscribed: true,
    });
    onClose();
  };

  const handleClientSubmit = async () => {
    try {
      if (client.email === "") {
        toast.error("Please enter the email.");
        return;
      }

      if (!isEmail(client.email)) {
        toast.error("Please enter a valid email.");
        return;
      }

      if (client.list === "") {
        toast.error("Please select a list.");
        return;
      }

      setWaiting(true);
      const response = await editClient(client);


      if (response.status === "ERROR") {
        setWaiting(false);
        logger("editClient()", response.message);
        toast.error("Unable to edit client.");
        return;
      }

      if (response.status === "EXISTS") {
        setWaiting(false);
        toast.error("Client already exists.");
        return;
      }

      toast.success("Client has been edited.");

      setWaiting(false);
      closeEditClientModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("editClient()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="edit-client-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit client</h5>
            <button type="button" className="btn-close" onClick={closeEditClientModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="name" className="mb-1">
                        Name
                      </label>
                      <input type="text" id="name" autoComplete="off" className="form-control mb-3" value={client.name} onChange={onInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="company" className="mb-1">
                        Company
                      </label>
                      <Typeahead
                        id="company"
                        inputProps={{ id: "company", autoComplete: "off" }}
                        className="mb-3"
                        paginationText={"Show more results"}
                        onChange={(selected) => onTypeheadInputChange("company", selected)}
                        options={companies}
                        selected={company || []}
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
                        inputProps={{ id: "country" }}
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
                      <input type="email" id="email" autoComplete="off" className="form-control mb-3" value={client.email} onChange={onInputChange} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="contact" className="mb-1">
                        Contact
                      </label>
                      <input type="text" id="contact" autoComplete="off" className="form-control mb-3" value={client.contact} onChange={onInputChange} required />
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
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="website" className="mb-1">
                        Website
                      </label>
                      <input type="text" id="website" autoComplete="off" className="form-control mb-3" value={client.website} onChange={onInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="dateOfBirth" className="mb-1">
                        Date of birth
                      </label>
                      <Datetime
                        inputProps={{ id: "dateOfBirth", autoComplete: "off" }}
                        className="mb-3"
                        dateFormat="D MMM YYYY"
                        timeFormat={false}
                        onChange={onDateTimeInputChange}
                        value={client.dateOfBirth}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="selectedList" className="mb-1">
                        List
                      </label>
                      <Typeahead
                        ref={typeaheadRef}
                        id="selectedList"
                        inputProps={{ id: "selectedList", autoComplete: "off" }}
                        className="mb-3"
                        labelKey={(list) => list?.name || "Unnamed List"}
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
                    <div className="col-md-6">
                      <label htmlFor="fish" className="mb-1">
                        Fish
                      </label>
                      <Typeahead
                        id="fish"
                        inputProps={{ id: "fish", autoComplete: "off" }}
                        className="mb-3"
                        onChange={(selected) => onTypeheadInputChange("fish", selected)}
                        options={fishs}
                        selected={fish}
                        paginationText={"Show more results"}
                        newSelectionPrefix="Add a fish:"
                        allowNew
                      />
                    </div>

                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="subscribed" className="mb-1">
                        Subscribed
                      </label>
                      <div className="form-check form-switch">
                        <input className="form-check-input" id="subscribed" autoComplete="off" type="checkbox" checked={client.subscribed} onChange={onToggleChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleClientSubmit}>
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

export default EditClientModal;
