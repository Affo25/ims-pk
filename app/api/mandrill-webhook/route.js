import querystring from "querystring";
import { handleMandrillWebhook } from "@/lib/actions";

export async function HEAD(request) {
  return Response("OK", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  try {
    const payload = await request.text();
    const decodedPayload = decodeURIComponent(payload);
    const parsedPayload = querystring.parse(decodedPayload);
    const jsonPayload = parsedPayload.mandrill_events;
    const mandrillEvents = JSON.parse(jsonPayload);
    await handleMandrillWebhook(mandrillEvents);

    return Response.json(
      {
        status: "OK",
        message: null,
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return Response.json(
      {
        status: "OK",
        message: null,
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
