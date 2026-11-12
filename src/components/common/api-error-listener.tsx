"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ShieldAlert, X } from "lucide-react";
import { NormalizedApiError } from "@/lib/api-client";

export function ApiErrorListener() {
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent<NormalizedApiError>;
      setApiError(customEvent.detail);
    };

    window.addEventListener("dc:api-error", handleApiError);
    return () => window.removeEventListener("dc:api-error", handleApiError);
  }, []);

  useEffect(() => {
    if (!apiError) return;
    const timer = setTimeout(() => setApiError(null), 4500);
    return () => clearTimeout(timer);
  }, [apiError]);

  return (
    <AnimatePresence>
      {apiError && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-slate-900/95 border border-red-500/40 shadow-2xl shadow-red-500/10 backdrop-blur-xl flex items-start gap-3"
          >
            <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              {apiError.status === 403 ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 pr-4">
              <h4 className="text-sm font-bold text-white">
                {apiError.status === 403 ? "Permission Denied" : "Server Error"}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {apiError.message}
              </p>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}