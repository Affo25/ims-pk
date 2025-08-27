import { unsubscribeUrl } from "@/lib/data";
import { parseContent, parseSubject, delay } from "@/lib/utils";
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
    console.log("No pending campaigns => " + response.message);

    return Response.json(
      {
        status: "OK",
        message: "No pending campaigns.",
        data: null,
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
 console.log("Total pending campaigns =" + campaigns.length);
  const campaign = campaigns[0];
  const template = campaign.template;
  let clients = [];
  let ccList = [];
  let promises = [];

  console.log("(" + campaign.type + ") " + campaign.name + " - " + campaign.list);

  if (campaign.type === "AUTO") {
    clients = campaign.send_to;

    clients[0].ccList.forEach((email) => {
      ccList.push({
        email: email,
        type: "cc",
      });
    });

    for (const client of clients) {
      let subject = parseSubject(template.subject, client);
      let html = parseContent(template.content, client);
      let fromEmail = template.from_email;
      let fromName = template.sender_name;

      if (subject.includes("[START_DATE]")) {
        subject = subject.replace("[START_DATE]", client.startDate ?? "");
      }

      if (html.includes("[PROPOSALS]")) {
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

      if (html.includes("[INVOICES]")) {
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

      if (html.includes("[REPORT]")) {
        html = html.replace("[REPORT]", client.reportLink);
      }

      if (html.includes("[SALES_MANAGER]")) {
        html = html.replace("[SALES_MANAGER]", client.salesManagerFirstName);
        fromEmail = client.salesManagerEmail;
        fromName = client.salesManagerFirstName + " " + client.salesManagerLastName;
      }

      if (html.includes("[SIGNATURE]")) {
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
          ...ccList,
        ],
      };

      const promise = sendEmail(emailData);
      promises.push(promise);
    }

    const results = await Promise.allSettled(promises);

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.log("Error sending email:", result.reason);
      }
    });

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
  else if (campaign.type === "USER") {
    console.log("user campaign");
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

    console.log("clients type = " + campaign.list);
    const lists = campaign.list.split(',').map(s => s.trim());
    response = await getClientsByList(lists);

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

    const totalClients = clients.length;
    console.log("Total clients: " + totalClients);

    const batchSize = 1000;

    for (let i = 0; i < totalClients; i += batchSize) {
      const batchClients = clients.slice(i, i + batchSize);
      const batchPromises = [];

      console.log("Batch " + batchClients.length);
      for (const client of batchClients) {
        const isSubscribed = client.subscribed ?? true;

        if (campaign.type === "USER" && !isSubscribed) {
          continue;
        }

        let subject = parseSubject(template.subject, client);
        let html = parseContent(template.content, client);
        let fromEmail = template.from_email;
        let fromName = template.sender_name;

        if (html.includes("[UNSUBSCRIBE]")) {
          const unsubscribeLink = unsubscribeUrl + client.id;
          html = html.replace("[UNSUBSCRIBE]", unsubscribeLink);
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
          ],
        };

        console.log("Sending email to " + client.email);
        const promise = sendEmail(emailData);
        batchPromises.push(promise);
      }

      console.log("Total batch emails: " + batchPromises.length);
      const results = await Promise.allSettled(batchPromises);

      results.forEach((result) => {
        if (result.status === "rejected") {
          console.log("Error sending email:", result.reason);
        }
      });

      if (i + batchSize < totalClients) {
        await delay(3000);
      }
    }

        console.log("Updating campaign...");
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

  console.log("(" + campaign.type + ") " + campaign.name + " could not be sent");

  return Response.json(
    {
      status: "ERROR",
      message: response.message,
      data: null,
    },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
