import { toast } from "react-hot-toast";
import { editUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logger, isObjectEmpty } from "@/lib/utils";
import { Typeahead } from "react-bootstrap-typeahead";
import { userAreas, userData, userType } from "@/lib/data";

const EditUserModal = ({ onClose, editingUser }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [country, setCountry] = useState([]);
  const [type, setType] = useState([]);
  const [areas, setAreas] = useState([]);
  const [user, setUser] = useState({
    id: "",
    firstName: "",
    lastName: "",
    designation: "",
    country: "",
    type: "",
    areas: [],
  });

  useEffect(() => {
    if (!isObjectEmpty(editingUser)) {
      handleEditingUser(editingUser);
      return;
    }
  }, [editingUser]);

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.id]: e.target.value });
  };

  const onTypeheadInputChange = (type, selected) => {
    if (type === "country") {
      setCountry(selected);

      if (selected.length === 0) {
        setUser({ ...user, country: "" });
        return;
      }

      setUser({ ...user, country: selected[0].country });
      return;
    }

    if (type === "type") {
      setType(selected);

      if (selected.length === 0) {
        setUser({ ...user, type: "" });
        return;
      }

      setUser({ ...user, type: selected[0] });
      return;
    }

    if (type === "areas") {
      if (selected.length === 0) {
        setAreas([]);
        setUser({ ...user, areas: [] });
        return;
      }

      let selectedAreas = [];

      selected.forEach((area) => {
        selectedAreas.push(area);
      });

      setAreas(selectedAreas);
      setUser({ ...user, areas: selectedAreas });
    }
  };

  const handleEditingUser = (user) => {
    setCountry([user.country]);
    setType([user.type]);
    setAreas(user.areas);
    setUser({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      designation: user.designation,
      country: user.country,
      type: user.type,
      areas: user.areas,
    });
  };

  const closeEditUserModal = () => {
    setCountry([]);
    setType([]);
    setAreas([]);
    setUser({
      id: "",
      firstName: "",
      lastName: "",
      designation: "",
      country: "",
      type: "",
      areas: [],
    });
    onClose();
  };

  const handleUserSubmit = async () => {
    try {
      if (user.firstName === "") {
        toast.error("Please enter the first name.");
        return;
      }
      if (user.lastName === "") {
        toast.error("Please enter the last name.");
        return;
      }
      if (user.designation === "") {
        toast.error("Please enter the designation.");
        return;
      }
      if (user.country === "") {
        toast.error("Please enter the country.");
        return;
      }
      if (user.type === "") {
        toast.error("Please enter the type.");
        return;
      }
      if (user.areas.length === 0) {
        toast.error("Please enter the areas.");
        return;
      }

      setWaiting(true);
      const response = await editUser(user);
      if (response.status === "ERROR") {
        setWaiting(false);
        logger("editUser()", response.message);
        toast.error("Unable to edit user.");
        return;
      }

      toast.success("User has been edited.");
      setWaiting(false);
      closeEditUserModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("editUser()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="edit-user-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit user</h5>
            <button type="button" className="btn-close" onClick={closeEditUserModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col">
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="mb-1">
                        First name
                      </label>
                      <input type="text" id="firstName" autoComplete="off" className="form-control mb-3" value={user.firstName} onChange={onInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="lastName" className="mb-1">
                        Last name
                      </label>
                      <input type="text" id="lastName" autoComplete="off" className="form-control mb-3" value={user.lastName} onChange={onInputChange} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="designation" className="mb-1">
                        Designation
                      </label>
                      <input type="text" id="designation" autoComplete="off" className="form-control mb-3" value={user.designation} onChange={onInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="country" className="mb-1">
                        Country
                      </label>
                      <Typeahead
                        id="country"
                        inputProps={{ id: "country", autoComplete: "off" }}
                        className="mb-3"
                        paginationText={"Show more results"}
                        labelKey="country"
                        onChange={(selected) => onTypeheadInputChange("country", selected)}
                        options={userData}
                        selected={country}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label htmlFor="type" className="mb-1">
                        Type
                      </label>
                      <Typeahead
                        id="type"
                        inputProps={{ id: "type", autoComplete: "off" }}
                        className="mb-3"
                        paginationText={"Show more results"}
                        onChange={(selected) => onTypeheadInputChange("type", selected)}
                        options={userType}
                        selected={type}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="type" className="mb-1">
                        Areas
                      </label>
                      <Typeahead
                        id="areas"
                        inputProps={{ id: "areas", autoComplete: "off" }}
                        className="mb-3"
                        onChange={(selected) => onTypeheadInputChange("areas", selected)}
                        options={userAreas}
                        selected={areas}
                        paginationText={"Show more results"}
                        emptyLabel="No areas found."
                        multiple
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleUserSubmit}>
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

export default EditUserModal;
