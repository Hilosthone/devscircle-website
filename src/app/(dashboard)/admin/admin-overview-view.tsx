"use client";

import { useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api";
import { ApplicationItem } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function AdminOverviewView() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);

  useEffect(() => {
    applicationsApi
      .list()
      .then((data) => setApplications(data))
      .catch(() => {
        setApplications([
          {
            id: "app-1",
            email: "student@example.com",
            firstName: "Amaka",
            lastName: "Okafor",
            phoneNumber: "+2349012345678",
            programmeSlug: "backend-mern",
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setLoadingApps(false));
  }, []);

  const handleDecision = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await applicationsApi.decision(id, status, "Reviewed by admissions admin");
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch {
      alert("Failed to update application status.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Admissions Pipeline Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review student scholarship applications and grant 90% scholarship approvals.
          </p>
        </div>
      </div>

      {loadingApps ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Programme</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {applications.map((app) => (
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
                  <td className="p-4 text-right space-x-2">
                    {app.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleDecision(app.id, "APPROVED")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-8 px-3"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecision(app.id, "REJECTED")}
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
    </div>
  );
}