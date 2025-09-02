"use client";

import { useEffect, useState } from "react";
import DashboardBody from "@/components/dashboard/dashboard-body";
import {
  // getClients, getInactiveClients,
  getLeadsWithoutSaleCount, getMonthlySalesData, getMonthlyTargets, getSubmittedInquiries, getTop5UpcomingEvents, getUsers
} from "@/lib/actions";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    salesData: null,
    upcomingEvents: null,
    leadsWithoutSale: null,
    monthlyTargets: null,
    submittedDeals: null,
    users: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get session token for server actions
        const sessionToken = localStorage.getItem('session_token');
        
        if (!sessionToken) {
          window.location.href = '/signin';
          return;
        }

        const [
          response,
          upcomingEventsResult,
          LeadsWithoutSalepersonResult,
          monthlyTargetsSet,
          submittedDealsResult,
          users
        ] = await Promise.all([
          getMonthlySalesData(),
          getTop5UpcomingEvents(),
          getLeadsWithoutSaleCount(),
          getMonthlyTargets(),
          getSubmittedInquiries(),
          getUsers()
        ]);
        
        setDashboardData({
          salesData: response,
          upcomingEvents: upcomingEventsResult,
          leadsWithoutSale: LeadsWithoutSalepersonResult,
          monthlyTargets: monthlyTargetsSet,
          submittedDeals: submittedDealsResult,
          users: users,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    loadDashboardData();
  }, []);

  if (dashboardData.loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error Loading Dashboard</h4>
        <p>{dashboardData.error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const { salesData, upcomingEvents, leadsWithoutSale, monthlyTargets, submittedDeals, users } = dashboardData;
  const pendingDealsCount = submittedDeals?.data?.length || 0;

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
      {salesData?.status === "OK" ? (
        <DashboardBody
          data={salesData.data}
          LeadsWithoutSaleperson={leadsWithoutSale?.count || 0}
          upcomingEvents={upcomingEvents?.data || []}
          monthlyTargets={monthlyTargets?.data || []}
          pendingDealsCount={pendingDealsCount}
          users={users?.data || []}
        />
      ) : (
        <div className="alert alert-warning" role="alert">
          <h4 className="alert-heading">Dashboard Data Unavailable</h4>
          <p>{salesData?.message || 'Unable to load dashboard data'}</p>
        </div>
      )}
    </>
  );
};

export default Dashboard;
