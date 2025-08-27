import axios from "axios";
import { addPortalEvent, errorLogger, getLastEventCode } from "@/lib/actions";
import { apiKey, appType, basePortalDomain, createPortalEventUrl, custCode } from "@/lib/data";

export async function POST(request) {
  const payload = await request.json();

  if (!payload) {
    return Response.json(
      {
        status: "ERROR",
        message: "Could not create event on the portal.",
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const { selectedSolution, selectedSoftware } = payload;

  let response = await getLastEventCode();

  if (response.status === "ERROR") {
    console.log("Error: getLastEventCode()");
    console.log(response.message);

    return Response.json(
      {
        status: "ERROR",
        message: response.message,
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const baseCode = year + month;

  let eventCode;

  if (response.data.length === 0) {
    eventCode = baseCode + "000";
  } else {
    const lastEventCode = response.data[response.data.length - 1].event_code.toString();
    const lastNumber = parseInt(lastEventCode.slice(-3), 10);
    const incrementedNumber = String(lastNumber + 1).padStart(3, "0");
    eventCode = baseCode + incrementedNumber;
  }

  const params = {
    cust_code: custCode,
    api_key: apiKey,
  };

  const data = [
    {
      Title: eventCode + " - " + selectedSolution[0],
      VirtualPath: basePortalDomain + eventCode,
      Client: selectedSoftware.eventName,
      AppType: appType,
      EventFromDate: selectedSoftware.startDatetime,
      EventToDate: selectedSoftware.endDatetime,
    },
  ];

  response = await axios.post(createPortalEventUrl, data, {
    params: params,
  });

  if (response.data.Status === "ERROR") {
    await errorLogger("createPortalEvent()", response.data.Message);

    return Response.json(
      {
        status: "ERROR",
        message: response.data.Message,
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const portalEvent = response.data.Data[0];

  console.log("IMS - Event created " + portalEvent.path);

  const event = {
    id: selectedSoftware.id,
    eventCode: eventCode,
    solution: selectedSolution[0],
    path: portalEvent.path,
  };

  response = await addPortalEvent(event);

  if (response.status === "ERROR") {
    console.log("Error: createPortalEvent()");
    console.log(response.message);

    return Response.json(
      {
        status: "ERROR",
        message: response.message,
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return Response.json(
    {
      status: "OK",
      message: "Event created on the portal successfully.",
      data: null,
    },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
