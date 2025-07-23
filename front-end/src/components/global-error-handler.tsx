"use client";

import { useEffect } from "react";
import { logError } from "@/lib/utils";
import { toast } from "sonner";

export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError("UnhandledPromiseRejection", event.reason, {
        type: "unhandled_promise_rejection",
        timestamp: new Date().toISOString(),
      });

      // Show user-friendly error message for fetch errors
      if (event.reason instanceof Error) {
        if (
          event.reason.message.includes("fetch") ||
          event.reason.message.includes("Failed to fetch")
        ) {
          toast.error(
            "Network connection issue. Please check your internet connection and try again.",
          );
        } else if (event.reason.message.includes("timeout")) {
          toast.error("Request timed out. Please try again.");
        } else if (event.reason.message.includes("CORS")) {
          toast.error("Cross-origin request blocked. Please contact support.");
        }
      }

      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Handle global JavaScript errors
    const handleError = (event: ErrorEvent) => {
      // Create a proper error object if one doesn't exist
      const error = event.error || new Error(event.message || "Unknown error");

      logError("GlobalError", error, {
        type: "global_error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
      });

      // Show user-friendly error message based on error type
      if (
        event.message.includes("fetch") ||
        event.message.includes("Failed to fetch")
      ) {
        toast.error(
          "Network error occurred. Please refresh the page and try again.",
        );
      } else if (
        event.message.includes("TradingView") ||
        event.filename?.includes("tradingview") ||
        event.filename?.includes("s3.tradingview.com")
      ) {
        // Handle TradingView-specific errors more gracefully
        console.warn(
          "TradingView widget error detected, but not showing toast to avoid spam",
        );
      }
    };

    // Handle resource loading errors (images, scripts, etc.)
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        logError(
          "ResourceLoadError",
          new Error(`Failed to load resource: ${target.tagName}`),
          {
            type: "resource_error",
            tagName: target.tagName,
            src:
              (target as HTMLImageElement).src ||
              (target as HTMLLinkElement).href ||
              "",
            timestamp: new Date().toISOString(),
          },
        );

        // Handle specific resource types
        if (target.tagName === "SCRIPT") {
          const scriptSrc = (target as HTMLScriptElement).src || "";

          // Don't show toast for TradingView script errors to avoid spam
          if (scriptSrc.includes("tradingview.com")) {
            console.warn("TradingView script failed to load:", scriptSrc);
          } else {
            toast.error(
              "Failed to load external script. Some features may not work properly.",
            );
          }
        } else if (target.tagName === "IMG") {
          // Don't show toast for image errors as they're usually not critical
          console.warn(
            "Image failed to load:",
            (target as HTMLImageElement).src,
          );
        }
      }
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    window.addEventListener("error", handleResourceError, true); // Use capture phase for resource errors

    // Network status monitoring
    const handleOnline = () => {
      toast.success("Connection restored");
    };

    const handleOffline = () => {
      toast.error("You are offline. Some features may not work properly.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
      window.removeEventListener("error", handleResourceError, true);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Hook for manual error reporting
export function useGlobalErrorHandler() {
  return {
    reportError: (
      error: Error,
      context?: string,
      additionalData?: Record<string, unknown>,
    ) => {
      logError(context || "ManualReport", error, additionalData);

      // Show appropriate user message based on error type
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        toast.error(
          "Network error occurred. Please check your connection and try again.",
        );
      } else if (error.message.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
  };
}
