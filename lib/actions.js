"use server";

import { cookies } from "next/headers";
import ShortUniqueId from "short-unique-id";
import { getFileExtension } from "@/lib/utils";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { apiKey, invoicesUrl, months, proposalsUrl, reportUrl, signatures } from "@/lib/data";
import { format, differenceInDays, isBefore, isEqual, addDays } from "date-fns";
const mandrill = require("@mailchimp/mailchimp_transactional")(process.env.MANDRILL_KEY);

//#region users
export const getUser = async () => {
  const supabase = await createClient();

  let result = await supabase.auth.getUser();

  if (!result.data?.user || result.error) {
    return {
      status: "ERROR",
      message: "Session has been expired",
      data: null,
    };
  }

  const id = result.data.user.id;
  const email = result.data.user.email;

  result = await supabase.from("users").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("getUser()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    result.data[0].email = email;

    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get user",
    data: null,
  };
};

export const getSalesManager = async (id) => {
  const supabase = await createClient();

  let result = await supabaseAdmin.getUserById(id);

  if (!result.data?.user || result.error) {
    return {
      status: "ERROR",
      message: "Could not get the sales manager.",
      data: null,
    };
  }

  const email = result.data.user.email;

  result = await supabase.from("users").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("getSalesManager()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    result.data[0].email = email;

    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get sales manager",
    data: null,
  };
};

export const getUsers = async () => {
  const supabase = await createClient();

  const result = await supabase.from("users").select("*").order("first_name", { ascending: true });

  if (result.error) {
    await errorLogger("getUsers()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const editUser = async (user) => {
  const supabase = await createClient();

  const result = await supabase
    .from("users")
    .update({
      first_name: user.firstName,
      last_name: user.lastName,
      designation: user.designation,
      type: user.type,
      country: user.country,
      areas: user.areas,
    })
    .eq("id", user.id);

  if (result.error) {
    await errorLogger("editUser()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const signInUser = async (user) => {
  const supabase = await createClient();

  const result = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (result.error) {
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const signUpUser = async () => {
  const supabase = await createClient();

  const result = await supabase.auth.signUp({
    email: "",
    password: "",
  });

  return result;
};

export const signOutUser = async () => {
  const supabase = await createClient();

  await supabase.auth.signOut();
};
//#endregion

//#region leads

export const getLeads = async () => {
  const supabase = await createClient();

  let results = await getUser();
  const user = results.data;
  const result = await supabase.from("leads").select("*").neq("status", "DELETED").order("name", { ascending: true });

  if (result.error) {
    await errorLogger("getLeads()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
    user: user,
  };
};

export const addLead = async (lead) => {
  const supabase = await createClient();
  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("leads")
    .insert({
      name: lead.name,
      email: lead.email.toLowerCase(),
      source: lead.source || null,
      contact: lead.contact,
      bound: lead.bound || null,
      request: lead.request,
      sale: lead.sale || null,
      contact_status: lead.contact_status || null,
      solution: lead.solution || null,
      comments: lead.comments || null,
      user_id: user.id,
      status: "ACTIVE",
      activity: [
        {
          message: "<p class='mb-0'>Lead added by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
      created_at: new Date(),
    })
    .select();

  if (result.error) {
    await errorLogger("addLead()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editLead = async (lead) => {
  const supabase = await createClient();
  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("leads")
    .update({
      name: lead.name,
      email: lead.email.toLowerCase(),
      source: lead.source || null,
      contact: lead.contact,
      bound: lead.bound || null,
      request: lead.request,
      sale: lead.sale || null,
      contact_status: lead.contact_status || null,
      solution: lead.solution || null,
      comments: lead.comments || null,
      activity: [
        {
          message: "<p class='mb-0'>Lead edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", lead.id);

  if (result.error) {
    await errorLogger("editLead()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};



export const deleteLead = async (lead) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("leads")
    .update({
      status: "DELETED",
      activity: [
        {
          message: "<p class='mb-0'" + ">Inquiry deleted by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", lead.id);

  if (result.error) {
    await errorLogger("deleteLead()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

//#endregion

//#region inquiries
export const getNewInquiries = async () => {
  const supabase = await createClient();

  const result = await supabase.from("inquiries").select("*, user:users(*)").eq("status", "NEW").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getNewInquiries()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getSubmittedInquiries = async () => {
  const supabase = await createClient();

  // Step 1: Get all submitted inquiries
  let result = await supabase
    .from("inquiries")
    .select("*, user:users(*)")
    .eq("status", "SUBMITTED")
    .order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getSubmittedInquiries()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let inquiries = result.data;
  const inquiryIds = inquiries.map((inq) => inq.id);

  // Step 2: Get all proposals in one go for all inquiry IDs
  const proposalResult = await supabase
    .from("proposals")
    .select("*")
    .in("inquiry_id", inquiryIds)
    .order("created_at", { ascending: false });

  if (proposalResult.error) {
    await errorLogger("getLatestProposals batch", proposalResult.error.message);

    return {
      status: "ERROR",
      message: proposalResult.error.message,
      data: null,
    };
  }

  const proposals = proposalResult.data;

  // Step 3: Map latest proposal by inquiry_id
  const latestProposalMap = {};
  for (const proposal of proposals) {
    if (!latestProposalMap[proposal.inquiry_id]) {
      latestProposalMap[proposal.inquiry_id] = proposal;
    }
  }

  // Step 4: Attach total_amount from latest proposal to inquiry
  for (const inquiry of inquiries) {
    const latestProposal = latestProposalMap[inquiry.id];
    if (latestProposal) {
      inquiry.total_amount = latestProposal.total_amount;
    }
  }

  return {
    status: "OK",
    message: null,
    data: inquiries,
  };
};
// export const getSubmittedInquiries = async () => {
//   const supabase = await createClient();

//   let result = await supabase.from("inquiries").select("*, user:users(*)").eq("status", "SUBMITTED").order("start_datetime", { ascending: true });

//   if (result.error) {
//     await errorLogger("getSubmittedInquiries()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   let inquiries = result.data;

//   for (const inquiry of inquiries) {
//     result = await getLatestProposal(inquiry.id);

//     if (result.status === "OK") {
//       inquiry.total_amount = result.data.total_amount;
//     }
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: inquiries,
//   };
// };

export const getConfirmedInquiries = async () => {
  const supabase = await createClient();

  const result = await supabase.from("inquiries").select("*, user:users(*)").eq("status", "CONFIRMED").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getConfirmedInquiries()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getLostInquiries = async () => {
  const supabase = await createClient();

  const result = await supabase.from("inquiries").select("*, user:users(*)").eq("status", "LOST").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getLostInquiries()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const addInquiry = async (inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("inquiries")
    .insert({
      name: inquiry.name,
      company: inquiry.company,
      country: inquiry.country,
      email: inquiry.email.toLowerCase(),
      contact: inquiry.contact,
      source: inquiry.source,
      bound: inquiry.bound ? inquiry.bound : null,
      start_datetime: inquiry.startDateTime ? inquiry.startDateTime : null,
      end_datetime: inquiry.endDateTime ? inquiry.endDateTime : null,
      location: inquiry.location ? inquiry.location : null,
      fish: inquiry.fish ? inquiry.fish : null,
      scope_of_work: inquiry.scopeOfWork.length > 0 ? inquiry.scopeOfWork : null,
      comments: inquiry.comments ? inquiry.comments : null,
      lost_reason: null,
      follow_ups: { dates: null, status: "PENDING" },
      user_id: user.id,
      status: "NEW",
      activity: [
        {
          message: "<p class='mb-0'" + ">Inquiry added by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
      created_at: new Date(),
    })
    .select();

  if (result.error) {
    await errorLogger("addInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const inquiryInDb = result.data[0];

  result = await scheduleFollowupEmails(inquiryInDb.id);

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  const client = {
    name: inquiry.name,
    company: inquiry.company,
    country: inquiry.country,
    email: inquiry.email.toLowerCase(),
    contact: inquiry.contact,
    source: inquiry.source,
    bound: inquiry.bound,
    fish: inquiry.fish,
    list: "PROSPECTS",
    subscribed: true,
  };

  result = await addClient(client, "inquiry");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editInquiry = async (inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase.from("inquiries").select("*").eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("cancelFollowups()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const inquiryInDb = result.data[0];

  if (!isEqual(inquiryInDb.start_datetime, inquiry.startDateTime)) {
    result = await supabase.from("campaigns").select("*, template:templates(*)").eq("status", "PENDING").eq("type", "AUTO");

    if (result.error) {
      await errorLogger("editInquiry()", result.error.message);

      return {
        status: "ERROR",
        message: result.error.message,
        data: null,
      };
    }

    const campaigns = result.data;

    for (const campaign of campaigns) {
      if (campaign.name.toLowerCase().includes("follow up")) {
        const lastSpaceIndex = campaign.name.lastIndexOf(" ");
        const inquiryId = campaign.name.substring(lastSpaceIndex + 1);

        if (inquiryId === inquiry.id) {
          result = await supabase
            .from("campaigns")
            .update({
              status: "CANCELLED",
            })
            .eq("id", campaign.id);

          if (result.error) {
            await errorLogger("editInquiry()", result.error.message);

            return {
              status: "ERROR",
              message: result.error.message,
              data: null,
            };
          }
        }
      }
    }
  }

  result = await supabase
    .from("inquiries")
    .update({
      name: inquiry.name,
      company: inquiry.company,
      country: inquiry.country,
      email: inquiry.email.toLowerCase(),
      contact: inquiry.contact,
      source: inquiry.source,
      bound: inquiry.bound ? inquiry.bound : null,
      start_datetime: inquiry.startDateTime ? inquiry.startDateTime : null,
      end_datetime: inquiry.endDateTime ? inquiry.endDateTime : null,
      location: inquiry.location ? inquiry.location : null,
      fish: inquiry.fish ? inquiry.fish : null,
      scope_of_work: inquiry.scopeOfWork.length > 0 ? inquiry.scopeOfWork : null,
      comments: inquiry.comments ? inquiry.comments : null,
      activity: [
        ...inquiry.activity,
        {
          message: "<p class='mb-0'>" + "Inquiry edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
        ...(isEqual(inquiryInDb.start_datetime, inquiry.startDateTime)
          ? []
          : [
            {
              message: "<p class='mb-0'>Follow up emails cancelled by IMS</p>",
              date_time: new Date(),
            },
          ]),
      ],
      ...(!isEqual(inquiryInDb.start_datetime, inquiry.startDateTime) && {
        follow_ups: { dates: null, status: "PENDING" },
      }),
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("editInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }
  ////////////////

  // let eventResult = await getUser();
  // const eventuser = result.data;
  let eventResult = await supabase.from("events").select("*").eq("inquiry_id", inquiry.id);

  if (eventResult.error) {
    await errorLogger("editInquiry()", eventResult.error.message);

    return {
      status: "ERROR",
      message: eventResult.error.message,
      data: null,
    };
  }
  if (eventResult.data.length > 0) {
    const eventData = eventResult.data[0];

    eventResult = await supabase
      .from("events")
      .update({
        start_datetime: inquiry.startDateTime ? inquiry.startDateTime : null,
        end_datetime: inquiry.endDateTime ? inquiry.endDateTime : null,
        scope_of_work: inquiry.scopeOfWork.length > 0 ? inquiry.scopeOfWork : null,
        activity: [
          ...(eventData.activity || []),
          {
            message: "<p class='mb-0'" + ">Event logistics edited by " + user.first_name + "</p>",
            date_time: new Date(),
          },
        ],
      })
      .eq("id", eventData.id);

    if (eventResult.error) {
      await errorLogger("editInquiry()", eventResult.error.message);
      return {
        status: "ERROR",
        message: eventResult.error.message,
        data: null,
      };
    }
  }

  ////////////////

  if (!isEqual(inquiryInDb.start_datetime, inquiry.startDateTime)) {
    result = await scheduleFollowupEmails(inquiry.id);

    if (result.status === "ERROR") {
      return {
        status: "ERROR",
        message: result.message,
        data: null,
      };
    }
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const deleteInquiry = async (inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("inquiries")
    .update({
      status: "DELETED",
      activity: [
        ...inquiry.activity,
        {
          message: "<p class='mb-0'" + ">Inquiry deleted by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("deleteInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const confirmInquiry = async (inquiry, proposals) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  // for (const proposal of proposals) {
  //   result = await supabase
  //     .from("proposals")
  //     .update({
  //       confirmed: true,
  //     })
  //     .eq("id", proposal.id);

  //   if (result.error) {
  //     await errorLogger("confirmInquiry()", result.error.message);

  //     return {
  //       status: "ERROR",
  //       message: result.error.message,
  //       data: null,
  //     };
  //   }
  // }
  // Step: Batch update all proposals
  const proposalIds = proposals.map((p) => p.id);

  result = await supabase
    .from("proposals")
    .update({ confirmed: true })
    .in("id", proposalIds);

  if (result.error) {
    await errorLogger("confirmInquiry()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }


  // const proposalsClient = result.data;

  // let totalAmount = 0;

  // proposalsClient.forEach((proposal) => {
  //   totalAmount += proposal.total_amount;
  // });

  result = await getTemplate("CONFIRM-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  const template = result.data;
  const startDate = inquiry?.start_datetime ? format(new Date(inquiry?.start_datetime), "dd MMM yyyy") : "";

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Confirm email #" + inquiry.id,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: inquiry.name,
        email: inquiry.email,
        company: inquiry.company,
        startDate: startDate,
        ccList: ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "gerald@iboothme.ae", "alex@iboothme.ae", "rg@studio94.ae", "youssef@iboothme.ae"],
      },
    ],
    send_on: new Date(),
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("confirmInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("inquiries")
    .update({
      status: "CONFIRMED",
      activity: [
        ...inquiry.activity,
        {
          message: "<p class='mb-0'" + ">Inquiry marked as confirmed by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("confirmInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await cancelFollowups(inquiry.id);

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  result = await addEvent(inquiry);

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }
  const eventAdded = result.data[0];

  result = await addPayment(proposals, eventAdded);

  if (result.status === "ERROR") {
    await errorLogger("addInvoice()", result.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const revertToSubmitted = async (inquiry, proposals) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  // Step 1: Unconfirm all proposals
  const proposalIds = proposals.map((p) => p.id);
  result = await supabase
    .from("proposals")
    .update({ confirmed: false })
    .in("id", proposalIds);

  if (result.error) {
    await errorLogger("revertToSubmitted()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  // Step 2: Update inquiry status to SUBMITTED
  result = await supabase
    .from("inquiries")
    .update({
      status: "SUBMITTED",
      activity: [
        ...inquiry.activity,
        {
          message: "<p class='mb-0'>Inquiry reverted to submitted by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("revertToSubmitted()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: "Inquiry reverted to submitted successfully",
    data: null,
  };
};
export const lostInquiry = async (inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await getTemplate("LOST-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  const template = result.data;

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Lost email #" + inquiry.id,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: inquiry.name,
        email: inquiry.email,
        company: inquiry.company,
        ccList: ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "youssef@iboothme.ae"],
      },
    ],
    send_on: new Date(),
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("lostInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("inquiries")
    .update({
      lost_reason: inquiry.lost_reason,
      status: "LOST",
      activity: [
        ...inquiry.activity,
        {
          message: "<p class='mb-0'" + ">Inquiry marked as lost by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("lostInquiry()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await cancelFollowups(inquiry.id);

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};


//#international-inquiries
export const getInternationalInquiries = async () => {
  const supabase = await createClient();

  const result = await supabase.from("international_inquiries").select("*, users(*)").neq("status", "DELETE").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getInternationalInquiries()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};
export const addInternationalInquiry = async (inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("international_inquiries")
    .insert({
      name: inquiry.name,
      company: inquiry.company,
      country: inquiry.country,
      email: inquiry.email.toLowerCase(),
      contact: inquiry.contact,
      source: inquiry.source,
      start_datetime: inquiry.startDateTime || null,
      end_datetime: inquiry.endDateTime || null,
      location: inquiry.location || null,
      scope_of_work: inquiry.scopeOfWork.length > 0 ? inquiry.scopeOfWork : null,
      comments: inquiry.comments || null,
      lost_reason: null,
      follow_ups: { dates: null, status: "PENDING" },
      user_id: user.id,
      status: "PENDING",
      activity: [
        {
          message: `<p class='mb-0'>Inquiry added by ${user.first_name}</p>`,
          date_time: new Date(),
        },
      ],
      created_at: new Date(),
    })
    .select();

  if (result.error) {
    await errorLogger("addInternationalInquirySimple()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: "International Inquiry added successfully.",
    data: result.data[0],
  };
};

export const editInternationalInquirySimple = async (inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("international_inquiries")
    .update({
      name: inquiry.name,
      company: inquiry.company,
      country: inquiry.country,
      email: inquiry.email.toLowerCase(),
      contact: inquiry.contact,
      source: inquiry.source,
      start_datetime: inquiry.startDateTime || null,
      end_datetime: inquiry.endDateTime || null,
      location: inquiry.location || null,
      scope_of_work: inquiry.scopeOfWork.length > 0 ? inquiry.scopeOfWork : null,
      comments: inquiry.comments || null,
      activity: [
        ...(inquiry.activity || []),
        {
          message: `<p class='mb-0'>Inquiry edited by ${user.first_name}</p>`,
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("editInternationalInquirySimple()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: "International Inquiry updated successfully.",
    data: null,
  };
};

export const InternationalLostInquiry = async (inquiry) => {
  const supabase = await createClient();
  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("international_inquiries")
    .update({
      status: "LOST",
      activity: [
        ...inquiry.activity,
        {
          message: `<p class='mb-0'>Inquiry marked as lost by ${user.first_name}</p>`,
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("InternationalLostInquiry()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const InternationalConfirmInquiry = async (inquiry) => {
  const supabase = await createClient();
  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("international_inquiries")
    .update({
      status: "CONFIRM",
      activity: [
        ...inquiry.activity,
        {
          message: `<p class='mb-0'>Inquiry marked as confirmed by ${user.first_name}</p>`,
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("InternationalConfirmInquiry()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
//#international-inquiries
//#endregion

//#region proposals
export const getProposals = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("proposals").select("*, inquiry:inquiries(*)").eq("inquiry_id", id).order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getProposals()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getProposal = async (number) => {
  const supabase = await createClient();

  const result = await supabase.from("proposals").select("*, inquiry:inquiries(*, user:users(*))").eq("number", number);

  if (result.error) {
    await errorLogger("getProposal()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get proposal",
    data: null,
  };
};

export const getLatestProposal = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("proposals").select("*").eq("inquiry_id", id).order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getLatestProposal()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: null,
    data: "Unable to get latest proposal",
  };
};

export const getConfirmedProposals = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("proposals").select("*").eq("inquiry_id", id).eq("confirmed", true).order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getConfirmedProposals()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data,
    };
  }

  return {
    status: "ERROR",
    message: null,
    data: "Unable to get confirmed proposals",
  };
};

export const addProposal = async (proposal, inquiry) => {
  const supabase = await createClient();

  const { randomUUID } = new ShortUniqueId({ length: 8 });
  const number = randomUUID();
  let result = await getUser();
  const user = result.data;

  result = await supabase.from("proposals").insert({
    number: number,
    title: proposal.title,
    details: proposal.details,
    subtotal_amount: proposal.subtotalAmount,
    vat_amount: proposal.vatAmount,
    total_amount: proposal.totalAmount,
    inquiry_id: inquiry.id,
    inquiry_data: {
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      contact: inquiry.contact,
      country: inquiry.country,
      user_id: inquiry.user_id,
      comments: inquiry.comments,
      location: inquiry.location,
      start_datetime: inquiry.start_datetime,
      end_datetime: inquiry.end_datetime,
      scope_of_work: inquiry.scope_of_work,
    },
    confirmed: false,
    created_at: new Date(),
  });

  if (result.error) {
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("inquiries")
    .update({
      activity: [
        ...inquiry.activity,
        {
          message:
            "<p class='mb-0'" + ">Proposal " + "<a class='fw-semibold' href='" + proposalsUrl + number + "' target='_blank'>" + "#" + number + "</a>" + " created by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("addProposal()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const sendProposals = async (proposals, inquiry) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await getTemplate("PROPOSAL-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  let template = result.data;
  let proposalNumbers = "";
  let proposalLinks = [];
  let proposalMessage = "";

  proposals.forEach((proposal, index) => {
    const proposalLink = proposalsUrl + proposal.number;
    proposalLinks.push(proposalLink);

    proposalNumbers += proposal.number;

    const message = "<a class='fw-semibold' href='" + proposalLink + "' target='_blank'>#" + proposal.number + "</a>";
    proposalMessage += message;

    if (index < proposals.length - 1) {
      proposalNumbers += ", ";
      proposalMessage += ", ";
    }
  });

  result = await getSalesManager(inquiry.user_id);
  const salesManager = result.data;

  const signature = signatures[salesManager.first_name.toLowerCase()];

  const startDate = inquiry?.start_datetime ? format(new Date(inquiry?.start_datetime), "dd MMM yyyy") : "";

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Proposal(s) email #" + proposalNumbers,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: inquiry.name,
        email: inquiry.email,
        company: inquiry.company,
        proposalLinks: proposalLinks,
        startDate: startDate,
        salesManagerFirstName: salesManager.first_name,
        salesManagerLastName: salesManager.last_name,
        salesManagerEmail: salesManager.email,
        signature: signature,
        ccList: ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "youssef@iboothme.ae"],
      },
    ],
    send_on: new Date(),
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("sendProposals()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("inquiries")
    .update({
      status: "SUBMITTED",
      activity: [
        ...inquiry.activity,
        {
          message: "<p class='mb-0'" + ">Proposal(s) " + proposalMessage + " submitted by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("sendProposals()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
//#endregion

//#region events
// export const addEvent = async (inquiry) => {
//   const supabase = await createClient();

//   let result = await getUser();
//   const user = result.data;

//   result = await supabase.from("events").insert({
//     inquiry_id: inquiry.id,
//     event_name: inquiry.eventName,
//     name: inquiry.name,
//     company: inquiry.company,
//     email: inquiry.email,
//     contact: inquiry.contact,
//     start_datetime: inquiry.start_datetime,
//     end_datetime: inquiry.end_datetime,
//     scope_of_work: inquiry.scope_of_work,
//     event_comments: inquiry.comments ? inquiry.comments : null,
//     location: inquiry.location,
//     location_comments: null,
//     installation_datetime: null,
//     removal_datetime: null,
//     contact_person_name: null,
//     contact_person_number: null,
//     permits_needed: false,
//     branding_needed: false,
//     promoters: null,
//     cancelled_reason: null,
//     software_details: null,
//     software_status: "PENDING",
//     user_id: user.id,
//     status: "ACTIVE",
//     activity: [
//       {
//         message: "<p class='mb-0'" + ">Event created by " + user.first_name + "</p>",
//         date_time: new Date(),
//       },
//     ],
//     created_at: new Date(),
//   });

//   if (result.error) {
//     await errorLogger("addEvent()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: null,
//   };
// };

export const addEvent = async (inquiry) => {
  const supabase = await createClient();
  const { data: userData } = await getUser();
  const user = userData;

  const existingEvent = await supabase
    .from("events")
    .select("*")
    .eq("inquiry_id", inquiry.id)
    .maybeSingle();

  if (existingEvent.error) {
    await errorLogger("addEvent() - check existing", existingEvent.error.message);
    return { status: "ERROR", message: existingEvent.error.message, data: null };
  }

  const eventData = {
    inquiry_id: inquiry.id,
    event_name: inquiry.eventName,
    name: inquiry.name,
    company: inquiry.company,
    email: inquiry.email,
    contact: inquiry.contact,
    start_datetime: inquiry.start_datetime,
    end_datetime: inquiry.end_datetime,
    scope_of_work: inquiry.scope_of_work,
    event_comments: inquiry.comments || null,
    location: inquiry.location,
    location_comments: null,
    installation_datetime: null,
    removal_datetime: null,
    contact_person_name: null,
    contact_person_number: null,
    permits_needed: false,
    branding_needed: false,
    promoters: null,
    cancelled_reason: null,
    software_details: null,
    software_status: "PENDING",
    user_id: user.id,
    status: "ACTIVE",
    activity: [
      {
        message: "<p class='mb-0'>Event created by " + user.first_name + "</p>",
        date_time: new Date(),
      },
    ],
    created_at: new Date(),
  };

  let result;

  if (existingEvent.data) {
    result = await supabase
      .from("events")
      .update(eventData)
      .eq("id", existingEvent.data.id).select();
  } else {
    result = await supabase.from("events").insert(eventData).select();
  }

  if (result.error) {
    await errorLogger("addEvent()", result.error.message);
    return { status: "ERROR", message: result.error.message, data: null };
  }

  return { status: "OK", message: null, data: result.data };
};

export const editEventLogistics = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("events")
    .update({
      event_name: event.eventName ? event.eventName : null,
      start_datetime: event.startDateTime ? event.startDateTime : null,
      end_datetime: event.endDateTime ? event.endDateTime : null,
      location: event.location ? event.location : null,
      location_comments: event.locationComments ? event.locationComments : null,
      installation_datetime: event.installationDatetime ? event.installationDatetime : null,
      removal_datetime: event.removalDateTime ? event.removalDateTime : null,
      contact_person_name: event.contactPersonName ? event.contactPersonName : null,
      contact_person_number: event.contactPersonNumber ? event.contactPersonNumber : null,
      permits_needed: event.permitsNeeded,
      branding_needed: event.brandingNeeded,
      promoters: event.promoters ? event.promoters : null,
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Event logistics edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.id);

  if (result.error) {
    await errorLogger("editEventLogistics()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editEventName = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("events")
    .update({
      event_name: event.eventName,
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Event name edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.eventId);

  if (result.error) {
    await errorLogger("editEventName()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const finishEvent = async (event) => {

  const supabase = await createClient();

  let result = await getUser();

  const user = result.data;

  result = await getConfirmedProposals(event.inquiry_id);


  if (result.status === "ERROR") {
    await errorLogger("finishEvent()", result.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const proposals = result.data;
  result = await supabase.from("clients").select("*").eq("email", event.inquiry.email.toLowerCase());

  if (result.error) {
    await errorLogger("finishEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const existingClient = result.data[0];

  let totalAmount = 0;

  proposals.forEach((proposal) => {
    totalAmount += proposal.total_amount;
  });

  result = await supabase
    .from("clients")
    .update({
      total_events: existingClient.total_events + 1,
      total_spent: existingClient.total_spent + totalAmount,
      last_event_datetime: event.start_datetime,
      list: existingClient.list === "PROSPECTS" ? "RETENTION" : existingClient.list,
    })
    .eq("id", existingClient.id);

  if (result.error) {
    await errorLogger("finishEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }


  result = await getTemplate("FINISH-EMAIL");


  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  let template = result.data;

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Finish email #" + event.inquiry.id,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: event.inquiry.name,
        email: event.inquiry.email,
        company: event.inquiry.company,
        ccList: ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "gerald@iboothme.ae", "alex@iboothme.ae", "rg@studio94.ae", "youssef@iboothme.ae"],
      },
    ],
    send_on: new Date(),
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("finishEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await getTemplate("FEEDBACK-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  template = result.data;
  const currentDate = new Date();
  const dateToSend = new Date(currentDate);
  dateToSend.setDate(dateToSend.getDate() + 2);

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Feedback email #" + event.inquiry.id,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: event.inquiry.name,
        email: event.inquiry.email,
        company: event.inquiry.company,
        ccList: ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "youssef@iboothme.ae"],
      },
    ],
    send_on: dateToSend,
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("finishEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("events")
    .update({
      status: "FINISHED",
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Event marked as finished by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.id);

  if (result.error) {
    await errorLogger("finishEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await addPayment(proposals, event);

  if (result.status === "ERROR") {
    await errorLogger("addInvoice()", result.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const cancelEvent = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("events")
    .update({
      cancelled_reason: event.cancelled_reason,
      status: "CANCELLED",
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Event marked as cancelled by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.id);

  if (result.error) {
    await errorLogger("cancelEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const restoreCancelEvent = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("events")
    .update({
      cancelled_reason: null,
      status: "ACTIVE",
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Event marked as active by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.id);

  if (result.error) {
    await errorLogger("restoreCancelEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const getEventsList = async () => {
  const supabase = await createClient();

  const result = await supabase.from("events").select("event_name, company, start_datetime, end_datetime, software_status, name, email, contact, scope_of_work, created_at").eq("status", "ACTIVE").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getEventsList()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};


// export const getActiveEvents = async () => {
//   const supabase = await createClient();

//   let result = await supabase.from("events").select("*, inquiry:inquiries(*), user:users(*)").eq("status", "ACTIVE").order("start_datetime", { ascending: true });

//   if (result.error) {
//     await errorLogger("getActiveEvents()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   let events = result.data;


//   for (const event of events) {
//     result = await getEventCodes(event.id);

//     if (result.status === "OK") {
//       event.portal_events = result.data;
//     }
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: events,
//   };
// };

export const getActiveEvents = async () => {
  const supabase = await createClient();

  let result = await supabase.from("events").select("*, inquiry:inquiries(*), user:users(*)").eq("status", "ACTIVE").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getActiveEvents()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let events = result.data;
  const eventIds = events.map((e) => e.id);

  // 2. Get all portal-events in one go
  const portalResult = await supabase
    .from("portal-events")
    .select("*")
    .in("event_id", eventIds);

  if (portalResult.error) {
    await errorLogger("portal-events batch fetch", portalResult.error.message);
    return {
      status: "ERROR",
      message: portalResult.error.message,
      data: null,
    };
  }

  const allPortalEvents = portalResult.data;

  // 3. Attach portal_events to each event

  for (const event of events) {
    event.portal_events = allPortalEvents.filter((p) => p.event_id === event.id);
  }

  return {
    status: "OK",
    message: null,
    data: events,
  };
};

// export const getFinishedEvents = async () => {
//   const supabase = await createClient();

//   let result = await supabase.from("events").select("*, inquiry:inquiries(*), user:users(*)").eq("status", "FINISHED").order("start_datetime", { ascending: true });

//   if (result.error) {
//     await errorLogger("getFinishedEvents()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   let events = result.data;

//   for (const event of events) {
//     result = await getEventCodes(event.id);

//     if (result.status === "OK") {
//       event.portal_events = result.data;
//     }
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: events,
//   };
// };

export const getFinishedEvents = async () => {
  const supabase = await createClient();

  let result = await supabase.from("events").select("*, inquiry:inquiries(*), user:users(*)").eq("status", "FINISHED").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getFinishedEvents()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let events = result.data;
  const eventIds = events.map((e) => e.id);

  // 2. Get all portal-events in one go
  const portalResult = await supabase
    .from("portal-events")
    .select("*")
    .in("event_id", eventIds);

  if (portalResult.error) {
    await errorLogger("portal-events batch fetch", portalResult.error.message);
    return {
      status: "ERROR",
      message: portalResult.error.message,
      data: null,
    };
  }

  const allPortalEvents = portalResult.data;

  // 3. Attach portal_events to each event

  for (const event of events) {
    event.portal_events = allPortalEvents.filter((p) => p.event_id === event.id);
  }

  return {
    status: "OK",
    message: null,
    data: events,
  };
};

// export const getCancelledEvents = async () => {
//   const supabase = await createClient();

//   let result = await supabase.from("events").select("*, user:users(*)").eq("status", "CANCELLED").order("start_datetime", { ascending: true });

//   if (result.error) {
//     await errorLogger("getCancelledEvents()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   let events = result.data;

//   for (const event of events) {
//     result = await getEventCodes(event.id);

//     if (result.status === "OK") {
//       event.portal_events = result.data;
//     }
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: events,
//   };
// };

export const getCancelledEvents = async () => {
  const supabase = await createClient();

  let result = await supabase.from("events").select("*, user:users(*)").eq("status", "CANCELLED").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getCancelledEvents()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let events = result.data;
  const eventIds = events.map((e) => e.id);

  // 2. Get all portal-events in one go
  const portalResult = await supabase
    .from("portal-events")
    .select("*")
    .in("event_id", eventIds);

  if (portalResult.error) {
    await errorLogger("portal-events batch fetch", portalResult.error.message);
    return {
      status: "ERROR",
      message: portalResult.error.message,
      data: null,
    };
  }

  const allPortalEvents = portalResult.data;

  // 3. Attach portal_events to each event

  for (const event of events) {
    event.portal_events = allPortalEvents.filter((p) => p.event_id === event.id);
  }


  return {
    status: "OK",
    message: null,
    data: events,
  };
};

export const sendReport = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await getTemplate("REPORT-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  const template = result.data;

  const eventCodes = event.portal_events.map((software) => software.event_code);
  const reportLink = reportUrl + eventCodes[0] + "?ids=" + eventCodes;

  result = await getSalesManager(event.inquiry.user_id);
  const salesManager = result.data;

  const signature = signatures[salesManager.first_name.toLowerCase()];

  const startDate = event?.start_datetime ? format(new Date(event?.start_datetime), "dd MMM yyyy") : "";

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Report email #" + event.id,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: event.name,
        email: event.email,
        company: event.company,
        reportLink: reportLink,
        startDate: startDate,
        salesManagerFirstName: salesManager.first_name,
        salesManagerLastName: salesManager.last_name,
        salesManagerEmail: salesManager.email,
        signature: signature,
        ccList: ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "gerald@iboothme.ae", "alex@iboothme.ae", "rg@studio94.ae", "youssef@iboothme.ae"],
      },
    ],
    send_on: new Date(),
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("sendReport()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
//#endregion

//#region payments / invoices
// export const addPayment = async (proposals, event) => {
//   const supabase = await createClient();

//   const result = await supabase.from("payments").insert({
//     event_id: event.id,
//     inquiry_id: event.inquiry_id,
//     proposals: proposals,
//     accountant_name: null,
//     accountant_email: null,
//     status: "PENDING",
//     activity: [
//       {
//         message: "<p class='mb-0'" + ">Payment created by IMS</p>",
//         date_time: new Date(),
//       },
//     ],
//     created_at: new Date(),
//   });

//   if (result.error) {
//     await errorLogger("addPayment()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: null,
//   };
// };

export const addPayment = async (proposals, event) => {
  const supabase = await createClient();

  // Check payment already exists for inquiry_id
  const existingPayment = await supabase
    .from("payments")
    .select("*")
    .eq("inquiry_id", event.inquiry_id)
    .maybeSingle();

  if (existingPayment.error) {
    await errorLogger("addPayment() - check existing", existingPayment.error.message);
    return { status: "ERROR", message: existingPayment.error.message, data: null };
  }

  const paymentData = {
    event_id: event.id,
    inquiry_id: event.inquiry_id,
    proposals,
    accountant_name: null,
    accountant_email: null,
    status: "PENDING",
    activity: [
      {
        message: "<p class='mb-0'>Payment created by IMS</p>",
        date_time: new Date(),
      },
    ],
    created_at: new Date(),
  };

  let result;

  if (existingPayment.data) {
    result = await supabase
      .from("payments")
      .update(paymentData)
      .eq("id", existingPayment.data.id);
  } else {
    result = await supabase.from("payments").insert(paymentData);
  }

  if (result.error) {
    await errorLogger("addPayment()", result.error.message);
    return { status: "ERROR", message: result.error.message, data: null };
  }

  return { status: "OK", message: null, data: result.data };
};


export const getUnpaidPayments = async () => {
  const supabase = await createClient();

  const result = await supabase.from("payments").select("*, event:events(*), inquiry:inquiries(*, user:users(*))").eq("status", "UNPAID").order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getUnpaidPayments()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getClearedPayments = async () => {
  const supabase = await createClient();

  const result = await supabase.from("payments").select("*, event:events(*), inquiry:inquiries(*, user:users(*))").eq("status", "CLEARED").order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getClearedPayments()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getPendingInvoices = async () => {
  const supabase = await createClient();

  const result = await supabase.from("payments").select("*, event:events(*), inquiry:inquiries(*, user:users(*))").eq("status", "PENDING").order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getPendingPayments()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getInvoices = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("invoices").select("*").eq("payment_id", id).order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getInvoices()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const editAccountantDetails = async (payment) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("payments")
    .update({
      accountant_name: payment.accountantName,
      accountant_email: payment.accountantEmail,
      activity: [
        ...payment.activity,
        {
          message: "<p class='mb-0'" + ">Accountant details edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", payment.paymentId);

  if (result.error) {
    await errorLogger("editEventName()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const uploadInvoice = async (invoice, payment) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  const extension = getFileExtension(invoice.file);
  const fileName = invoice.number + "." + extension;

  result = await supabase.storage.from("ibm").upload("invoices/" + fileName, invoice.file, {
    upsert: true,
  });

  if (result.error) {
    await errorLogger("uploadInvoice()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const invoicePath = invoicesUrl + result.data.fullPath;

  result = await supabase.from("invoices").insert({
    number: invoice.number,
    url: invoicePath,
    payment_id: payment.id,
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("uploadInvoice()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("payments")
    .update({
      activity: [
        ...payment.activity,
        {
          message: "<p class='mb-0'" + ">Invoice " + "<a class='fw-semibold' href='" + invoicePath + "' target='_blank'>" + "#" + invoice.number + "</a>" + " uploaded by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", payment.id);

  if (result.error) {
    await errorLogger("uploadInvoice()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const sendInvoices = async (invoices, payment) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await getTemplate("INVOICE-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  let template = result.data;
  let invoiceNumbers = "";
  let invoiceLinks = [];
  let invoiceMessage = "";

  invoices.forEach((invoice, index) => {
    invoiceLinks.push(invoice.url);
    invoiceNumbers += invoice.number;

    const message = "<a class='fw-semibold' href='" + invoice.url + "' target='_blank'>#" + invoice.number + "</a>";
    invoiceMessage += message;

    if (index < invoices.length - 1) {
      invoiceNumbers += ", ";
      invoiceMessage += ", ";
    }
  });

  let ccList = ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "rg@studio94.ae", "youssef@iboothme.ae"];

  if (payment.accountant_email) {
    ccList.push(payment.inquiry.email);
  }

  const startDate = payment.inquiry?.start_datetime ? format(new Date(payment.inquiry?.start_datetime), "dd MMM yyyy") : "";

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Invoice(s) email #" + invoiceNumbers,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: payment.accountant_name ? payment.accountant_name : payment.inquiry.name,
        email: payment.accountant_email ? payment.accountant_email : payment.inquiry.email,
        company: payment.inquiry.company,
        invoiceLinks: invoiceLinks,
        startDate: startDate,
        ccList: ccList,
      },
    ],
    send_on: new Date(),
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("sendInvoices()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result = await supabase
    .from("payments")
    .update({
      status: "UNPAID",
      activity: [
        ...payment.activity,
        {
          message: "<p class='mb-0'" + ">Invoice(s) " + invoiceMessage + " sent by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", payment.id);

  if (result.error) {
    await errorLogger("sendInvoices()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const clearPayment = async (payment) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("payments")
    .update({
      status: "CLEARED",
      activity: [
        ...payment.activity,
        {
          message: "<p class='mb-0'" + ">Payment marked as cleared by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", payment.id);

  if (result.error) {
    await errorLogger("clearPayment()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
//#endregion

//#region development
// export const getSoftwaresDetails = async () => {
//   const supabase = await createClient();

//   let result = await supabase.from("events").select("*, user:users(*)").order("start_datetime", { ascending: true });

//   if (result.error) {
//     await errorLogger("getSoftwaresDetails()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   let events = result.data;

//   for (const event of events) {
// result = await getEventCodes(event.id);

//     if (result.status === "OK") {
//       event.portal_events = result.data;
//     }
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: events,
//   };
// };

export const getSoftwaresDetails = async () => {
  const supabase = await createClient();

  // 1. Get all events
  let result = await supabase
    .from("events")
    .select("*, user:users(*)")
    .order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getSoftwaresDetails()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let events = result.data;
  const eventIds = events.map((e) => e.id);

  // 2. Get all portal-events in one go
  const portalResult = await supabase
    .from("portal-events")
    .select("*")
    .in("event_id", eventIds);

  if (portalResult.error) {
    await errorLogger("portal-events batch fetch", portalResult.error.message);
    return {
      status: "ERROR",
      message: portalResult.error.message,
      data: null,
    };
  }

  const allPortalEvents = portalResult.data;

  // 3. Attach portal_events to each event

  for (const event of events) {
    event.portal_events = allPortalEvents.filter((p) => p.event_id === event.id);
  }

  return {
    status: "OK",
    message: null,
    data: events,
  };
};


// export const getArchivedSoftwares = async () => {
//   const supabase = await createClient();

//   let result = await supabase.from("events").select("*, user:users(*)").eq("software_status", "ARCHIVED").order("start_datetime", { ascending: true });

//   if (result.error) {
//     await errorLogger("getArchivedSoftwares()", result.error.message);

//     return {
//       status: "ERROR",
//       message: result.error.message,
//       data: null,
//     };
//   }

//   let events = result.data;

//   for (const event of events) {
//     result = await getEventCodes(event.id);

//     if (result.status === "OK") {
//       event.portal_events = result.data;
//     }
//   }

//   return {
//     status: "OK",
//     message: null,
//     data: events,
//   };
// };

export const getArchivedSoftwares = async () => {
  const supabase = await createClient();

  let result = await supabase.from("events").select("*, user:users(*)").eq("software_status", "ARCHIVED").order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getArchivedSoftwares()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let events = result.data;
  const eventIds = events.map((e) => e.id);

  // 2. Get all portal-events in one go
  const portalResult = await supabase
    .from("portal-events")
    .select("*")
    .in("event_id", eventIds);

  if (portalResult.error) {
    await errorLogger("portal-events batch fetch", portalResult.error.message);
    return {
      status: "ERROR",
      message: portalResult.error.message,
      data: null,
    };
  }

  const allPortalEvents = portalResult.data;

  // 3. Attach portal_events to each event

  for (const event of events) {
    event.portal_events = allPortalEvents.filter((p) => p.event_id === event.id);
  }

  return {
    status: "OK",
    message: null,
    data: events,
  };
};

export const updateSoftwareStatus = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("events")
    .update({
      software_status: event.softwareStatus,
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Software status updated by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.id);

  if (result.error) {
    await errorLogger("updateSoftwareStatus()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const getEventCodes = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("portal-events").select("*").eq("event_id", id).order("event_code", { ascending: true });

  if (result.error) {
    await errorLogger("getEventCodes()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getLastEventCode = async () => {
  const supabase = await createClient();

  const result = await supabase.from("portal-events").select("*").order("event_code", { ascending: true });

  if (result.error) {
    await errorLogger("getEventCodes()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const addPortalEvent = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase.from("portal-events").insert({
    event_code: Number(event.eventCode),
    event_id: event.id,
    solution: event.solution,
    link: event.path,
    user_id: user.id,
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("addPortalEvent()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editSoftwareDetails = async (event) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("events")
    .update({
      software_details: event.softwareDetails,
      activity: [
        ...event.activity,
        {
          message: "<p class='mb-0'" + ">Software details edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", event.eventId);

  if (result.error) {
    await errorLogger("editSoftwareDetails()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
//#endregion

//#region templates
export const getTemplates = async () => {
  const supabase = await createClient();

  const result = await supabase.from("templates").select("*, user:users(*)").eq("status", "ACTIVE").order("created_at", { ascending: false });

  if (result.error) {
    await errorLogger("getTemplates()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getTemplate = async (key) => {
  const supabase = await createClient();

  const result = await supabase.from("templates").select("*, user:users(*)").eq("key", key.toLowerCase());

  if (result.error) {
    await errorLogger("getTemplate()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get template",
    data: null,
  };
};

export const addTemplate = async (template) => {
  const supabase = await createClient();

  let result = await supabase.from("templates").select("*").eq("key", template.key.toLowerCase());

  if (result.error) {
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "EXISTS",
      message: null,
      data: null,
    };
  }

  result = await getUser();
  const user = result.data;

  result = await supabase.from("templates").insert({
    key: template.key.toLowerCase(),
    type: "USER",
    name: template.name,
    sender_name: template.senderName,
    from_email: template.fromEmail.toLowerCase(),
    subject: template.subject,
    content: template.content,
    user_id: user.id,
    status: "ACTIVE",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("addTemplate()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editTemplate = async (template) => {
  const supabase = await createClient();

  const result = await supabase
    .from("templates")
    .update({
      name: template.name,
      sender_name: template.senderName,
      from_email: template.fromEmail.toLowerCase(),
      subject: template.subject,
      content: template.content,
    })
    .eq("key", template.key.toLowerCase());

  if (result.error) {
    await errorLogger("editTemplate()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const deleteTemplate = async (template) => {
  const supabase = await createClient();

  const result = await supabase
    .from("templates")
    .update({
      status: "INACTIVE",
    })
    .eq("key", template.key);

  if (result.error) {
    await errorLogger("deleteTemplate()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
//#endregion

//#region campaigns
export const getCampaigns = async () => {
  const supabase = await createClient();

  const result = await supabase.from("campaigns").select("*, template:templates(*), user:users(*)").eq("type", "USER").order("created_at", { ascending: false }).limit(50);

  if (result.error) {
    await errorLogger("getCampaigns()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getCampaign = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("campaigns").select("*, template:templates(*), user:users(*)").eq("id", id);

  if (result.error) {
    await errorLogger("getCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get campaign",
    data: null,
  };
};

export const addUserCampaign = async (campaign) => {
  const supabase = await createClient();

  let result = await supabase.from("campaigns").select("*").eq("name", campaign.name.toLowerCase());

  if (result.error) {
    await errorLogger("addUserCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "EXISTS",
      message: null,
      data: null,
    };
  }

  result = await getUser();
  const user = result.data;

  result = await supabase.from("campaigns").insert({
    type: "USER",
    name: campaign.name.toLowerCase(),
    template_id: campaign.templateId,
    list: campaign.list,
    send_to: null,
    send_on: campaign.sendOn,
    user_id: user.id,
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("addUserCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const updateUserCampaign = async (campaign) => {
  const supabase = await createClient();

  let result = await supabase
    .from("campaigns")
    .update({
      status: "SENDING",
    })
    .eq("id", campaign.id);

  if (result.error) {
    await errorLogger("updateUserCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const updateCampaign = async (campaign) => {
  const supabase = await createClient();

  let result = await supabase
    .from("campaigns")
    .update({
      status: "COMPLETED",
    })
    .eq("id", campaign.id);

  if (result.error) {
    await errorLogger("updateCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (campaign.name.toLowerCase().includes("birthday email")) {
    const lastSpaceIndex = campaign.name.lastIndexOf(" ");
    const clientEmail = campaign.name.substring(lastSpaceIndex + 1);

    if (clientEmail) {
      result = await supabase
        .from("clients")
        .update({
          last_wished_datetime: new Date(),
        })
        .eq("email", clientEmail);
    }
  }

  if (campaign.name.toLowerCase().includes("follow up")) {
    const lastSpaceIndex = campaign.name.lastIndexOf(" ");
    const inquiryId = campaign.name.substring(lastSpaceIndex + 1);

    if (inquiryId) {
      result = await supabase.from("inquiries").select("*").eq("id", inquiryId);

      if (result.error) {
        await errorLogger("updateCampaign()", result.error.message);

        return {
          status: "ERROR",
          message: result.error.message,
          data: null,
        };
      }

      const inquiry = result.data[0];
      let followUpDates = inquiry.follow_ups.data;
      let currentFollowUp = followUpDates.find((followUp) => followUp.template.toLowerCase() === campaign.template.key);

      if (currentFollowUp) {
        currentFollowUp.status = "SENT";

        result = await supabase
          .from("inquiries")
          .update({
            follow_ups: {
              data: followUpDates,
              status: inquiry.follow_ups.status,
            },
            activity: [
              ...inquiry.activity,
              {
                message: "<p class='mb-0'>" + currentFollowUp.type + " email sent</p>",
                date_time: new Date(),
              },
            ],
          })
          .eq("id", inquiryId);

        if (result.error) {
          await errorLogger("updateCampaign()", result.error.message);

          return {
            status: "ERROR",
            message: result.error.message,
            data: null,
          };
        }
      }
    }
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const archiveCampaign = async (campaign) => {
  const supabase = await createClient();

  const result = await supabase
    .from("campaigns")
    .update({
      status: "ARCHIVED",
    })
    .eq("id", campaign.id);

  if (result.error) {
    await errorLogger("archiveCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const getCampaignReports = async () => {
  const supabase = await createClient();

  let result = await supabase.from("campaigns").select("*, user:users(*)").eq("type", "USER").order("send_on", { ascending: false }).limit(20);

  if (result.error) {
    await errorLogger("getCampaignReports()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let campaigns = result.data;
  result = await supabase
    .from("campaign-reports")
    .select("*")
    .in("campaign_id", campaigns.map(c => c.id));

  // result = await supabase.from("campaign-reports").select("*");

  if (result.error) {
    await errorLogger("getCampaignReports()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let campaignReports = result.data;

  let campaignData = campaigns.map((campaign) => {
    let sentEmails = [];
    let openEmails = [];
    let clickEmails = [];
    let bouncedEmails = [];

    const relatedReports = campaignReports.filter((report) => report.campaign_id === campaign.id);

    const allRecipients = [...new Set(relatedReports.map((r) => r.email))];

    relatedReports.forEach((report) => {
      if (report.event === "send" && !sentEmails.includes(report.email)) {
        sentEmails.push(report.email);
      }
      if (report.event === "open" && !openEmails.includes(report.email)) {
        openEmails.push(report.email);
      }
      if (report.event === "click") {
        const existingClick = clickEmails.find((clickEvent) => clickEvent.email === report.email && clickEvent.clickUrl === report.click_url);

        if (!existingClick) {
          clickEmails.push({ email: report.email, clickUrl: report.click_url });
        }
      }
      if (report.event === "hard_bounce" || report.event === "soft_bounce" && !bouncedEmails.includes(report.email)) {
        bouncedEmails.push(report.email);

      }
    });

    return {
      ...campaign,
      sent: allRecipients.length,
      opens: openEmails.length,
      clicks: clickEmails.length,
      hard_Bounces: bouncedEmails.length,
    };
  });

  return {
    status: "OK",
    message: null,
    data: campaignData,
  };
};

export const getCampaignReport = async (id) => {
  const supabase = await createClient();

  let result = await supabase.from("campaigns").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("getCampaignReport()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    const campaign = result.data[0];
    result = await supabase.from("campaign-reports").select("*").eq("campaign_id", campaign.id);

    if (result.error) {
      await errorLogger("getCampaignReport()", result.error.message);

      return {
        status: "ERROR",
        message: result.error.message,
        data: null,
      };
    }

    const campaignEvents = result.data;
    const eventOrder = ["send", "delivered", "open", "click", "reject", "soft_bounce", "hard_bounce"];

    let emailEvents = {};
    // let sent = 0;
    let delivered = 0;
    let opens = 0;
    let clicks = 0;
    let rejected = 0;
    let bounced = 0;
    let deliveredEmails = [];
    let opensEmails = [];
    let clicksEmails = [];
    let rejectedEmails = [];
    let bouncedEmails = [];

    campaignEvents.forEach((campaignEvent) => {
      const { event, email, click_url: clickUrl } = campaignEvent;

      if (!emailEvents[email]) {
        emailEvents[email] = { events: [], tags: [] };
      }

      if (!emailEvents[email].tags.includes(event)) {
        emailEvents[email].tags.push(event);
      }

      const existingEvent = emailEvents[email].events.find((emailEvent) => emailEvent.event === event && (event !== "click" || emailEvent.clickUrl === clickUrl));

      if (!existingEvent) {
        // if (event === "send" && emailEvents[email].events.length === 0) {
        //   sent++;
        // }
        if (event === "delivered" || event === "open") {
          delivered++
          deliveredEmails.push(email);
        }
        if (event === "open") {
          opens++
          opensEmails.push(email);
        }
        if (event === "click") {
          clicks++
          clicksEmails.push(email);
        }
        if (event === "reject") {
          rejected++;
          rejectedEmails.push(email);
        }
        if (event === "hard_bounce" || event === "soft_bounce") {
          bounced++;
          bouncedEmails.push(email);
        }

        emailEvents[email].events.push({ event, clickUrl });
      }
    });

    Object.values(emailEvents).forEach((emailEvent) => {
      emailEvent.tags.sort((a, b) => eventOrder.indexOf(a) - eventOrder.indexOf(b));
    });

    let sent = Object.keys(emailEvents).length;

    const campaignReport = { ...campaign, sent, delivered, opens, clicks, rejected, bounced, events: emailEvents, deliveredEmails, opensEmails, clicksEmails, rejectedEmails, bouncedEmails, };

    return {
      status: "OK",
      message: null,
      data: campaignReport,
    };
  }

  return {
    status: "ERROR",
    message: "Campaign does not exist.",
    data: null,
  };
};

//#endregion

//#region clients
export const getClient = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("clients").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("getClient()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get client",
    data: null,
  };
};

export const getClients = async () => {
  const supabase = await createClient();

  const result = await supabase.from("clients").select("*, user:users(*)").neq("list", "DELETED").order("name", { ascending: false });

  if (result.error) {
    await errorLogger("getClients()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const addClients = async (clients) => {
  try {
    const supabase = await createClient();

    let result = await getUser();
    const user = result.data;
    const currentDate = new Date();

    const clientsToAdd = clients.map((client) => ({
      ...client,
      user_id: user.id,
      created_at: currentDate,
    }));


    result = await supabase.from("clients").upsert(clientsToAdd, { onConflict: ["email"] });

    if (result.error) {
      await errorLogger("addClients()", result.error.message);

      return {
        status: "ERROR",
        message: result.error.message,
        data: null,
      };
    }

    return {
      status: "OK",
      message: null,
      data: null,
    };
  } catch (error) {
    await errorLogger("addClients()", error);

    return {
      status: "ERROR",
      message: null,
      data: null,
    };
  }
};

export const addClient = async (client, type) => {
  const supabase = await createClient();

  let result = await supabase.from("clients").select("*").eq("email", client.email.toLowerCase());

  if (result.error) {
    await errorLogger("addClient()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    const existingClient = result.data[0];

    if (type === "inquiry") {
      await supabase
        .from("clients")
        .update({
          total_inquiries: existingClient.total_inquiries + 1,
        })
        .eq("id", existingClient.id);
    }

    return {
      status: "EXISTS",
      message: null,
      data: null,
    };
  }

  result = await getUser();
  const user = result.data;

  result = await supabase.from("clients").insert({
    name: client.name ? client.name : null,
    company: client.company ? client.company : null,
    country: client.country ? client.country : null,
    email: client.email.toLowerCase(),
    contact: client.contact ? client.contact : null,
    source: client.source ? client.source : null,
    fish: client.fish ? client.fish : null,
    website: client.website ? client.website.toLowerCase() : null,
    date_of_birth: client.dateOfBirth ? client.dateOfBirth : null,
    total_inquiries: type === "inquiry" ? 1 : null,
    list: client.list,
    subscribed: client.subscribed,
    user_id: user.id,
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("addClient()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editClient = async (client) => {
  const supabase = await createClient();

  const result = await supabase
    .from("clients")
    .update({
      name: client.name ? client.name : null,
      company: client.company ? client.company : null,
      country: client.country ? client.country : null,
      email: client.email.toLowerCase(),
      contact: client.contact ? client.contact : null,
      source: client.source ? client.source : null,
      fish: client.fish ? client.fish : null,
      website: client.website ? client.website : null,
      date_of_birth: client.dateOfBirth ? client.dateOfBirth : null,
      list: client.list,
      subscribed: client.subscribed,
    })
    .eq("id", client.id);

  if (result.error) {
    await errorLogger("editClient()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const deleteClient = async (client) => {
  const supabase = await createClient();

  const result = await supabase
    .from("clients")
    .update({
      list: "DELETED",
    })
    .eq("id", client.id);

  if (result.error) {
    await errorLogger("deleteClient()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};
export const unsubscribeClient = async (id) => {
  const supabase = await createClient();

  const result = await supabase
    .from("clients")
    .update({
      subscribed: false,
    })
    .eq("id", id);

  if (result.error) {
    await errorLogger("unsubscribeClient()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const getCompanies = async () => {
  const supabase = await createClient();

  const result = await supabase.from("clients").select("company");

  if (result.error) {
    await errorLogger("getCompanies()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let companies = [];

  result.data.forEach((client) => {
    if (client.company) {
      let company = client.company.toLowerCase();
      let existingCompany = companies.find((data) => data === company);

      if (!existingCompany) {
        companies.push(company);
      }
    }
  });

  return {
    status: "OK",
    message: null,
    data: companies,
  };
};

export const getLists = async () => {
  const supabase = await createClient();

  const result = await supabase.from("clients").select("list");
  if (result.error) {
    await errorLogger("getLists()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  let lists = [];

  result.data.forEach((client) => {
    if (client.list === "DELETED") {
      return;
    }
    let existingList = lists.find((data) => data.name === client.list);

    if (existingList) {
      existingList.size++;
    } else {
      lists.push({ name: client.list, size: 1 });
    }
  });

  return {
    status: "OK",
    message: null,
    data: lists,
  };
};

export const getClientsByList = async (lists) => {
  const supabase = await createClient();

  const result = await supabase.from("clients").select("*").in("list", lists);

  if (result.error) {
    await errorLogger("getClientsByList()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};
//#endregion

//#region helpers
export const getCounts = async () => {
  const supabase = await createClient();

  let inquiryCounts = {};
  let eventCounts = {};
  let softwareCounts = {};
  let paymentCounts = {};

  let result = await supabase.from("inquiries").select("*");

  if (result.error) {
    await errorLogger("getCounts()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result.data.forEach((data) => {
    const status = data.status.toLowerCase();

    if (inquiryCounts[status]) {
      inquiryCounts[status]++;
    } else {
      inquiryCounts[status] = 1;
    }
  });

  result = await supabase.from("events").select("*");

  if (result.error) {
    await errorLogger("getCounts()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result.data.forEach((data) => {
    const status = data.status.toLowerCase();

    if (eventCounts[status]) {
      eventCounts[status]++;
    } else {
      eventCounts[status] = 1;
    }
  });

  result.data.forEach((data) => {
    const softwareStatus = data.software_status.toLowerCase();

    if (softwareCounts[softwareStatus]) {
      softwareCounts[softwareStatus]++;
    } else {
      softwareCounts[softwareStatus] = 1;
    }
  });

  result = await supabase.from("payments").select("*");

  if (result.error) {
    await errorLogger("getCounts()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  result.data.forEach((data) => {
    const status = data.status.toLowerCase();

    if (paymentCounts[status]) {
      paymentCounts[status]++;
    } else {
      paymentCounts[status] = 1;
    }
  });

  const counts = {
    inquiryCounts: inquiryCounts,
    eventCounts: eventCounts,
    softwareCounts: softwareCounts,
    paymentCounts: paymentCounts,
  };

  return {
    status: "OK",
    message: null,
    data: counts,
  };
};

export const scheduleFollowupEmails = async (id) => {
  const supabase = await createClient();

  let result = await supabase.from("inquiries").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("scheduleFollowupEmails()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const inquiry = result.data[0];
  const followUps = inquiry.follow_ups;

  if (followUps.status === "SCHEDULED") {
    return {
      status: "OK",
      message: "Follow up emails already added",
      data: null,
    };
  }

  if (followUps.status === "SKIPPED") {
    return {
      status: "OK",
      message: "Follow up emails skipped",
      data: null,
    };
  }

  if (followUps.status === "CANCELLED") {
    return {
      status: "OK",
      message: "Follow up emails cancelled",
      data: null,
    };
  }

  const currentDate = new Date();
  const eventStartDate = new Date(inquiry.start_datetime);
  const daysUntilEvent = differenceInDays(eventStartDate, currentDate);

  let followUpDates = [];

  if (daysUntilEvent <= 2) {
    followUpDates = [];
  } else if (daysUntilEvent <= 3) {
    const followUp3Date = addDays(currentDate, 1);
    if (isBefore(followUp3Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 3", date: followUp3Date, template: "FOLLOWUP-3-EMAIL", status: "PENDING" });
    }
  } else if (daysUntilEvent <= 7) {
    const followUp3Date = addDays(currentDate, 2);
    if (isBefore(followUp3Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 3", date: followUp3Date, template: "FOLLOWUP-3-EMAIL", status: "PENDING" });
    }
  } else if (daysUntilEvent <= 14) {
    const followUp2Date = addDays(currentDate, 2);
    if (isBefore(followUp2Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 2", date: followUp2Date, template: "FOLLOWUP-2-EMAIL", status: "PENDING" });
    }

    const followUp3Date = addDays(eventStartDate, -5);
    if (isBefore(followUp3Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 3", date: followUp3Date, template: "FOLLOWUP-3-EMAIL", status: "PENDING" });
    }
  } else {
    const followUp1Date = addDays(currentDate, 2);
    if (isBefore(followUp1Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 1", date: followUp1Date, template: "FOLLOWUP-1-EMAIL", status: "PENDING" });
    }

    const halfway = Math.floor(daysUntilEvent / 2);
    const followUp2Date = addDays(currentDate, halfway);
    if (isBefore(followUp2Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 2", date: followUp2Date, template: "FOLLOWUP-2-EMAIL", status: "PENDING" });
    }

    const followUp3Date = addDays(eventStartDate, -5);
    if (isBefore(currentDate, followUp3Date) && isBefore(followUp3Date, eventStartDate)) {
      followUpDates.push({ type: "Follow up 3", date: followUp3Date, template: "FOLLOWUP-3-EMAIL", status: "PENDING" });
    }
  }

  result = await getSalesManager(inquiry.user_id);
  const salesManager = result.data;

  let followupActivity = [];

  for (const followUp of followUpDates) {
    let result = await getTemplate(followUp.template);
    const template = result.data;

    const signature = signatures[salesManager.first_name.toLowerCase()];

    let ccList = ["saqib@iboothme.ae", "ben@iboothme.app", "shubhneet@iboothme.com", "modar@iboothme.com", "youssef@iboothme.ae"];

    if (salesManager.email === "shubhneet@iboothme.com") {
      ccList = ccList.filter((email) => email !== "saqib@iboothme.ae" && email !== "ben@iboothme.app");
    } else if (salesManager.email === "saqib@iboothme.ae") {
      ccList = ccList.filter((email) => email !== "ben@iboothme.app" && email !== "shubhneet@iboothme.com");
    } else if (salesManager.email === "ben@iboothme.app") {
      ccList = ccList.filter((email) => email !== "saqib@iboothme.ae" && email !== "shubhneet@iboothme.com");
    } else if (salesManager.email === "youssef@iboothme.ae") {
      ccList = ccList.filter((email) => email !== "saqib@iboothme.ae" && email !== "ben@iboothme.app");
    }

    const startDate = inquiry?.start_datetime ? format(new Date(inquiry?.start_datetime), "dd MMM yyyy") : "";

    result = await supabase.from("campaigns").insert({
      type: "AUTO",
      name: "IMS - " + followUp.type + " " + inquiry.id,
      template_id: template.id,
      list: null,
      send_to: [
        {
          name: inquiry.name,
          email: inquiry.email,
          company: inquiry.company,
          startDate: startDate,
          salesManagerFirstName: salesManager.first_name,
          salesManagerLastName: salesManager.last_name,
          salesManagerEmail: salesManager.email,
          signature: signature,
          ccList: ccList,
        },
      ],
      send_on: followUp.date,
      user_id: inquiry.user_id,
      status: "PENDING",
      created_at: new Date(),
    });

    followupActivity.push({
      message: "<p class='mb-0'>" + followUp.type + " email scheduled for " + format(new Date(followUp.date), "dd MMM yyyy h:mm a") + "</p>",
      date_time: new Date(),
    });
  }

  if (followUpDates.length === 0) {
    followupActivity.push({
      message: "<p class='mb-0'>Follow up emails skipped</p>",
      date_time: new Date(),
    });
  }

  result = await supabase
    .from("inquiries")
    .update({
      follow_ups: {
        data: followUpDates,
        status: followUpDates.length === 0 ? "SKIPPED" : "SCHEDULED",
      },
      activity: [...inquiry.activity, ...followupActivity],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("scheduleFollowupEmails()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: "Follow up emails added",
    data: null,
  };
};

export const cancelFollowups = async (id) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase.from("inquiries").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("cancelFollowups()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const inquiry = result.data[0];

  result = await supabase.from("campaigns").select("*, template:templates(*)").eq("status", "PENDING").eq("type", "AUTO");

  if (result.error) {
    await errorLogger("cancelFollowups()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const campaigns = result.data;

  for (const campaign of campaigns) {
    if (campaign.name.toLowerCase().includes("follow up")) {
      const lastSpaceIndex = campaign.name.lastIndexOf(" ");
      const inquiryId = campaign.name.substring(lastSpaceIndex + 1);

      if (inquiryId === inquiry.id) {
        result = await supabase
          .from("campaigns")
          .update({
            status: "CANCELLED",
          })
          .eq("id", campaign.id);

        if (result.error) {
          await errorLogger("cancelFollowups()", result.error.message);

          return {
            status: "ERROR",
            message: result.error.message,
            data: null,
          };
        }
      }
    }
  }

  let followUpDates = inquiry.follow_ups.data;

  followUpDates.forEach((followUp) => {
    if (followUp.status === "PENDING") {
      followUp.status = "CANCELLED";
    }
  });

  let message = "<p class='mb-0'>Follow up emails cancelled by " + user.first_name + "</p>";

  if (inquiry.status === "CONFIRMED" || inquiry.status === "LOST") {
    message = "<p class='mb-0'>Follow up emails cancelled by IMS</p>";
  }

  result = await supabase
    .from("inquiries")
    .update({
      follow_ups: {
        data: followUpDates,
        status: "CANCELLED",
      },
      activity: [
        ...inquiry.activity,
        {
          message: message,
          date_time: new Date(),
        },
      ],
    })
    .eq("id", inquiry.id);

  if (result.error) {
    await errorLogger("cancelFollowups()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const sendEmail = async (data) => {
  try {
    const result = await mandrill.messages.send({
      message: {
        subject: data.subject,
        html: data.html,
        from_email: data.from_email,
        from_name: data.from_name,
        to: data.to,
        track_opens: true,
        track_clicks: true,
        metadata: { campaignId: data.campaignId },
      },
    });

    return result;
  } catch (error) {
    await errorLogger("sendEmail()", error.message);
  }
};

export const handleMandrillWebhook = async (payload) => {

  const supabase = await createClient();

  for (const data of payload) {
    const message = data.msg;
    const campaignId = message.metadata ? message.metadata.campaignId : null;
    const mandrillId = data._id;

    if (campaignId) {
      const event = data.event;
      const email = message.email;
      let clickUrl = null;

      if (event === "click") {
        clickUrl = data.url;
      }
      if (event === "hard_bounce" || event === "soft_bounce") {
        try {
          const { data: clients } = await supabase.from("clients").select("id").eq("email", email).limit(1);
          const client = clients?.[0];
          if (client) {
            await supabase.from("clients").update({ list: "DELETED" }).eq("id", client.id);
          }
        } catch (error) {

        }
      }
      return supabase.from("campaign-reports").insert({
        campaign_id: campaignId,
        email: email,
        event: event,
        click_url: clickUrl,
        mandrill_id: mandrillId,
        created_at: new Date(),
      });
    }
  }
};

export const getCronCampaigns = async () => {

  const now = new Date();

  // Convert to your desired timezone if needed
  const currentHour = now.getHours(); // 0-23

  if (currentHour < 5 || currentHour >= 15) {
    return {
      status: "OK",
      message: "Dubai allowed time window (9 AM - 7 PM) - current time is " + currentHour + ":00",
      data: [],
    };
  }
  const supabase = await createClient();

  const result = await supabase
    .from("campaigns")
    .select("*, template:templates(*), user:users(*)")
    .eq("status", "PENDING")
    .lte("send_on", now.toISOString())
    .order("created_at", { ascending: true });

  if (result.error) {
    await errorLogger("getCronCampaigns()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getBirthdayClients = async () => {
  const supabase = await createClient();

  const result = await supabase.from("clients").select("*").neq("list", "DELETED").order("name", { ascending: false });

  if (result.error) {
    await errorLogger("getClients()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const clients = result.data;

  const todayUTC = new Date();
  const currentMonthUTC = todayUTC.getUTCMonth() + 1;
  const currentDayUTC = todayUTC.getUTCDate();


  const birthdayClients = clients.filter((client) => {
    if (client.date_of_birth) {
      const dateOfBirth = new Date(client.date_of_birth);

      const birthMonthUTC = dateOfBirth.getUTCMonth() + 1;
      const birthDayUTC = dateOfBirth.getUTCDate();

      console.log("currentMonthUTC: " + currentMonthUTC);
      console.log("currentDayUTC: " + currentDayUTC);
      console.log("***");
      console.log(dateOfBirth.toUTCString());
      console.log("birthMonthUTC: " + birthMonthUTC);
      console.log("birthDayUTC: " + birthDayUTC);

      return birthMonthUTC === currentMonthUTC && birthDayUTC === currentDayUTC;
    }
  });

  return {
    status: "OK",
    message: null,
    data: birthdayClients,
  };
};

export const addBirthdayCampaign = async (client) => {
  const supabase = await createClient();

  let result = await getTemplate("BIRTHDAY-EMAIL");

  if (result.status === "ERROR") {
    return {
      status: "ERROR",
      message: result.message,
      data: null,
    };
  }

  const template = result.data;

  result = await supabase.from("campaigns").insert({
    type: "AUTO",
    name: "IMS - Birthday email " + client.email,
    template_id: template.id,
    list: null,
    send_to: [
      {
        name: client.name,
        email: client.email,
        ccList: ["ben@iboothme.app", "shubhneet@iboothme.com","youssef@iboothme.ae"],
      },
    ],
    send_on: new Date(),
    user_id: "74330a24-7628-4e0b-83b1-4da3ae7af35d",
    status: "PENDING",
    created_at: new Date(),
  });

  if (result.error) {
    await errorLogger("addBirthdayCampaign()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const updateResult = await supabase
    .from("clients")
    .update({ last_wished_datetime: new Date().toISOString() })
    .eq("id", client.id);

  if (updateResult.error) {
    await errorLogger("Updating last_wished_datetime", updateResult.error.message);
    return {
      status: "ERROR",
      message: updateResult.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const errorLogger = async (caller, error) => {
  const supabase = await createClient();

  const result = await getUser();
  const user = result.data;

  await supabase.from("error-log").insert({
    caller: caller,
    message: error,
    user_id: user.id,
    created_at: new Date(),
  });
};

export const getConfirmedInquiriesWithProposal = async (userId) => {
  const supabase = await createClient();

  let query = supabase
    .from("inquiries")
    .select(`
      user_id,
      created_at,
      start_datetime,
      company,
      email,
      proposals (
        subtotal_amount,
        vat_amount,
        total_amount,
        confirmed
      ),
      events (
        status
      )
    `)
    .eq("status", "CONFIRMED")
    .order("start_datetime", { ascending: true });


  if (userId) {
    query = query.eq("user_id", userId);
  }

  const result = await query;


  if (result.error) {
    await errorLogger("getConfirmedInquiriesWithProposal()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const filteredData = result.data
    .filter(inquiry =>
      Array.isArray(inquiry.proposals) &&
      inquiry.proposals.some(p => p.confirmed === true) &&
      Array.isArray(inquiry.events) &&
      inquiry.events.some(e => e.status === "FINISHED")
    )
    .map(inquiry => ({
      ...inquiry,
      proposals: inquiry.proposals.filter(p => p.confirmed === true),
    }));

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const yearStart = new Date("2024-07-01");

  let currentMonthSales = 0;
  let currentYearSales = 0;

  filteredData.forEach(inquiry => {
    const inquiryDate = new Date(inquiry.start_datetime);

    inquiry.proposals.forEach(proposal => {
      const amount = proposal.total_amount || 0;

      if (
        inquiryDate.getMonth() === currentMonth &&
        inquiryDate.getFullYear() === currentYear
      ) {
        currentMonthSales += amount;
      }

      if (inquiryDate >= yearStart && inquiryDate <= now) {
        currentYearSales += amount;
      }
    });
  });

  return {
    status: "OK",
    message: null,
    data: filteredData,
    currentMonthSales,
    currentYearSales,
  };
};

export const getInactiveClients = async () => {
  const supabase = await createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await supabase
    .from("clients")
    .select("id, name, email, last_event_datetime")
    .lt("last_event_datetime", sixMonthsAgo.toISOString());

  if (result.error) {
    await errorLogger("getInactiveClients()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const getLeadsWithoutSaleCount = async () => {
  const supabase = await createClient();

  const result = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .is("sale", null)
    .neq("status", "DELETED");

  if (result.error) {
    await errorLogger("getLeadsWithoutSaleCount()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      count: 0,
    };
  }

  return {
    status: "OK",
    message: null,
    count: result.count,
  };
};
export const getMonthlySalesData = async () => {
  const supabase = await createClient();

  const startDate = new Date("2024-07-01");
  const endDate = new Date();

  const result = await supabase
    .from("events")
    .select("created_at, inquiry:inquiries(id), status")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .eq("status", "ACTIVE")


  if (result.error) {
    console.error(result.error);
    return { status: "ERROR", message: result.error.message };
  }

  const events = result.data;


  // 2. Month-wise sales init
  const salesByMonth = {};
  const current = new Date(startDate);
  while (current <= endDate) {
    const key = current.toLocaleString("default", { month: "long", year: "numeric" });
    salesByMonth[key] = 0;
    current.setMonth(current.getMonth() + 1);
  }

  // 3. Proposals fetch
  const inquiryIds = events.map((e) => e.inquiry.id);
  const proposalResult = await supabase
    .from("proposals")
    .select("*")
    .in("inquiry_id", inquiryIds)
    .eq("confirmed", true);

  if (proposalResult.error) {
    return { status: "ERROR", message: proposalResult.error.message };
  }

  const allProposals = proposalResult.data;

  for (const event of events) {
    const eventDate = new Date(event.created_at);
    const monthKey = eventDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    const matchingProposals = allProposals.filter(
      (p) => p.inquiry_id === event.inquiry.id
    );

    const totalAmount = matchingProposals.reduce(
      (sum, p) => sum + p.total_amount,
      0
    );
    if (!salesByMonth[monthKey]) {
      salesByMonth[monthKey] = 0;
    }

    salesByMonth[monthKey] += totalAmount;
  }

  const targetResult = await supabase
    .from("targets")
    .select("month, year, target_amount");

  if (targetResult.error) {
    return { status: "ERROR", message: targetResult.error.message };
  }

  const targets = targetResult.data;

  // 5. Month-wise target
  const targetByMonth = {};
  for (const target of targets) {
    const monthKey = `${target.month} ${target.year}`;
    targetByMonth[monthKey] = target.target_amount;
  }

  // 6. Format months & results
  const sortedMonths = Object.keys(salesByMonth).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const totalSales = Object.values(salesByMonth).reduce((sum, val) => sum + val, 0);


  const currentMonthKey = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const currentMonthSales = salesByMonth[currentMonthKey] || 0;

  return {
    status: "OK",
    data: {
      labels: sortedMonths,
      datasets: [
        {
          label: "Sales",
          data: sortedMonths.map((month) => salesByMonth[month]),
          backgroundColor: "rgba(100, 199, 202, 0.75)",
        },
        {
          label: "Target",
          data: sortedMonths.map((month) => targetByMonth[month] || 0),
          backgroundColor: "#c62828",
        },
      ],
      total: totalSales,
      currentMonth: currentMonthSales,
    },
  };
};

export const getSalesDataByDateRange = async (startDateStr, endDateStr, source = "") => {
  const supabase = await createClient();

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // 1. Build base query
  let query = supabase
    .from("events")
    .select("created_at,name,email, scope_of_work, inquiry:inquiries(id), status")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: true });

  const result = await query;



  if (result.error) {
    return { status: "ERROR", message: result.error.message };
  }

  let events = result.data;

  if (source && source !== "") {
    events = events.filter((e) =>
      e.scope_of_work?.some((item) =>
        item.solution?.some((sol) =>
          sol.toLowerCase().includes(source.toLowerCase())
        )
      )
    );
  }

  // 2. Prepare day-wise sales
  const salesByDay = {};
  const current = new Date(startDate);
  while (current <= endDate) {
    const key = current.toISOString().split("T")[0];
    salesByDay[key] = 0;
    current.setDate(current.getDate() + 1);
  }

  // 3. Get inquiry IDs & proposals
  const inquiryIds = events.map((e) => e.inquiry.id);
  const proposalResult = await supabase
    .from("proposals")
    .select("*")
    .in("inquiry_id", inquiryIds)
    .eq("confirmed", true);

  if (proposalResult.error) {
    return { status: "ERROR", message: proposalResult.error.message };
  }

  const proposals = proposalResult.data;

  // 4. Assign sales to days
  for (const event of events) {
    const eventDate = new Date(event.created_at);
    const dayKey = eventDate.toISOString().split("T")[0];

    const relatedProposals = proposals.filter(p => p.inquiry_id === event.inquiry.id);
    const totalAmount = relatedProposals.reduce((sum, p) => sum + p.total_amount, 0);
    if (salesByDay[dayKey] !== undefined) {
      salesByDay[dayKey] += totalAmount;
    }
  }
  const sortedDays = Object.keys(salesByDay).sort();

  const totalSales = Object.values(salesByDay).reduce((sum, val) => sum + val, 0);
  return {
    status: "OK",
    data: {
      labels: sortedDays,
      datasets: [
        {
          label: "Sales",
          data: sortedDays.map((d) => salesByDay[d]),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
      total: totalSales,
    },
  };
};

export const getTop5UpcomingEvents = async () => {
  const supabase = await createClient();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  let result = await supabase
    .from("events")
    .select("*, inquiry:inquiries(*), user:users(*)")
    .eq("status", "ACTIVE")
    .gte("start_datetime", tomorrow.toISOString())
    .order("start_datetime", { ascending: true })
    .limit(5);

  if (result.error) {
    await errorLogger("getTop5UpcomingEvents()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: [],
    };
  }

  const events = result.data;
  const eventIds = events.map((e) => e.id);

  // Fetch all portal-events in one go

  const portalResult = await supabase
    .from("portal-events")
    .select("*")
    .in("event_id", eventIds)
    .order("event_code", { ascending: true });

  if (portalResult.error) {
    await errorLogger("portal-events batch fetch", portalResult.error.message);
    return {
      status: "ERROR",
      message: portalResult.error.message,
      data: [],
    };
  }
  const allPortalEvents = portalResult.data;

  // Attach portal_events to each event
  for (const event of events) {
    event.portal_events = allPortalEvents.filter((p) => p.event_id === event.id);
  }

  return {
    status: "OK",
    data: events,
  };
};

export const getMonthlyTargets = async () => {
  const supabase = await createClient();

  const result = await supabase
    .from("targets")
    .select("*")
    .order("month", { ascending: false });

  if (result.error) {
    await errorLogger("getTargets()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  // Get current month and year 
  const now = new Date();
  const currentMonthName = months[now.getMonth()];
  const currentYear = now.getFullYear();

  // Filter data based on current month (as string) and year
  const filteredData = result.data.filter(item => {
    return item.month === currentMonthName && Number(item.year) === currentYear;
  });

  return {
    status: "OK",
    message: null,
    data: filteredData,
  };
};

export const getTarget = async (id) => {
  const supabase = await createClient();

  const result = await supabase.from("targets").select("*").eq("id", id);

  if (result.error) {
    await errorLogger("getTarget()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  if (result.data.length > 0) {
    return {
      status: "OK",
      message: null,
      data: result.data[0],
    };
  }

  return {
    status: "ERROR",
    message: "Unable to get client",
    data: null,
  };
};

export const getTargets = async () => {
  const supabase = await createClient();

  const result = await supabase
    .from("targets")
    .select("*")
    .neq("status", "DELETED")
    .order("month", { ascending: false });


  if (result.error) {
    await errorLogger("getTargets()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: result.data,
  };
};

export const addTargets = async (targets) => {
  try {
    const supabase = await createClient();

    let result = await getUser();
    const user = result.data;
    const currentDate = new Date();

    const targetsToAdd = targets.map((target) => ({
      ...target,
      user_id: user.id,
      created_at: currentDate,
    }));


    result = await supabase.from("targets").upsert(targetsToAdd, { onConflict: ["email"] });

    if (result.error) {
      await errorLogger("addTargets()", result.error.message);

      return {
        status: "ERROR",
        message: result.error.message,
        data: null,
      };
    }

    return {
      status: "OK",
      message: null,
      data: null,
    };
  } catch (error) {
    await errorLogger("addTargets()", error);

    return {
      status: "ERROR",
      message: null,
      data: null,
    };
  }
};
export const addTarget = async (target) => {
  const supabase = await createClient();

  const userResult = await getUser();
  const user = userResult.data;


  const result = await supabase
    .from("targets")
    .insert({
      month: target.month,
      year: target.year,
      target_amount: target.target_amount,
      sales_amount: target.sales_amount,
      user_id: user.id,
      status: "ACTIVE",
      created_at: new Date(),
      activity: [
        {
          message: `<p class='mb-0'>Target added by ${user.first_name}</p>`,
          date_time: new Date(),
        },
      ],
    })



  if (result.error) {
    await errorLogger("addTarget()", result.error.message);
    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const editTarget = async (target) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;
  result = await supabase
    .from("targets")
    .update({
      month: target.month || '',
      year: target.year || 0,
      target_amount: target.target_amount !== undefined ? target.target_amount : 0,
      sales_amount: target.sales_amount !== undefined ? target.sales_amount : 0,
      activity: [
        {
          message: "<p class='mb-0'" + ">Event logistics edited by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    }).eq("id", target.id);

  if (result.error) {
    await errorLogger("editTarget()", result.error.message);
  }

  return { status: "OK", message: null, data: null };
};

export const deletetarget = async (target) => {
  const supabase = await createClient();

  let result = await getUser();
  const user = result.data;

  result = await supabase
    .from("targets")
    .update({
      status: "DELETED",
      activity: [
        {
          message: "<p class='mb-0'" + ">target deleted by " + user.first_name + "</p>",
          date_time: new Date(),
        },
      ],
    })
    .eq("id", target.id);


  if (result.error) {
    await errorLogger("deletetarget()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  return {
    status: "OK",
    message: null,
    data: null,
  };
};

export const getFilteredInquiries = async () => {
  const supabase = await createClient();

  const result = await supabase
    .from("inquiries")
    .select(`
      *,
      user:users(*),
      proposals:proposals!proposals_inquiry_id_fkey(*)
    `)
    .order("start_datetime", { ascending: true });

  if (result.error) {
    await errorLogger("getFilteredInquiries()", result.error.message);

    return {
      status: "ERROR",
      message: result.error.message,
      data: null,
    };
  }

  const filteredData = result.data.map(inquiry => {
    const confirmedProposals = (inquiry.proposals || []).filter(p => p.confirmed === true);
    return {
      ...inquiry,
      proposals: confirmedProposals,
      total_sales: confirmedProposals.reduce((sum, p) => sum + Number(p.total_amount || 0), 0),
    };
  });

  return {
    status: "OK",
    message: null,
    data: filteredData,
  };
};


//#endregion
