"use client";

import { Suspense, useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { ApplicationItem } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  FileSearch,
  X,
} from "lucide-react";

const STATUS_FILTERS = [
  "ALL",
  "SUBMITTED",
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

export default function AdminApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminApplicationsContent />
    </Suspense>
  );
}

function AdminApplicationsContent() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [decisionReason, setDecisionReason] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus === "ALL" ? undefined : filterStatus;
      const data = await applicationsApi.list(statusParam);
      setApplications(Array.isArray(data) ? data : []);
    } catch {
      setApplications([
        {
          id: "app-101",
          email: "chidi.okafor@example.com",
          firstName: "Chidi",
          lastName: "Okafor",
          phoneNumber: "+2348012345678",
          programmeSlug: "backend-mern",
          status: "SUBMITTED",
          createdAt: new Date().toISOString(),
        },
        {
          id: "app-102",
          email: "fatima.sanusi@example.com",
          firstName: "Fatima",
          lastName: "Sanusi",
          phoneNumber: "+2348098765432",
          programmeSlug: "frontend-react",
          status: "UNDER_REVIEW",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (app: ApplicationItem) => {
    setSelectedApp(app);
    setDecisionReason("");
    setLoadingDetails(true);
    try {
      const fullRecord = await applicationsApi.getById(app.id);
      if (fullRecord) setSelectedApp(fullRecord);
    } catch {
      // Keep summary record if getById fails in offline/mock mode
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleMarkUnderReview = async (id: string) => {
    setSubmittingAction(true);
    try {
      await applicationsApi.review(id);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: "UNDER_REVIEW" } : app))
      );
      setSelectedApp((prev: any) => (prev ? { ...prev, status: "UNDER_REVIEW" } : null));
      setToastMsg({ type: "success", text: "Application marked as Under Review." });
    } catch (err) {
      const normalized = extractApiError(err);
      setToastMsg({
        type: "error",
        text: normalized.message || "Could not update review status.",
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDecision = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    customReason?: string
  ) => {
    setSubmittingAction(true);
    const reason =
      customReason?.trim() ||
      (status === "APPROVED"
        ? "Approved for 90% scholarship admission."
        : "Application did not meet cohort admission criteria.");

    try {
      await applicationsApi.decision(id, status, reason);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      setSelectedApp(null);
      setDecisionReason("");
      setToastMsg({
        type: "success",
        text: `Application ${status === "APPROVED" ? "approved" : "rejected"} successfully.`,
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setToastMsg({
        type: "error",
        text: normalized.message || "Failed to submit decision.",
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.programmeSlug.toLowerCase().includes(q)
    );
  });

  const isActionable = (status: string) =>
    status !== "APPROVED" && status !== "REJECTED";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Admissions Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter, inspect applicant essays, and grant 90% scholarship approvals.
          </p>
        </div>

        {/* STATUS FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-2 mr-1" />
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                filterStatus === st
                  ? "bg-orange-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            toastMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search applicant name, email, or track..."
          className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <p className="text-sm font-bold text-white">No matching applications</p>
          <p className="text-xs text-slate-400">
            Try switching the status filter or clearing your search query.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Programme</th>
                <th className="p-4">Status</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900/80">
                  <td className="p-4">
                    <div className="font-bold text-white">
                      {app.firstName} {app.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{app.email}</div>
                  </td>
                  <td className="p-4 font-mono text-orange-400">{app.programmeSlug}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        app.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : app.status === "REJECTED"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      <Clock className="h-3 w-3" /> {app.status}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDetails(app)}
                      className="text-slate-300 hover:text-white text-[11px] h-8 px-2.5"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> Inspect
                    </Button>

                    {isActionable(app.status) && (
                      <>
                        <Button
                          size="sm"
                          disabled={submittingAction}
                          onClick={() => handleDecision(app.id, "APPROVED")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-8 px-3"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={submittingAction}
                          onClick={() => handleOpenDetails(app)}
                          className="border-slate-800 text-red-400 hover:bg-red-500/10 text-[11px] h-8 px-3"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FOR FULL APPLICATION DETAILS & DECISION */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedApp.firstName} {selectedApp.lastName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedApp.email} · {selectedApp.phoneNumber}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                {selectedApp.programmeSlug}
              </span>
            </div>

            {loadingDetails ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      Current Status
                    </span>
                    <p className="text-white font-mono font-bold mt-0.5">
                      {selectedApp.status}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 text-[10px] uppercase font-mono">
                      Location
                    </span>
                    <p className="text-slate-300 mt-0.5">
                      {selectedApp.formData?.state
                        ? `${selectedApp.formData.state}, ${selectedApp.formData.country}`
                        : "Nigeria"}
                    </p>
                  </div>
                </div>

                {selectedApp.formData && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase font-mono">
                          Education / Occupation
                        </span>
                        <p className="text-slate-300 mt-0.5">
                          {selectedApp.formData.educationalBackground || "—"} ·{" "}
                          {selectedApp.formData.occupation || "—"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase font-mono">
                          Prior Experience
                        </span>
                        <p className="text-slate-300 mt-0.5">
                          {selectedApp.formData.previousExperience || "Beginner"}
                        </p>
                      </div>
                    </div>

                    {selectedApp.formData.motivation && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-mono">
                          Motivation
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {selectedApp.formData.motivation}
                        </p>
                      </div>
                    )}

                    {selectedApp.formData.whyDeserve && (
                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase font-mono">
                          Why They Deserve the 90% Scholarship
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {selectedApp.formData.whyDeserve}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {isActionable(selectedApp.status) && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-slate-400 text-[11px] font-medium">
                      Decision Note / Reason (recorded in audit trail)
                    </label>
                    <textarea
                      rows={2}
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder="Optional approval note or rejection reason..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2.5 pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setSelectedApp(null)}
                className="border-slate-800 text-slate-300 text-xs"
              >
                Close
              </Button>

              {selectedApp.status === "SUBMITTED" || selectedApp.status === "PENDING" ? (
                <Button
                  variant="outline"
                  disabled={submittingAction}
                  onClick={() => handleMarkUnderReview(selectedApp.id)}
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs"
                >
                  <FileSearch className="h-3.5 w-3.5 mr-1" /> Mark Under Review
                </Button>
              ) : null}

              {isActionable(selectedApp.status) && (
                <>
                  <Button
                    variant="outline"
                    disabled={submittingAction}
                    onClick={() =>
                      handleDecision(selectedApp.id, "REJECTED", decisionReason)
                    }
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                  >
                    Reject
                  </Button>
                  <Button
                    disabled={submittingAction}
                    onClick={() =>
                      handleDecision(selectedApp.id, "APPROVED", decisionReason)
                    }
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Approve Scholarship
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}