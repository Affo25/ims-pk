import { getClient } from "@/lib/actions";
import UnsubscribeBody from "./unsubscribe-body";

const Unsubscribe = async ({ params }) => {
  const response = await getClient(params.id);

  return (
    <>
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
                      {response.status === "OK" ? <UnsubscribeBody data={response.data} /> : <p>Something went wrong while trying to unsubscribe. Please try again later.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unsubscribe;
