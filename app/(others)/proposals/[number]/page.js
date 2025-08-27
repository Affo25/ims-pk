import ProposalBody from "./proposal-body";
import { getProposal } from "@/lib/actions";

const Proposal = async ({ params }) => {
  const response = await getProposal(params.number);

  return (
    <>
      {response.status === "OK" ? (
        <>
          <div className="container">
            <ProposalBody data={response.data} />
          </div>
        </>
      ) : (
        <div className="bg-background">
          <div id="main-wrapper">
            <div className="position-relative overflow-hidden radial-gradient min-vh-100 w-100 d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center w-100">
                <div className="row justify-content-center w-100">
                  <div className="col-md-8 col-lg-6 col-xxl-3">
                    <div className="card mb-0">
                      <div className="card-body text-center">
                        <div className="text-nowrap logo-img text-center d-block m-auto mb-5 w-50">
                          <img src="/images/main-logo.svg" className="main-logo" alt="main-logo" />
                        </div>
                        <h6 className="fw-semibold">Proposal not found.</h6>
                        <p>The proposal you are looking for cannot be found or does not exist.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Proposal;
