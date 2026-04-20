import * as Sentry from "@sentry/react";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance } from "firebase/performance";
import { app } from "../lib/firebase";

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [],
      tracesSampleRate: 1.0,
    });

    try {
      getAnalytics(app);
      getPerformance(app);
    } catch (e) {
      console.warn("Monitoring services could not be initialized:", e);
    }
  }
};

export const trackEvent = (name: string, params?: Record<string, unknown>) => {
  try {
    const analytics = getAnalytics(app);
    logEvent(analytics, name, params);
  } catch (e) {
    // Silent fail in dev
  }
};

export const captureError = (error: Error | unknown, context?: Record<string, unknown>) => {
  console.error("Captured Error:", error, context);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  }
};
