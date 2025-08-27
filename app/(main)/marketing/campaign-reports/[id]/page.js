// import { getCampaignReport } from "@/lib/actions";
// import { toast } from "react-hot-toast";
// import Papa from "papaparse";

// const CampaignReport = async ({ params }) => {
//   const { id } = await params;
//   const response = await getCampaignReport(id);
//   const campaignReport = response.data;

//   const handleExportCSV = () => {
//     try {
//       const csv = Papa.unparse({
//         fields: [
//           "email",
//           "tags",
//           "events",
//         ],
//         data: campaignReport.events
//       });

//       var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//       var csvURL = URL.createObjectURL(csvData);
//       window.open(csvURL);
//       toast.success("CSV has been downloaded.");
//     } catch (error) {
//       toast.error("CSV could not be downloaded.");
//     }
//   };

//   return (
//     <>
//       {campaignReport ? (
//         <>
//           <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
//             <div className="card-body px-4 py-3">
//               <div className="row align-items-center h-100">
//                 <div className="col-9">
//                   <h4 className="fw-semibold">Campaign report</h4>
//                   <p className="mb-0 text-capitalize"> {campaignReport.name}</p>
//                 </div>
//                 <div className="col-3">
//                   <div className="text-center mb-n5">

//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="row text-center">
//             <div className="col-md-2">
//               <div className="card">
//                 <div className="card-body p-3">
//                   <h6 className="fw-semibold">Sent</h6>
//                   <p className="mb-0">{campaignReport.sent}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2">
//               <div className="card">
//                 <div className="card-body p-3">
//                   <h6 className="fw-semibold">Delivered</h6>
//                   <p className="mb-0">{campaignReport.delivered}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2">
//               <div className="card">
//                 <div className="card-body p-3">
//                   <h6 className="fw-semibold">Opens</h6>
//                   <p className="mb-0">{campaignReport.opens}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2">
//               <div className="card">
//                 <div className="card-body p-3">
//                   <h6 className="fw-semibold">Clicks</h6>
//                   <p className="mb-0">{campaignReport.clicks}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2">
//               <div className="card">
//                 <div className="card-body p-3">
//                   <h6 className="fw-semibold">Rejected</h6>
//                   <p className="mb-0">{campaignReport.rejected}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-2">
//               <div className="card">
//                 <div className="card-body p-3">
//                   <h6 className="fw-semibold">Bounced</h6>
//                   <p className="mb-0">{campaignReport.bounced}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="row mb-3">
//             <div className="col-md-10"></div>
//             <div className="col-md-2 text-end">

//               <button type="button" className="btn btn-primary mt-3 mt-sm-0" onClick={() => handleExportCSV()}>
//                 Export CSV
//               </button>
//             </div>
//           </div>
//           <div className="row">
//             <div className="col-md-12">
//               <table className="table align-middle text-center text-nowrap mb-0">
//                 <thead>
//                   <tr>
//                     <th scope="col">#</th>
//                     <th scope="col">Name</th>
//                     <th scope="col">Events</th>
//                     <th scope="col">Click URL</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {Object.entries(campaignReport.events).map(([email, { events, tags }], index) => (
//                     <tr key={index}>
//                       <td>
//                         <p className="mb-0">{index + 1}</p>
//                       </td>
//                       <td>
//                         <p className="mb-0">{email}</p>
//                       </td>
//                       <td>
//                         {tags.map((tag, index) => (
//                           <span key={index} className="badge fs-2 text-bg-primary me-1 ms-1">
//                             {tag}
//                           </span>
//                         ))}
//                       </td>
//                       <td>
//                         {events.map(
//                           (event, index) =>
//                             event.clickUrl && (
//                               <p className="fs-2 mb-0" key={index}>
//                                 {event.clickUrl}
//                               </p>
//                             )
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       ) : (
//         <p>{response.message}</p>
//       )}
//     </>
//   );
// };

// export default CampaignReport;

// Server-side component to fetch data
import CampaignReportDetails from "@/components/marketing/campaign-report-details";
import { getCampaignReport } from "@/lib/actions";

const CampaignReport = async ({ params }) => {
  const { id } = await params;
  const response = await getCampaignReport(id);
  const campaignReport = response.data;

  return (
    <div>
      {campaignReport ? (
        <CampaignReportDetails campaignReport={campaignReport} />
      ) : (
        <p>{response.message}</p>
      )}
    </div>
  );
};

export default CampaignReport;


