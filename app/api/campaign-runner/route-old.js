import { unsubscribeUrl } from "@/lib/data";
import { parseContent, parseSubject } from "@/lib/utils";
import { getCronCampaigns, getClientsByList, sendEmail, updateCampaign, updateUserCampaign } from "@/lib/actions";

export async function GET() {
  let response = await getCronCampaigns();

  if (response.status === "ERROR") {
    console.log("Error: getCronCampaigns()");
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

  const campaigns = response.data;

  if (campaigns.length === 0) {
    console.log("No pending campaigns.");

    return Response.json(
      {
        status: "OK",
        message: "No pending campaigns.",
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const campaign = campaigns[0];
  const template = campaign.template;
  let clients = null;

  console.log("(" + campaign.type + ") " + campaign.name);

  if (campaign.type === "USER") {
    response = await updateUserCampaign(campaign);

    if (response.status === "ERROR") {
      console.log("Error: updateUserCampaign()");
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

    response = await getClientsByList(campaign.list);

    if (response.status === "ERROR") {
      console.log("Error: getClientsByList()");
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

    clients = response.data;
  }

  let ccList = [];

  if (campaign.type === "AUTO") {
    clients = campaign.send_to;

    clients[0].ccList.forEach((email) => {
      ccList.push({
        email: email,
        type: "cc",
      });
    });
  }

  let promises = [];

  for (const client of clients) {
    const isSubscribed = client.subscribed ?? true;

    if (campaign.type === "USER" && !isSubscribed) {
      continue;
    }

    let subject = parseSubject(template.subject, client);
    let html = parseContent(template.content, client);

    if (campaign.type === "USER" && html.includes("[UNSUBSCRIBE]")) {
      const unsubscribeLink = unsubscribeUrl + client.id;
      html = html.replace("[UNSUBSCRIBE]", unsubscribeLink);
    }

    if (campaign.type === "AUTO" && html.includes("[PROPOSALS]")) {
      let proposalHTML = "Here is your proposal: <a href='" + client.proposalLinks[0] + "' target='_blank' rel='noopener noreferrer'>View proposal</a>";

      if (client.proposalLinks.length > 1) {
        proposalHTML = "<p>Here are your proposal(s):</p>";
        proposalHTML += "<ul>";

        client.proposalLinks.forEach((link, index) => {
          const message = "<li><a href='" + link + "' target='_blank' rel='noopener noreferrer'>View proposal " + (index + 1) + "</a></li>";
          proposalHTML += message;
        });

        proposalHTML += "</ul>";
      }

      html = html.replace("[PROPOSALS]", proposalHTML);
    }

    if (campaign.type === "AUTO" && html.includes("[INVOICES]")) {
      let invoiceHTML = "Here is your invoice: <a href='" + client.invoiceLinks[0] + "' target='_blank' rel='noopener noreferrer'>View invoice</a>";

      if (client.invoiceLinks.length > 1) {
        invoiceHTML = "<p>Here are your invoice(s):</p>";
        invoiceHTML += "<ul>";

        client.invoiceLinks.forEach((link, index) => {
          const message = "<li><a href='" + link + "' target='_blank' rel='noopener noreferrer'>View invoice " + (index + 1) + "</a></li>";
          invoiceHTML += message;
        });

        invoiceHTML += "</ul>";
      }

      html = html.replace("[INVOICES]", invoiceHTML);
    }

    if (campaign.type === "AUTO" && html.includes("[REPORT]")) {
      html = html.replace("[REPORT]", client.reportLink);
    }

    let fromEmail = template.from_email;
    let fromName = template.sender_name;

    if (campaign.type === "AUTO" && html.includes("[SALES_MANAGER]")) {
      html = html.replace("[SALES_MANAGER]", client.salesManagerFirstName);
      fromEmail = client.salesManagerEmail;
      fromName = client.salesManagerFirstName + " " + client.salesManagerLastName;
    }

    if (campaign.type === "AUTO" && html.includes("[SIGNATURE]")) {
      html = html.replace("[SIGNATURE]", client.signature);
    }

    const emailData = {
      campaignId: campaign.id,
      subject: subject,
      html: html,
      from_email: fromEmail,
      from_name: fromName,
      to: [
        {
          email: client.email,
          type: "to",
        },
        ...(campaign.type === "AUTO" ? ccList : []),
      ],
    };

    const promise = sendEmail(emailData);
    promises.push(promise);
  }

  await Promise.all(promises);

  response = await updateCampaign(campaign);

  if (response.status === "ERROR") {
    console.log("Error: updateCampaign()");
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

  console.log("Campaign sent successfully");

  return Response.json(
    {
      status: "OK",
      message: "Campaign sent successfully.",
      data: null,
    },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
