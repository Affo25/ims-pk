import { getClients } from "@/lib/actions";
import UnSubscribesDataTable from "@/components/marketing/unsubscribes-datatable";

export const dynamic = 'force-dynamic';

const UnSubscribes = async () => {
    const response = await getClients();
    const Clients = response.data || [];
    const unsubscribedClients = Clients.filter(client => client.subscribed === false);
    const totalClients = unsubscribedClients?.length || 0;
    return (
        <>
            <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
                <div className="card-body px-4 py-3">
                    <div className="row align-items-center h-100">
                        <div className="col-9">
                            <h4 className="fw-semibold mb-0">UnSubscribes</h4>
                            <p> Total Clients:  {totalClients} </p>
                        </div>
                        <div className="col-3">
                            <div className="text-center mb-n5">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-body p-3">{response.status === "OK" ? <UnSubscribesDataTable data={unsubscribedClients} /> : <p>{response.message}</p>}</div>
            </div>
        </>
    );
};

export default UnSubscribes;
