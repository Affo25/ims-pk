import LeadsDataTable from "@/components/sales/leads-datatable";
import { getLeads, } from "@/lib/actions";

const Leads = async () => {
    const response = await getLeads();

    return (
        <>
            <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
                <div className="card-body px-4 py-3">
                    <div className="row align-items-center h-100">
                        <div className="col-9">
                            <h4 className="fw-semibold mb-0">Leads</h4>
                        </div>
                        <div className="col-3">
                            <div className="text-center mb-n5">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body p-3">{response.status === "OK" ? <LeadsDataTable data={response.data} user={response.user} /> : <p>{response.message}</p>}</div>
            </div>
        </>
    );
};

export default Leads;
