"use client";

import { useRouter } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { getSalesDataByDateRange } from "@/lib/actions";
import { solutions } from "@/lib/data";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const DashboardBody = ({
  LeadsWithoutSaleperson = 0,
  data = null,
  upcomingEvents = [],
  monthlyTargets = [],
  pendingDealsCount = 0,
  // clientData,
  // users
}) => {
  const router = useRouter();
  const [formattedEvents, setFormattedEvents] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  }); const [endDate, setEndDate] = useState(new Date());
  const [dailySales, setDailySales] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState("");
  const [initialLast7Days, setInitialLast7Days] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  const fetchDailySalesData = async () => {
    setIsLoading(true);
    try {
      const result = await getSalesDataByDateRange(startDate.toISOString(), endDate.toISOString(), source);
      if (result.status === "OK") {
        setDailySales(result.data);

        if (isFirstLoad) {
          setInitialLast7Days(result.data.total);
          setIsFirstLoad(false);
        }
      } else {
        setDailySales(null);
        console.error(result.message);
      }
    } catch (err) {
      console.error("Error fetching daily sales:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleSolutionFilter = () => {
  //   fetchDailySalesData();
  // };

  // const dData = {
  //   labels: ["Prospects", "Retention", "UnSubscribed"],
  //   datasets: [
  //     {
  //       data: clientData,
  //       backgroundColor: ["rgba(134, 250, 26, 0.27)", "rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)"],
  //       borderColor: ["rgb(122, 252, 0)", "rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
  //       borderWidth: 1,
  //     },
  //   ],
  // };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };

  const target = monthlyTargets.length > 0 ? monthlyTargets[0] : null;

  // Format the yearly sales data for Chart.js
  const formatChartData = (salesData) => {
    if (!salesData) {
      return null;
    }

    // If data already has datasets, return as-is
    if (salesData.datasets) {
      return salesData;
    }

    // If data has labels and data properties, format it
    if (salesData.labels && salesData.data) {
      return {
        labels: salesData.labels,
        datasets: [{
          label: 'Monthly Sales (AED)',
          data: salesData.data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
    }

    // If it's an array or other structure, create a default format
    if (Array.isArray(salesData)) {
      return {
        labels: salesData.map((_, index) => `Month ${index + 1}`),
        datasets: [{
          label: 'Monthly Sales (AED)',
          data: salesData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
    }

    return null;
  };

  const chartData = formatChartData(data);

  const handleSolutionChange = (e) => {
    setSource(e.target.value);
  };

  useEffect(() => {
    const formatted = upcomingEvents.map(event => ({
      ...event,
      formattedDate: event.start_datetime ? new Date(event.start_datetime).toLocaleDateString() : "N/A"
    }));
    setFormattedEvents(formatted);
    fetchDailySalesData();
  }, [upcomingEvents, startDate, endDate, source,]);

  return (
    <>
      <div className="row">
        <div className="col-lg-3">
          <div className="card" style={{ minHeight: "200px" }}>
            <div className="card-body">
              <div className="row align-items-start">
                <div className="col-8">
                  <h5 className="card-title fw-semibold">Pending deals</h5>
                  <p className="card-subtitle mb-2">Submitted proposals</p>
                  <div className="d-flex align-items-center mb-2">
                    <h4 className="fw-semibold mb-0 me-8">{pendingDealsCount}</h4>
                  </div>
                  <p className="card-subtitle mb-2">Pending Leads</p>
                  <div className="d-flex align-items-center">
                    <h4 className="fw-semibold mb-0 me-8">{LeadsWithoutSaleperson}</h4>
                  </div>
                </div>
                <div className="col-4">
                  <div className="d-flex justify-content-end">
                    <div className="text-white text-bg-secondary rounded-circle p-6 d-flex align-items-center justify-content-center">
                      <i className="ti ti-hourglass fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card" style={{ minHeight: "200px" }}>
            <div className="card-body">
              <div className="row alig n-items-start">
                <div className="col-8">
                  <h5 className="card-title fw-semibold">Total sales</h5>
                  <p className="card-subtitle mb-2">{currentMonthName}</p>
                  <div className="d-flex align-items-center mb-2">
                    <h4 className="fw-semibold mb-0 me-8">AED {(data && data.currentMonth) ? data.currentMonth.toLocaleString("en-US") : 0}
                    </h4>
                  </div>
                  <p className="card-subtitle mb-2">Last 7 days</p>
                  <div className="d-flex align-items-center">
                    {/* <h4 className="fw-semibold mb-0 me-8">AED {initialLast7Days !== null ? initialLast7Days.toLocaleString("en-US") : 0} */}
                    {/* </h4> */}
                  </div>
                </div>
                <div className="col-4">
                  <div className="d-flex justify-content-end">
                    <div className="text-white text-bg-secondary rounded-circle p-6 d-flex align-items-center justify-content-center">
                      <i className="ti ti-currency-dollar fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card" style={{ minHeight: "200px" }}>
            <div className="card-body">
              <div className="row alig n-items-start">
                <div className="col-8">
                  <h5 className="card-title fw-semibold">Total sales</h5>
                  <p className="card-subtitle mb-9">Year till date</p>
                  <div className="d-flex align-items-center mb-3">
                    <h4 className="fw-semibold mb-0 me-8">AED {(data && data.total) ? data.total.toLocaleString("en-US") : 0}
                    </h4>
                  </div>
                </div>
                <div className="col-4">
                  <div className="d-flex justify-content-end">
                    <div className="text-white text-bg-secondary rounded-circle p-6 d-flex align-items-center justify-content-center">
                      <i className="ti  ti-calendar-stats fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="card" style={{ minHeight: "200px" }}>
            <div className="card-body">
              <div className="row alig n-items-start">
                <div className="col-8">
                  <h5 className="card-title fw-semibold">Sales target</h5>
                  {target ? (
                    <>
                      <p className="card-subtitle mb-9">{target.month}, {target.year}</p>
                      <div className="d-flex align-items-center mb-3">
                        <h4 className="fw-semibold mb-0 me-8">AED {target.target_amount}</h4>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted">
                      No monthly target available.
                      <button
                        onClick={() => router.push('/accounts/target')}
                        className="btn border-0 border-bottom border-primary px-0"
                        style={{
                          borderRadius: 0,
                          borderWidth: "0 0 2px 0",
                          fontWeight: "500",
                        }}
                      >
                        Set Target →
                      </button>
                    </p>
                  )}
                </div>
                <div className="col-4">
                  <div className="d-flex justify-content-end">
                    <div className="text-white text-bg-secondary rounded-circle p-6 d-flex align-items-center justify-content-center">
                      <i className="ti ti-chart-bar fs-6"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        {/* <div className="col-lg-3">
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">
              <div className="row align-items-start">
                <div className="col-12">
                  <h5 className="card-title fw-semibold">Total clients</h5>
                  <p className="card-subtitle mb-9">Active leads</p>
                  <div className="d-flex align-items-center mb-3">
                    <Doughnut options={options} data={dData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="col-lg-9">
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">
              <div className="row align-items-start">
                <div className="col-12">
                  <h5 className="card-title fw-semibold">Total sales</h5>
                  <p className="card-subtitle mb-9">Year till date</p>
                  <div className="d-flex align-items-center mb-3">
                    {chartData ? (
                      <Bar options={options} data={chartData} />
                    ) : (
                      <p>No data available for this year.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 d-flex align-items-stretch">
          <div className="card w-100">
            <div className="card-body">
              <div className="mb-4">
                <h5 className="card-title fw-semibold">Upcoming events</h5>
                <p className="card-subtitle">This month</p>
              </div>
              {formattedEvents.map((event, idx) => (
                <div key={idx} className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex">
                    <div>
                      <h6 className="mb-1 fs-4 fw-semibold">{event.event_name || "N/A"}</h6>
                      <p className="fs-3 mb-0">{event.company || "N/A"}</p>
                    </div>
                  </div>
                  <h6 className="mb-0 fw-semibold">{event.formattedDate}</h6>
                </div>
              ))}

              <div className="text-end mt-3">
                <button
                  onClick={() => router.push('/events/active')}
                  className="btn border-0 border-bottom border-primary px-0"
                  style={{
                    borderRadius: 0,
                    borderWidth: "0 0 2px 0",
                    fontWeight: "500",
                  }}
                >
                  Go to Active Events →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-12">
          <div className="card" style={{ minHeight: "400px" }}>
            <div className="card-body">
              <h5 className="card-title fw-semibold">Total Sales : AED {(dailySales && dailySales.total) ? dailySales.total.toLocaleString() : 0}
              </h5>
              <div className="row align-items-start">
                <div className="col-3 pb-4">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={startDate.toISOString().split("T")[0]}
                    onChange={(e) => setStartDate(new Date(e.target.value))}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={endDate.toISOString().split("T")[0]}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                  />
                </div>
                <div className="col-3">
                  <label className="form-label">Solution</label>
                  <select className="form-select" id="fish-filter" value={source} onChange={handleSolutionChange}>
                    <option value="">All</option>
                    {solutions.map((per) => (
                      <option key={per} value={per}>
                        {per}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex align-items-center mb-3">
                  {isLoading ? (
                    <p>Loading data...</p>
                  ) : dailySales && formatChartData(dailySales) ? (
                    <>
                      <Bar options={options} data={formatChartData(dailySales)} />
                    </>
                  ) : (
                    <p>No data available for selected range.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardBody;
