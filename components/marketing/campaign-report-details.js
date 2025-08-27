"use client";


import Papa from "papaparse";
import { toast } from "react-hot-toast";

const CampaignReportDetails = ({ campaignReport }) => {

    const handleExportCSV = () => {
        if (typeof window === "undefined") return;

        try {
            const {
                events,
                deliveredEmails = [],
                opensEmails = [],
                clicksEmails = [],
                rejectedEmails = [],
                bouncedEmails = [],
            } = campaignReport;

            const csvData = Object.entries(events).map(([email, { events }]) => {
                const clickUrls = events
                    .filter((e) => e.clickUrl)
                    .map((e) => e.clickUrl)
                    .join(" | ");

                return {
                    email,
                    click_url: clickUrls,
                    delivered: deliveredEmails.includes(email) ? 1 : "",
                    opens: opensEmails.includes(email) ? 1 : "",
                    clicks: clicksEmails.includes(email) ? 1 : "",
                    rejected: rejectedEmails.includes(email) ? 1 : "",
                    bounced: bouncedEmails.includes(email) ? 1 : "",
                };
            });

            const csv = Papa.unparse(csvData);

            const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const csvURL = URL.createObjectURL(csvBlob);
            const link = document.createElement("a");
            link.href = csvURL;
            link.setAttribute("download", "campaign-report.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("CSV has been downloaded.");
        } catch (error) {
            console.error(error);
            toast.error("CSV could not be downloaded.");
        }
    };

    return (
        <>
            <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
                <div className="card-body px-4 py-3">
                    <div className="row align-items-center h-100">
                        <div className="col-9">
                            <h4 className="fw-semibold">Campaign report</h4>
                            <p className="mb-0 text-capitalize">{campaignReport.name}</p>
                        </div>
                        <div className="col-3">
                            <div className="text-center mb-n5"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-end mb-3">
                <button type="button" className="btn btn-primary mt-3 mt-sm-0 text-end" onClick={() => handleExportCSV()}>
                    Export CSV
                </button>
            </div>

            <div className="row text-center mb-4">
                {["sent", "delivered", "opens", "clicks", "rejected", "bounced"].map((key, i) => (
                    <div className="col-md-2" key={i}>
                        <div className="card">
                            <div className="card-body p-3 d-flex justify-content-between">
                                <div>
                                    <h6 className="fw-semibold">
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </h6>
                                    <p className="mb-2">{campaignReport[key]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-md-12">
                    <table className="table align-middle text-center text-nowrap mb-0">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Email</th>
                                <th scope="col">Tags</th>
                                <th scope="col">Click URL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(campaignReport.events).map(([email, { events, tags }], index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{email}</td>
                                    <td>
                                        {tags.map((tag, i) => (
                                            <span key={i} className="badge fs-2 text-bg-primary me-1 ms-1">
                                                {tag}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        {events.map(
                                            (event, i) =>
                                                event.clickUrl && (
                                                    <p className="fs-2 mb-0" key={i}>
                                                        {event.clickUrl}
                                                    </p>
                                                )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default CampaignReportDetails;
