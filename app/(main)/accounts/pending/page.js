import { getPendingInvoices } from "@/lib/actions";
import PendingInvoicesDatatable from "@/components/accounts/pending-invoices-datatable";

export const dynamic = 'force-dynamic';

const PendingInvoices = async () => {
  const response = await getPendingInvoices();
  const total_pending_invoices = response.data ? response.data.length : 0;

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Pending invoices</h4>
              <p> Total Pending Invoices:  {total_pending_invoices} </p>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body p-3">{response.status === "OK" ? <PendingInvoicesDatatable data={response.data} /> : <p>{response.message}</p>}</div>
      </div >
    </>
  );
};

export default PendingInvoices;