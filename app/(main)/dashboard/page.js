import DashboardBody from "@/components/dashboard/dashboard-body";
import {
  // getClients, getInactiveClients,
  getLeadsWithoutSaleCount, getMonthlySalesData, getMonthlyTargets, getSubmittedInquiries, getTop5UpcomingEvents, getUsers
} from "@/lib/actions";

const Dashboard = async () => {
  const response = await getMonthlySalesData();
  const upcomingEventsResult = await getTop5UpcomingEvents();
  const LeadsWithoutSalepersonResult = await getLeadsWithoutSaleCount();
  const monthlyTargetsSet = await getMonthlyTargets();
  const submittedDealsResult = await getSubmittedInquiries();
  const users = await getUsers();
  const pendingDealsCount = submittedDealsResult.data?.length || 0;
  // const retentionClients = await getInactiveClients();
  // const responses = await getClients();
  // const Clients = responses.data;

  // let totalClients = 0;
  // let totalProspectClients = 0;

  // Clients.forEach(client => {
  //   if (client.subscribed === false) totalClients++;
  //   if (client.list === "PROSPECTS") totalProspectClients++;
  // });
  // const clientData = [totalProspectClients, retentionClients.data?.length || 0, totalClients];

  return (
    <>
      <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-4" style={{ height: "125px" }}>
        <div className="card-body px-4 py-3">
          <div className="row align-items-center h-100">
            <div className="col-9">
              <h4 className="fw-semibold mb-0">Dashboard</h4>
            </div>
            <div className="col-3">
              <div className="text-center mb-n5"></div>
            </div>
          </div>
        </div>
      </div>
      {response.status === "OK" ? <DashboardBody
        data={response.data}
        LeadsWithoutSaleperson={LeadsWithoutSalepersonResult.count}
        upcomingEvents={upcomingEventsResult.data}
        monthlyTargets={monthlyTargetsSet.data}
        pendingDealsCount={pendingDealsCount}
        // clientData={clientData}
        users={users.data}
      /> : <p>{response.message}</p>}
      {/* {response.status === "OK" ? <SoftwareBoard data={response.data} /> : <p>{response.message}</p>}
        <DashboardBody /> */}
    </>
  );
};

export default Dashboard;
