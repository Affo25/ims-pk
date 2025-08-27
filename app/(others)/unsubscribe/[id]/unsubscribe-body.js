"use client";

import { unsubscribeClient } from "@/lib/actions";
import { splitName } from "@/lib/utils";
import { useState } from "react";

const UnsubscribeBody = ({ data }) => {
  const { firstName } = splitName(data.name);
  const [waiting, setWaiting] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);

  const handleUnsubscribeClient = async () => {
    try {
      setWaiting(true);

      const response = await unsubscribeClient(data.id);

      if (response.status === "ERROR") {
        setWaiting(false);
        logger("unsubscribeClient()", response.message);
        return;
      }

      setWaiting(false);
      setUnsubscribed(true);
    } catch (error) {
      setWaiting(false);
      logger("unsubscribeClient()", error);
      toast.error("Something went wrong.");
    }
  };

  return (
    <>
      {unsubscribed ? (
        <>
          <h6 className="fw-semibold">We're sorry to see you go {firstName}!</h6>
          <p>You have been removed from our mailing list.</p>
        </>
      ) : (
        <>
          <h6 className="fw-semibold">Do you really want to unsubscribe {firstName}?</h6>
          <p>If so, you'll no longer receive emails about our bespoke events and creative products.</p>
          <button type="button" disabled={waiting} className="btn btn-primary w-100" onClick={handleUnsubscribeClient}>
            {waiting ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              "Unsubscribe"
            )}
          </button>
        </>
      )}
    </>
  );
};

export default UnsubscribeBody;
