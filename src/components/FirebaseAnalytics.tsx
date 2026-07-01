import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logFirebasePageView } from "@/lib/firebase";

export function FirebaseAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`;
    void logFirebasePageView(path);
  }, [location.hash, location.pathname, location.search]);

  return null;
}