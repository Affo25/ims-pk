import { getClearedPayments } from "@/lib/actions";
import ClearedPaymentsDataTable from "@/components/accounts/cleared-payments-datatable";

const ClearedPayments = async () => {
  const response = await getClearedPayments();
  const total_cleared_payments = response.data.length;

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Cleared payments</h4>
              <p> Total Cleared Payments:  {total_cleared_payments} </p>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5">

              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body p-3">{response.status === "OK" ? <ClearedPaymentsDataTable data={response.data} /> : <p>{response.message}</p>}</div>
      </div>
    </>
  );
};

export default ClearedPayments;
