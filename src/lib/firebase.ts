import { getApp, getApps, initializeApp } from "firebase/app";
import {
  initializeAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from "firebase/analytics";

const firebaseConfig = {
  apiKey: "@secret:GOOGLE_API_KEY".trim(),
  authDomain: "deckora-29d81.firebaseapp.com",
  projectId: "deckora-29d81",
  storageBucket: "deckora-29d81.firebasestorage.app",
  messagingSenderId: "8026451546",
  appId: "1:8026451546:web:e566e3dc626cc708a43263",
  measurementId: "G-XLNK76Y9JW",
};

let analyticsPromise: Promise<Analytics | null> | null = null;

const getFirebaseAnalytics = () => {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => {
        if (!supported) return null;

        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

        try {
          return initializeAnalytics(app, {
            config: { send_page_view: false },
          });
        } catch {
          return initializeAnalytics(app);
        }
      })
      .catch((error) => {
        console.warn("Firebase Analytics is unavailable", error);
        return null;
      });
  }

  return analyticsPromise;
};

export const logFirebasePageView = async (path: string, title?: string) => {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;

  logEvent(analytics, "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
};