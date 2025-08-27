import moment from "moment";
import Datetime from "react-datetime";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { editEventLogistics } from "@/lib/actions";
import { logger, isObjectEmpty } from "@/lib/utils";

const EditLogisticsModal = ({ onClose, editingLogistics }) => {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [eventLogistics, setEventLogistics] = useState({
    id: "",
    eventName: "",
    startDateTime: "",
    endDateTime: "",
    location: "",
    locationComments: "",
    installationDatetime: "",
    removalDateTime: "",
    contactPersonName: "",
    contactPersonNumber: "",
    permitsNeeded: false,
    brandingNeeded: false,
    promoters: "",
    activity: [],
  });

  useEffect(() => {
    if (!isObjectEmpty(editingLogistics)) {
      handleEditingLogistics(editingLogistics);
      return;
    }
  }, [editingLogistics]);

  const onInputChange = (e) => {
    setEventLogistics({ ...eventLogistics, [e.target.id]: e.target.value });
  };

  const onDateTimeInputChange = (type, date) => {
    if (date !== "") {
      if (!moment.isMoment(date)) {
        toast.error("Please enter a valid date/time.");
        return;
      }
    }

    if (type === "event-start") {
      setEventLogistics({ ...eventLogistics, startDateTime: date === "" ? "" : date.toDate() });
      return;
    }

    if (type === "event-end") {
      setEventLogistics({ ...eventLogistics, endDateTime: date === "" ? "" : date.toDate() });
      return;
    }

    if (type === "installation") {
      setEventLogistics({ ...eventLogistics, installationDatetime: date === "" ? "" : date.toDate() });
      return;
    }

    if (type === "removal") {
      setEventLogistics({ ...eventLogistics, removalDateTime: date === "" ? "" : date.toDate() });
      return;
    }
  };

  const onToggleChange = (e) => {
    if(e.target.id === "permitsNeeded") {
      setEventLogistics({ ...eventLogistics, permitsNeeded: !eventLogistics.permitsNeeded });
    }

    if(e.target.id === "brandingNeeded") {
      setEventLogistics({ ...eventLogistics, brandingNeeded: !eventLogistics.brandingNeeded });
    }
  };

  const closeEditLogisticsModal = () => {
    setEventLogistics({
      id: "",
      eventName: "",
      startDateTime: "",
      endDateTime: "",
      location: "",
      locationComments: "",
      installationDatetime: "",
      removalDateTime: "",
      contactPersonName: "",
      contactPersonNumber: "",
      permitsNeeded: false,
      brandingNeeded: false,
      promoters: "",
      activity: [],
    });
    onClose();
  };

  const handleEditingLogistics = (event) => {
    setEventLogistics({
      id: event.id,
      eventName: event.event_name ? event.event_name : "",
      startDateTime: event.start_datetime ? new Date(event.start_datetime) : "",
      endDateTime: event.end_datetime ? new Date(event.end_datetime) : "",
      location: event.location ? event.location : "",
      locationComments: event.location_comments ? event.location_comments : "",
      installationDatetime: event.installation_datetime ? new Date(event.installation_datetime) : "",
      removalDateTime: event.removal_datetime ? new Date(event.removal_datetime) : "",
      contactPersonName: event.contact_person_name ? event.contact_person_name : "",
      contactPersonNumber: event.contact_person_number ? event.contact_person_number : "",
      permitsNeeded: event.permits_needed,
      brandingNeeded: event.branding_needed,
      promoters: event.promoters ? event.promoters : "",
      activity: event.activity,
    });
  };

  const handleEventSubmit = async () => {
    try {
      if (eventLogistics.installationDatetime) {
        if (moment(eventLogistics.installationDatetime).isAfter(eventLogistics.startDateTime)) {
          toast.error("Please enter a valid installation date/time.");
          return;
        }
      }

      if (eventLogistics.removalDateTime) {
        if (!moment(eventLogistics.removalDateTime).isAfter(eventLogistics.endDateTime)) {
          toast.error("Please enter a valid removal date/time.");
          return;
        }
      }

      setWaiting(true);
      const response = await editEventLogistics(eventLogistics);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("editEventLogistics()", response.message);
        toast.error("Unable to edit event logistics.");
        return;
      }

      toast.success("Event logistics have been edited.");
      setWaiting(false);
      closeEditLogisticsModal();
      router.refresh();
    } catch (error) {
      setWaiting(false);
      logger("editEventLogistics()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="modal fade" id="edit-logistics-modal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit event logistics</h5>
            <button type="button" className="btn-close" onClick={closeEditLogisticsModal}></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="eventName" className="mb-1">
                    Event name
                  </label>
                  <input type="text" id="eventName" autoComplete="off" className="form-control mb-3" value={eventLogistics.eventName} onChange={onInputChange} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="promoters" className="mb-1">
                    Promoter(s)
                  </label>
                  <input type="text" id="promoters" autoComplete="off" className="form-control mb-3" value={eventLogistics.promoters} onChange={onInputChange} required />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="startDateTime" className="mb-1">
                    Event start date/time
                  </label>
                  <Datetime
                    inputProps={{ id: "startDateTime", autoComplete: "off" }}
                    className="mb-3"
                    dateFormat="D MMM YYYY"
                    timeFormat="h:mm A"
                    isValidDate={(current) => {
                      const yesterday = moment().subtract(1, "day");
                      return current.isAfter(yesterday);
                    }}
                    onChange={(date) => onDateTimeInputChange("event-start", date)}
                    value={eventLogistics.startDateTime}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="endDateTime" className="mb-1">
                    Event end date/time
                  </label>
                  <Datetime
                    inputProps={{ id: "endDateTime", autoComplete: "off" }}
                    className="mb-3"
                    dateFormat="D MMM YYYY"
                    timeFormat="h:mm A"
                    isValidDate={(current) => {
                      const yesterday = moment().subtract(1, "day");
                      return current.isAfter(yesterday);
                    }}
                    onChange={(date) => onDateTimeInputChange("event-end", date)}
                    value={eventLogistics.endDateTime}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="installationDatetime" className="mb-1">
                    Installation date/time
                  </label>
                  <Datetime
                    inputProps={{ id: "installationDatetime", autoComplete: "off" }}
                    className="mb-3"
                    dateFormat="D MMM YYYY"
                    timeFormat="h:mm A"
                    isValidDate={(current) => {
                      const yesterday = moment().subtract(1, "day");
                      return current.isAfter(yesterday);
                    }}
                    onChange={(date) => onDateTimeInputChange("installation", date)}
                    value={eventLogistics.installationDatetime}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="removalDateTime" className="mb-1">
                    Removal date/time
                  </label>
                  <Datetime
                    inputProps={{ id: "removalDateTime", autoComplete: "off" }}
                    className="mb-3"
                    dateFormat="D MMM YYYY"
                    timeFormat="h:mm A"
                    isValidDate={(current) => {
                      const yesterday = moment().subtract(1, "day");
                      return current.isAfter(yesterday);
                    }}
                    onChange={(date) => onDateTimeInputChange("removal", date)}
                    value={eventLogistics.removalDateTime}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="contactPersonName" className="mb-1">
                    Contact person name
                  </label>
                  <input type="text" id="contactPersonName" autoComplete="off" className="form-control mb-3" value={eventLogistics.contactPersonName} onChange={onInputChange} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contactPersonNumber" className="mb-1">
                    Contact person number
                  </label>
                  <input type="text" id="contactPersonNumber" autoComplete="off" className="form-control mb-3" value={eventLogistics.contactPersonNumber} onChange={onInputChange} required />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <label htmlFor="location" className="mb-1">
                    Location
                  </label>
                  <input type="text" id="location" autoComplete="off" className="form-control mb-3" value={eventLogistics.location} onChange={onInputChange} required />
                </div>
                <div className="col-md-3">
                  <label htmlFor="permitsNeeded" className="mb-1">
                    Permits needed
                  </label>
                  <div className="form-check form-switch">
                    <input className="form-check-input" autoComplete="off"  type="checkbox" id="permitsNeeded" checked={eventLogistics.permitsNeeded} onChange={onToggleChange} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label htmlFor="brandingNeeded" className="mb-1">
                    Branding needed
                  </label>
                  <div className="form-check form-switch">
                    <input className="form-check-input" autoComplete="off"  type="checkbox" id="brandingNeeded" checked={eventLogistics.brandingNeeded} onChange={onToggleChange} />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <label htmlFor="locationComments" className="mb-1">
                    Location comments
                  </label>
                  <textarea id="locationComments" autoComplete="off" className="form-control" rows={3} onChange={onInputChange} value={eventLogistics.locationComments} />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" disabled={waiting} className="btn btn-primary ms-auto" onClick={handleEventSubmit}>
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

export default EditLogisticsModal;
