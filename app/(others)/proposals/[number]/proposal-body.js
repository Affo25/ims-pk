"use client";

import { useRef } from "react";
import { format } from "date-fns";
import { userData } from "@/lib/data";

const ProposalBody = ({ data }) => {
  const pdfRef = useRef();
  let daysDiff = 0;
  let hoursDiff = 0;
  let vatAmount;
  let currencySymbol;

  if (data) {
    const user = userData.find((user) => user.country === data.inquiry?.user?.country);
    vatAmount = user.vat;
    currencySymbol = user.currency;

    const startDatetime = new Date(data.inquiry_data?.start_datetime);
    const endDatetime = new Date(data.inquiry_data?.end_datetime);
    const startHour = startDatetime.getHours();
    const endHour = endDatetime.getHours();

    const msInDay = 24 * 60 * 60 * 1000;
    daysDiff = Math.ceil((endDatetime - startDatetime) / msInDay);
    hoursDiff = endHour - startHour;
  }

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = pdfRef.current;

    const opt = {
      margin: 0,
      image: { type: "png", quality: 1 },
      html2canvas: {
        scale: 2,
        dpi: 300,
        letterRendering: true,
      },
      jsPDF: { unit: "mm", format: 'a4', orientation: "portrait" },
    };

    html2pdf()
      .from(element)
      .set(opt)
      .output("blob")
      .then((pdfBlob) => {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl);
      });
  };

  return (
    <>
      {data && (
        <div className="p-3" ref={pdfRef}>
          <div className="row mb-4">
            <div className="col-md-6 d-flex align-items-center">
              <div className="w-30">
                <img src="/images/main-logo.png" className="main-logo" alt="main-logo" style={{ height: "36px", width: "186px" }} />
              </div>
            </div>
            <div className="col-md-6 d-flex flex-column align-items-end">
              <p className="fw-semibold mb-0">Studio 94 DMCC</p>
              <p className="mb-0">1402, Tower AA1, Mazaya Business Avenue</p>
              <p className="mb-0">Jumeirah Lake Towers, Dubai, UAE</p>
              <p className="mb-0">Tel: +971 4 44 88 563</p>
              <p className="mb-0">TRN: 100056040700003</p>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12">
              <div className="card bg-info-subtle shadow-none position-relative overflow-hidden mb-0" style={{ height: "80px" }}>
                <div className="card-body p-0 px-4">
                  <div className="row align-items-center h-100">
                    <div className="col-8">
                      <h4 className="fw-semibold mb-0">Here's your proposal.</h4>
                    </div>
                    <div className="col-4 d-flex flex-column align-items-end">
                      <p className="fw-semibold mb-0">{"Proposal: #" + data.number?.toUpperCase()}</p>
                      <p className="mb-0">Proposal date: {format(new Date(data.created_at), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="fw-semibold">Client details</h6>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "100px" }}>
                      Name:
                    </p>
                    <p className="mb-0">{data.inquiry_data?.name}</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "100px" }}>
                      Company:
                    </p>
                    <p className="mb-0">{data.inquiry_data?.company}</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "100px" }}>
                      Email:
                    </p>
                    <p className="mb-0">{data.inquiry_data?.email}</p>
                  </div>
                </div>
                <div>
                  <h6 className="fw-semibold">Project details</h6>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "175px" }}>
                      Event date(s):
                    </p>
                    <p className="mb-0 w-100 text-end">
                      {daysDiff <= 1 ? (
                        data.inquiry_data?.start_datetime && format(new Date(data.inquiry_data?.start_datetime), "dd MMM yyyy")
                      ) : (
                        <>
                          {data.inquiry_data?.start_datetime && format(new Date(data.inquiry_data?.start_datetime), "dd MMM yyyy")}
                          {" - "}
                          {data.inquiry_data?.end_datetime && format(new Date(data.inquiry_data?.end_datetime), "dd MMM yyyy")}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "175px" }}>
                      Timings per day:
                    </p>
                    <p className="mb-0 w-100 text-end">
                      {data.inquiry_data?.start_datetime && format(new Date(data.inquiry_data?.start_datetime), "h:mm a")}
                      {" - "}
                      {data.inquiry_data?.end_datetime && format(new Date(data.inquiry_data?.end_datetime), "h:mm a")}
                    </p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "175px" }}>
                      Location:
                    </p>
                    <p className="mb-0 w-100 text-end">{data.inquiry_data?.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12">
              <div className="table-responsive">
                <table id="proposal-table" className="table table-sm table-hover table-bordered align-middle text-center text-nowrap mb-0">
                  <thead className="table-primary">
                    <tr>
                      <th scope="col">Description</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Price</th>
                      <th scope="col">{vatAmount}% VAT</th>
                      <th scope="col">Total amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data &&
                      data.details.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>{Number(item.price) === 0 ? "Free of charge" : currencySymbol + " " + Math.abs(Number(item.price)).toLocaleString("en")}</td>
                          <td>{currencySymbol + " " + (Math.abs(Number(item.price) * vatAmount) / 100).toLocaleString("en")}</td>
                          <td> {currencySymbol + " " + Math.abs(Number(item.price) * item.quantity + ((Number(item.price) * vatAmount) / 100) * item.quantity).toLocaleString("en")} </td>
                        </tr>
                      ))}
                    <tr>
                      <td className="fw-semibold" style={{ borderBottomWidth: "1px" }}>
                        Total
                      </td>
                      <td className="fw-semibold" style={{ borderBottomWidth: "1px" }}></td>
                      <td className="fw-semibold" style={{ borderBottomWidth: "1px" }}>
                        {currencySymbol} {Number(data.subtotal_amount).toLocaleString("en")}
                      </td>
                      <td className="fw-semibold" style={{ borderBottomWidth: "1px" }}>
                        {currencySymbol} {Number(data.vat_amount).toLocaleString("en")}
                      </td>
                      <td className="fw-semibold" style={{ borderBottomWidth: "1px" }}>
                        {currencySymbol} {Number(data.total_amount).toLocaleString("en")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="fw-semibold">Payment terms</h6>
                  <div className="d-flex flex-column">
                    <p className="mb-0">100% upfront payment is required.</p>
                  </div>
                </div>
                <div>
                  <h6 className="fw-semibold">Payment total</h6>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "175px" }}>
                      Sub-total:
                    </p>
                    <p className="mb-0 w-100 text-end">
                      {currencySymbol} {Number(data.subtotal_amount).toLocaleString("en")}
                    </p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "175px" }}>
                      VAT @ {vatAmount}%:
                    </p>
                    <p className="mb-0 w-100 text-end">
                      {currencySymbol} {Number(data.vat_amount).toLocaleString("en")}
                    </p>
                  </div>
                  <div className="d-flex">
                    <p className="fw-semibold mb-0" style={{ width: "175px" }}>
                      Total amount:
                    </p>
                    <p className="fw-semibold mb-0 w-100 text-end">
                      {currencySymbol} {Number(data.total_amount).toLocaleString("en")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="fw-semibold">Paying by bank transfer</h6>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "250px" }}>
                      Account payee
                    </p>
                    <p className="mb-0 w-100">Studio 94 DMCC</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "250px" }}>
                      Bank
                    </p>
                    <p className="mb-0 w-100">Emirates NDB UAE</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "250px" }}>
                      Bank address
                    </p>
                    <p className="mb-0 w-100">Gold Branch, JLT, Dubai, UAE</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "250px" }}>
                      Account number
                    </p>
                    <p className="mb-0 w-100">101 45760112 01</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "250px" }}>
                      Swift code
                    </p>
                    <p className="mb-0 w-100">EBILAEAD</p>
                  </div>
                  <div className="d-flex">
                    <p className="mb-0" style={{ width: "250px" }}>
                      IBAN
                    </p>
                    <p className="mb-0 w-100">AE80 0260 0010 1457 6011 201</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="h-100 p-2 position-relative" style={{ backgroundColor: "#f7f0ef" }}>
                    <h6 className="fw-semibold mb-3">Approved by</h6>
                    <p className="fw-semibold">Name:</p>
                    <p className="fw-semibold">Signature / Stamp:</p>
                    <p className="fw-semibold mb-0">Date:</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12 text-center">
              <h6 className="fw-semibold mb-0">Studio 94 DMCC is registered & licensed as a Freezone Company under the Rules & Regulations of DMCC</h6>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-12 text-end">
          <button type="button" className="btn btn-primary" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>
      </div>
    </>
  );
};

export default ProposalBody;
