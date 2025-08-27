import { addBirthdayCampaign, getBirthdayClients } from "@/lib/actions";

export async function GET() {
  let response = await getBirthdayClients();

  if (response.status === "ERROR") {
    console.log("Error: getBirthdayClients()");
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

  const clients = response.data;
  console.log("Clients retrieved:", clients);


  if (clients.length === 0) {
    console.log("No pending birthdays.");
    console.log(clients);

    return Response.json(
      {
        status: "OK",
        message: "No pending birthdays.",
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const currentYear = new Date().getFullYear();

  for (const client of clients) {
    const lastWishedYear = client.last_wished_datetime ? new Date(client.last_wished_datetime).getFullYear() : null;

    if (lastWishedYear === currentYear) {
      continue;
    }

    response = await addBirthdayCampaign(client);

    if (response.status === "ERROR") {
      console.log("Error: addBirthdayCampaign()");
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
  }

  console.log("Birthday campaigns added successfully.");

  return Response.json(
    {
      status: "OK",
      message: "Birthday campaigns added successfully.",
      data: null,
    },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}