"use client";

import { logger } from "@/lib/utils";
import { getCounts } from "@/lib/actions";
import { useCallback, useContext, createContext, useEffect, useState } from "react";

const CountsContext = createContext();

export const useCounts = () => useContext(CountsContext);

export const CountsProvider = ({ children }) => {
  const [counts, setCounts] = useState({});

  const fetchCounts = useCallback(async () => {
    try {
      const response = await getCounts();

      if (response.status === "ERROR") {
        logger("fetchCounts()", "Something went wrong.");
        return;
      }

      setCounts(response.data);
    } catch (error) {
      logger("fetchCounts()", "Something went wrong.");
      toast.error("Something went wrong.");
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return <CountsContext.Provider value={{ counts, fetchCounts }}>{children}</CountsContext.Provider>;
};
