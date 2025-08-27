import { getArchivedSoftwares } from "@/lib/actions";
import ArchivedSoftwaresDataTable from "@/components/development/archived-softwares-datatable";

const ArchivedSoftwares = async () => {
  const response = await getArchivedSoftwares();

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Archived softwares</h4>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5">
                
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body p-3">{response.status === "OK" ? <ArchivedSoftwaresDataTable data={response.data} /> : <p>{response.message}</p>}</div>
      </div>
    </>
  );
};

export default ArchivedSoftwares;
