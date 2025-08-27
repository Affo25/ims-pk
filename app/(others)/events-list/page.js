import { getEventsList } from "@/lib/actions";
import EventsListBody from "./events-list-body";

const EventsList = async () => {
  const response = await getEventsList();

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Events list</h4>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5">
                
              </div>
            </div>
          </div>
        </div>
      </div>
      {response.status === "OK" ? <EventsListBody data={response.data} /> : <p>{response.message}</p>}
    </>
  );
};

export default EventsList;
