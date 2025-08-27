import { getSoftwaresDetails } from "@/lib/actions";
import SoftwareBoard from "@/components/development/software-board";

const SoftwareTracker = async () => {
  const response = await getSoftwaresDetails();

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Software tracker</h4>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5">
                
              </div>
            </div>
          </div>
        </div>
      </div>
      {response.status === "OK" ? <SoftwareBoard data={response.data} /> : <p>{response.message}</p>}
    </>
  );
};

export default SoftwareTracker;
