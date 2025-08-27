import { getCampaigns } from "@/lib/actions";
import CampaignsDataTable from "@/components/marketing/campaigns-datatable";

const Campaigns = async () => {
  const response = await getCampaigns();
  const totalCampaigns = response.data?.length || 0;

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Campaigns</h4>
              <p>Total Campaigns : {totalCampaigns} </p>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body p-3">{response.status === "OK" ? <CampaignsDataTable data={response.data} /> : <p>{response.message}</p>}</div>
      </div>
    </>
  );
};

export default Campaigns;
