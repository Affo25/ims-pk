"use client";

import Link from "next/link";
import Loader from "./loader";
import toast from "react-hot-toast";
import { logger } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCounts } from "@/lib/use-counts";
import { usePathname } from "next/navigation";
import { getUser, signOutUser } from "@/lib/actions";

const MainWrapper = ({ children }) => {
  const router = useRouter();
  const { counts } = useCounts();
  const pathname = usePathname();
  const [user, setUser] = useState({});
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebar, showSidebar] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  useEffect(() => {
    getData();
    handleActiveMenu(pathname);
  }, []);

  const getData = async () => {
    try {
      let response = await getUser();

      if (response.status === "ERROR") {
        logger("getData()", "Something went wrong.");
        toast.error(response.message);
        return;
      }

      setUser(response.data);
      setAreas(response.data.areas);
      setLoading(false);
    } catch (error) {
      logger("getData()", "Something went wrong.");
      toast.error("Something went wrong.");
    }
  };

  const handleSignout = async () => {
    await signOutUser();
    router.push("/signin");
  };

  const handleSidebar = () => {
    showSidebar(!sidebar);
  };

  const handleActiveMenu = (selectedMenu) => {
    if (activeMenu === selectedMenu) {
      setActiveMenu("");
      return;
    }

    setActiveMenu(selectedMenu);
  };

  return (
    <>
      {loading && <Loader />}
      <div id="main-wrapper" className={sidebar ? "show-sidebar" : ""}>
        <aside className="left-sidebar with-vertical">
          <div>
            <div className="brand-logo d-flex align-items-center justify-content-between">
              <div className="text-nowrap logo-img">
                <img src="/images/main-logo.svg" className="dark-logo" alt="main-logo" style={{ minHeight: "30px" }} />
              </div>
              <div className="sidebartoggler ms-auto text-decoration-none fs-5 d-block d-xl-none" onClick={handleSidebar}>
                <i className="ti ti-x"></i>
              </div>
            </div>
            <nav className="sidebar-nav scroll-sidebar" data-simplebar>
              <ul id="sidebarnav">
                <li className="nav-small-cap">
                  <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                  <span className="hide-menu">Menu</span>
                </li>
                {areas && areas.includes("dashboard") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link " + (pathname === "/dashboard" ? "active" : "")} href="/dashboard" aria-expanded="false" onClick={() => handleActiveMenu("/dashboard")}>
                      <span>
                        <i className="ti ti-layout-grid"></i>
                      </span>
                      <span className="hide-menu">Dashboard</span>
                    </Link>
                  </li>
                )}

                {areas && areas.includes("sales") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link has-arrow " + (activeMenu.includes("sales") ? "active" : "")} href={{}} aria-expanded="false" onClick={() => handleActiveMenu("/sales")}>
                      <span className="d-flex">
                        <i className="ti ti-currency-dollar"></i>
                      </span>
                      <span className="hide-menu">Sales</span>
                    </Link>
                    <ul aria-expanded="false" className={"collapse first-level " + (activeMenu.includes("sales") ? "in" : "")}>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/sales/lead" ? "active" : "")} href="/sales/lead" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Leads</span>
                          {/* <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.inquiryCounts && counts.inquiryCounts.new}</span> */}
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/sales/new" ? "active" : "")} href="/sales/new" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">New inquiries</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.inquiryCounts && counts.inquiryCounts.new}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/sales/submitted" ? "active" : "")} href="/sales/submitted" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Submitted inquiries</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.inquiryCounts && counts.inquiryCounts.submitted}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/sales/confirmed" ? "active" : "")} href="/sales/confirmed" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Confirmed inquiries</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.inquiryCounts && counts.inquiryCounts.confirmed}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/sales/lost" ? "active" : "")} href="/sales/lost" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Lost inquiries</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.inquiryCounts && counts.inquiryCounts.lost}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/sales/saleReport" ? "active" : "")} href="/sales/saleReport" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Sale Reports</span>
                          {/* <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.inquiryCounts && counts.inquiryCounts.new}</span> */}
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {areas && areas.includes("events") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link has-arrow " + (activeMenu.includes("events") ? "active" : "")} href={{}} aria-expanded="false" onClick={() => handleActiveMenu("/events")}>
                      <span className="d-flex">
                        <i className="ti ti-rocket"></i>
                      </span>
                      <span className="hide-menu">Events</span>
                    </Link>
                    <ul aria-expanded="false" className={"collapse first-level " + (activeMenu.includes("events") ? "in" : "")}>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/events/active" ? "active" : "")} href="/events/active" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Active events</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.eventCounts && counts.eventCounts.active}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/events/finished" ? "active" : "")} href="/events/finished" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Finished events</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.eventCounts && counts.eventCounts.finished}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/events/cancelled" ? "active" : "")} href="/events/cancelled" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Cancelled events</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.eventCounts && counts.eventCounts.cancelled}</span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
                {areas && areas.includes("development") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link has-arrow " + (activeMenu.includes("development") ? "active" : "")} href={{}} aria-expanded="false" onClick={() => handleActiveMenu("/development")}>
                      <span>
                        <i className="ti ti-book"></i>
                      </span>
                      <span className="hide-menu">Development</span>
                    </Link>
                    <ul aria-expanded="false" className={"collapse first-level " + (activeMenu.includes("development") ? "in" : "")}>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/development/software-tracker" ? "active" : "")} href="/development/software-tracker" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Software tracker</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.softwareCounts && counts.softwareCounts.pending}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/development/archived-softwares" ? "active" : "")} href="/development/archived-softwares" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Archived softwares</span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {areas && areas.includes("marketing") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link has-arrow " + (activeMenu.includes("marketing") ? "active" : "")} href={{}} aria-expanded="false" onClick={() => handleActiveMenu("/marketing")}>
                      <span className="d-flex">
                        <i className="ti ti-magnet"></i>
                      </span>
                      <span className="hide-menu">Marketing</span>
                    </Link>
                    <ul aria-expanded="false" className={"collapse first-level " + (activeMenu.includes("marketing") ? "in" : "")}>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/marketing/clients" ? "active" : "")} href="/marketing/clients" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Clients</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/marketing/templates" ? "active" : "")} href="/marketing/templates" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Templates</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/marketing/campaigns" ? "active" : "")} href="/marketing/campaigns" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Campaigns</span>
                        </Link>
                      </li>
                      {/* <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname.includes("/marketing/campaign-reports") ? "active" : "")} href="/marketing/campaign-reports" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Campaign reports</span>
                        </Link>
                      </li> */}
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/marketing/unsubscribes" ? "active" : "")} href="/marketing/unsubscribes" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">UnSubscribes</span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}

                {areas && areas.includes("accounts") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link has-arrow " + (activeMenu.includes("accounts") ? "active" : "")} href={{}} aria-expanded="false" onClick={() => handleActiveMenu("/accounts")}>
                      <span className="d-flex">
                        <i className="ti ti-file-text"></i>
                      </span>
                      <span className="hide-menu">Accounts</span>
                    </Link>
                    <ul aria-expanded="false" className={"collapse first-level " + (activeMenu.includes("accounts") ? "in" : "")}>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/accounts/pending" ? "active" : "")} href="/accounts/pending" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Pending invoices</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.paymentCounts && counts.paymentCounts.pending}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/accounts/unpaid" ? "active" : "")} href="/accounts/unpaid" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Unpaid payments</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.paymentCounts && counts.paymentCounts.unpaid}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/accounts/cleared" ? "active" : "")} href="/accounts/cleared" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Cleared payments</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.paymentCounts && counts.paymentCounts.cleared}</span>
                        </Link>
                      </li>
                      <li className="sidebar-item">
                        <Link className={"sidebar-link " + (pathname === "/accounts/target" ? "active" : "")} href="/accounts/target" aria-expanded="false">
                          <div className="round-16 d-flex align-items-center justify-content-center">
                            <i className="ti ti-circle"></i>
                          </div>
                          <span className="hide-menu">Target sales</span>
                          <span className="badge badge-sm bg-light-subtle text-dark ms-auto">{counts.paymentCounts && counts.paymentCounts.target}</span>
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
                {areas && areas.includes("international") && (
                  <li className="sidebar-item">
                    <Link className="sidebar-link" href="/sales/international" aria-expanded="false">
                      <div className="round-16 d-flex align-items-center justify-content-center">
                        <i className="ti ti-circle"></i>
                      </div>
                      <span className="hide-menu">International inquiries</span>
                    </Link>
                  </li>
                )}
                {areas && areas.includes("users") && (
                  <li className="sidebar-item">
                    <Link className={"sidebar-link " + (pathname === "/users" ? "active" : "")} href="/users" aria-expanded="false" onClick={() => handleActiveMenu("/users")}>
                      <span>
                        <i className="ti ti-users"></i>
                      </span>
                      <span className="hide-menu">Users</span>
                    </Link>
                  </li>
                )}
                <hr />
                {areas && areas.includes("EventsList") && (
                  <li className="sidebar-item">
                    <Link className="sidebar-link" href="/events-list" aria-expanded="false" target="_blank">
                      <span>
                        <i className="ti ti-list-details"></i>
                      </span>
                      <span className="hide-menu">Events list</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            <div className="fixed-profile p-3 mx-4 mb-2 bg-secondary-subtle rounded sidebar-ad mt-3">
              <div className="hstack gap-3">
                <div className="john-img">
                  <img src="/images/user-1.jpg" className="rounded-circle" width="40" height="40" alt="" />
                </div>
                <div className="john-title">
                  <h6 className="mb-0 fs-4 fw-semibold">{user && user.first_name}</h6>
                  <span className="fs-2">{user && user.designation}</span>
                </div>
                <button className="border-0 bg-transparent text-dark ms-auto" tabIndex="0" type="button" aria-label="signout" onClick={handleSignout}>
                  <i className="ti ti-power fs-6"></i>
                </button>
              </div>
            </div>
          </div>
        </aside>
        <div className="page-wrapper">
          <header className="topbar">
            <div className="with-vertical">
              <nav className="navbar navbar-expand-xl p-0">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <button className="nav-link d-block d-xl-none sidebartoggler nav-icon-hover ms-n3" style={{ paddingTop: "5px" }} id="headerCollapse" onClick={handleSidebar}>
                      <i className="ti ti-align-justified fs-7"></i>
                    </button>
                  </li>
                </ul>

                <div className="d-block d-xl-none">
                  <img src="/images/main-logo.svg" alt="main-logo" style={{ maxHeight: "26px", width: "100%" }} />
                </div>

                <div className="d-block d-xl-none">
                  <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
                    <li className="nav-item dropdown">
                      <Link className="nav-link pe-0" href={{}} id="drop1" data-bs-toggle="dropdown" aria-expanded="false" style={{ marginTop: "-3px" }}>
                        <div className="d-flex align-items-center">
                          <div className="user-profile-img">
                            <img src="/images/user-1.jpg" className="rounded-circle" width="35" height="35" alt="" />
                          </div>
                        </div>
                      </Link>
                      <div className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop1">
                        <div className="profile-dropdown position-relative" data-simplebar>
                          <div className="d-flex align-items-center py-9 mx-7 border-bottom">
                            <img src="/images/user-1.jpg" className="rounded-circle" width="80" height="80" alt="" />
                            <div className="ms-3">
                              <h5 className="mb-1 fs-3">{user && user.first_name + " " + user.last_name}</h5>
                              <span className="mb-1 d-block">{user && user.designation}</span>
                              <p className="mb-0 d-flex align-items-center gap-2">{user && user.email}</p>
                            </div>
                          </div>
                          <div className="d-grid py-4 px-7 pt-8">
                            <button type="button" className="btn btn-outline-primary">
                              Sign out
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                  <div className="d-flex align-items-center justify-content-between">
                    <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
                      <li className="nav-item dropdown">
                        <Link className="nav-link pe-0" href={{}} id="drop1" data-bs-toggle="dropdown" aria-expanded="false">
                          <div className="d-flex align-items-center">
                            <div className="user-profile-img">
                              <img src="/images/user-1.jpg" className="rounded-circle" width="35" height="35" alt="" />
                            </div>
                          </div>
                        </Link>
                        <div className="dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop1">
                          <div className="profile-dropdown position-relative" data-simplebar>
                            <div className="d-flex align-items-center py-9 mx-7 border-bottom">
                              <img src="/images/user-1.jpg" className="rounded-circle" width="80" height="80" alt="" />
                              <div className="ms-3">
                                <h5 className="mb-1 fs-3">{user && user.first_name + " " + user.last_name}</h5>
                                <span className="mb-1 d-block">{user && user.designation}</span>
                                <p className="mb-0 d-flex align-items-center gap-2">{user && user.email}</p>
                              </div>
                            </div>
                            <div className="d-grid py-4 px-7 pt-8">
                              <button type="button" className="btn btn-outline-primary" onClick={handleSignout}>
                                Sign out
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
          </header>
          <div className="body-wrapper">
            <div className="container-fluid">{children}</div>
          </div>
        </div>
      </div>
      <div className="dark-transparent sidebartoggler"></div>
    </>
  );
};

export default MainWrapper;
