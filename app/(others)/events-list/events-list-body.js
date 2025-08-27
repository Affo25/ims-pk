"use client";

import { useEffect, useState } from "react";
import { format, isBefore, isAfter } from "date-fns";

const EventsListBody = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);
  const [liveEventHeaders, setLiveEventHeaders] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingEventHeaders, setUpcomingEventHeaders] = useState([]);

  // useEffect(() => {
  //   loadEvents(data);

  //   const interval = setInterval(() => {
  //     loadEvents(data);
  //   }, 600);

  //   return () => clearInterval(interval);
  // }, [data]);

  useEffect(() => {
    loadEvents(data);
    const interval = setInterval(() => {
      window.location.reload();
    }, 60000);

    return () => clearInterval(interval);
  }, []);


  const loadEvents = (events) => {
    const now = new Date();
    const live = [];
    const upcoming = [];

    events.forEach((event) => {
      const eventDate = event.start_datetime;

      if (isBefore(eventDate, now)) {
        live.push(event);
      } else if (isAfter(eventDate, now)) {
        upcoming.push(event);
      }
    });

    setLiveEvents(live);
    setUpcomingEvents(upcoming);

    if (live.length > 0) {
      setLiveEventHeaders(Object.keys(live[0]));
    }
    if (upcoming.length > 0) {
      setUpcomingEventHeaders(Object.keys(upcoming[0]));
    }

    setLoading(false);

  };


  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-body p-3">
              <h4 className="fw-semibold">Live events</h4>
              <div className="table-responsive border rounded">
                <table id="live-events-table" className="table table-hover align-middle text-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Event name</th>
                      <th>Contacts</th>
                      <th>Event dates</th>
                      <th>Solutions</th>
                      <th>Software status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveEvents.map((row, index) => (
                      <tr key={index}>
                        <td>
                          {row.event_name} <br /> <b>{row.company}</b>
                        </td>
                        <td>
                          {row.name} <br /> {row.email} <br /> {row.contact}
                        </td>
                        <td >
                          {liveEventHeaders
                            .filter(
                              (header) =>
                                !["event_name", "company", "name", "email", "contact", "software_status", "scope_of_work"].includes(header)
                            )
                            .map((header) => (
                              <span key={header}>
                                {header === "start_datetime" || header === "end_datetime" ? (
                                  <span className={`badge mt-1 me-1 ${header === "start_datetime" ? "bg-primary" : "bg-danger"
                                    }`}>
                                    {format(new Date(row[header]), "dd MMM yyyy h:mm a")}
                                  </span>
                                ) : (
                                  <span
                                    title="Confirm date"
                                    style={{ color: "black", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                                    className="badge mt-1"
                                  >
                                    {format(new Date(row[header]), "dd MMM yyyy h:mm a")}
                                  </span>
                                )}
                              </span>
                            ))}
                        </td>

                        <td>
                          {(() => {
                            try {
                              let parsed =
                                typeof row.scope_of_work === "string"
                                  ? JSON.parse(row.scope_of_work)
                                  : row.scope_of_work;

                              return parsed.map((item, index) =>
                                item.solution.map((solution, subIndex) => (
                                  <span key={`${index}-${subIndex}`} className="badge badge-dark bg-primary me-1">
                                    {solution}
                                  </span>
                                ))
                              );
                            } catch (error) {
                              return <span className="badge badge-danger">Invalid Data</span>;
                            }
                          })()}
                        </td>

                        <td
                          className={
                            row.software_status === "PENDING"
                              ? "text-warning fw-bold"
                              : row.software_status === "ARCHIVED"
                                ? "text-success fw-bold"
                                : ""
                          }
                        >
                          {row.software_status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <div className="card-body p-3">
              <h4 className="fw-semibold">Upcoming events</h4>
              <div className="table-responsive border rounded">
                <table id="upcoming-events-table" className="table table-hover align-middle text-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>Event name</th>
                      <th>Contacts</th>
                      <th>Event dates</th>
                      <th>Solutions</th>
                      <th>Software status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.map((row, index) => (
                      <tr key={index}>
                        <td>
                          {row.event_name} <br /> <b> {row.company} </b>
                        </td>
                        <td>
                          {row.name} <br /> {row.email} <br /> {row.contact}
                        </td>
                        <td>
                          {upcomingEventHeaders
                            .filter(
                              (header) =>
                                !["event_name", "company", "name", "email", "contact", "software_status", "scope_of_work"].includes(header)
                            )
                            .map((header) => (
                              <span key={header}>
                                {header === "start_datetime" || header === "end_datetime" ? (
                                  <span className={`badge mt-1 me-1 ${header === "start_datetime" ? "bg-primary" : "bg-danger"}`}>
                                    {format(new Date(row[header]), "dd MMM yyyy h:mm a")}
                                  </span>
                                ) : (
                                  <span
                                    title="Confirm date"
                                    style={{ color: "black", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                                    className="badge mt-1"
                                  >
                                    {format(new Date(row[header]), "dd MMM yyyy h:mm a")}
                                  </span>
                                )}
                              </span>
                            ))}
                        </td>

                        <td>
                          {(() => {
                            try {
                              let parsed =
                                typeof row.scope_of_work === "string"
                                  ? JSON.parse(row.scope_of_work)
                                  : row.scope_of_work;

                              return parsed.map((item, index) =>
                                item.solution.map((solution, subIndex) => (
                                  <span key={`${index}-${subIndex}`} className="badge badge-dark bg-primary me-1">
                                    {solution}
                                  </span>
                                ))
                              );
                            } catch (error) {
                              return <span className="badge badge-danger">Invalid Data</span>;
                            }
                          })()}
                        </td>
                        <td
                          className={
                            row.software_status === "PENDING"
                              ? "text-warning fw-bold"
                              : row.software_status === "ARCHIVED"
                                ? "text-success fw-bold"
                                : ""
                          }
                        >
                          {row.software_status}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default EventsListBody;


