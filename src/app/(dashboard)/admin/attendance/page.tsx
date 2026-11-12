"use client";

import { Suspense, useEffect, useState } from "react";
import { apiClient, extractApiError } from "@/lib/api-client";
import { attendanceApi, classesApi, cohortsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Save,
  AlertCircle,
  Layers,
  Calendar,
  UserCheck,
  ShieldCheck,
  History,
  BarChart3,
  X,
} from "lucide-react";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface AdminAttendanceRecord {
  recordId?: string;
  studentId: string;
  studentName: string;
  email: string;
  status: AttendanceStatus;
  notes?: string;
}

interface CohortOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  title: string;
  startsAt?: string;
}

export default function AdminAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminAttendanceContent />
    </Suspense>
  );
}

function AdminAttendanceContent() {
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [records, setRecords] = useState<AdminAttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Audited Single-Record Override Modal State (PATCH /attendance/:recordId)
  const [overrideTarget, setOverrideTarget] = useState<AdminAttendanceRecord | null>(
    null
  );
  const [overrideStatus, setOverrideStatus] = useState<AttendanceStatus>("EXCUSED");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [savingOverride, setSavingOverride] = useState<boolean>(false);

  // Student Cumulative Attendance Summary Modal (GET /attendance/summary)
  const [summaryTarget, setSummaryTarget] = useState<{
    studentName: string;
    data: any;
  } | null>(null);
  const [loadingSummaryId, setLoadingSummaryId] = useState<string | null>(null);

  // 1. Load all cohorts for Admin switcher
  useEffect(() => {
    cohortsApi
      .list()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setCohorts(list);
          setSelectedCohortId(list[0].id);
        } else {
          setCohorts([{ id: "cohort-101", name: "Cohort 1 — Alpha" }]);
          setSelectedCohortId("cohort-101");
        }
      })
      .catch(() => {
        setCohorts([{ id: "cohort-101", name: "Cohort 1 — Alpha" }]);
        setSelectedCohortId("cohort-101");
      });
  }, []);

  // 2. Load classes in selected cohort
  useEffect(() => {
    if (!selectedCohortId) return;
    classesApi
      .getTimetableFeed(selectedCohortId)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setClasses(list);
          setSelectedClassId(list[0].id);
        } else {
          setClasses([{ id: "class-101", title: "Session 01 — Orientation & Setup" }]);
          setSelectedClassId("class-101");
        }
      })
      .catch(() => {
        setClasses([{ id: "class-101", title: "Session 01 — Orientation & Setup" }]);
        setSelectedClassId("class-101");
      });
  }, [selectedCohortId]);

  // 3. Load attendance register for selected class (falling back to cohort enrolments if unmarked)
  useEffect(() => {
    if (!selectedClassId) return;
    fetchClassAttendance(selectedClassId, selectedCohortId);
  }, [selectedClassId]);

  const fetchClassAttendance = async (classId: string, cohortId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await apiClient.get(`/classes/${classId}/attendance`);
      const payload = res?.data?.data ?? res?.data;
      const list = Array.isArray(payload) ? payload : [];

      if (list.length > 0) {
        setRecords(
          list.map((r: any) => ({
            recordId: r.id || r.recordId,
            studentId: r.studentId || r.student?.id,
            studentName:
              r.studentName ||
              `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() ||
              "Student",
            email: r.email || r.student?.email || "",
            status: r.status || "PRESENT",
            notes: r.notes || "",
          }))
        );
      } else if (cohortId) {
        // Pre-populate roster from cohort enrolments if register hasn't been marked yet
        const enrolments = await cohortsApi.getEnrolments(cohortId);
        const enrolledList = Array.isArray(enrolments) ? enrolments : [];
        setRecords(
          enrolledList.map((e: any) => ({
            studentId: e.studentId || e.student?.id || e.id,
            studentName:
              `${e.student?.firstName || e.firstName || ""} ${
                e.student?.lastName || e.lastName || ""
              }`.trim() || "Enrolled Student",
            email: e.student?.email || e.email || "",
            status: "PRESENT",
          }))
        );
      }
    } catch {
      setRecords([
        {
          recordId: "att-rec-01",
          studentId: "stu-101",
          studentName: "Chidi Okafor",
          email: "chidi.okafor@example.com",
          status: "PRESENT",
        },
        {
          recordId: "att-rec-02",
          studentId: "stu-102",
          studentName: "Fatima Sanusi",
          email: "fatima.sanusi@example.com",
          status: "LATE",
          notes: "Joined 15 minutes after session kickoff",
        },
        {
          recordId: "att-rec-03",
          studentId: "stu-103",
          studentName: "Babalola Taiwo",
          email: "taiwo.babalola@example.com",
          status: "ABSENT",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setFeedback(null);
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const handleBulkSave = async () => {
    if (!selectedClassId || records.length === 0) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      await attendanceApi.bulkMark(
        selectedClassId,
        records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          ...(r.notes?.trim() ? { notes: r.notes.trim() } : {}),
        }))
      );
      setFeedback({
        type: "success",
        text: "Class attendance register saved and synced with student grade computations.",
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to save attendance register.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuditedOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget?.recordId || !overrideReason.trim()) return;

    setSavingOverride(true);
    try {
      await attendanceApi.correctRecord(overrideTarget.recordId, {
        newStatus: overrideStatus,
        reason: overrideReason.trim(),
      });

      setRecords((prev) =>
        prev.map((r) =>
          r.studentId === overrideTarget.studentId
            ? { ...r, status: overrideStatus, notes: overrideReason.trim() }
            : r
        )
      );
      setFeedback({
        type: "success",
        text: `Audited override logged for ${overrideTarget.studentName} (${overrideStatus}).`,
      });
      setOverrideTarget(null);
      setOverrideReason("");
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to apply audited attendance correction.",
      });
    } finally {
      setSavingOverride(false);
    }
  };

  const handleViewStudentSummary = async (rec: AdminAttendanceRecord) => {
    if (!selectedCohortId) return;
    setLoadingSummaryId(rec.studentId);
    try {
      const summary = await attendanceApi.getSummary(rec.studentId, selectedCohortId);
      setSummaryTarget({
        studentName: rec.studentName,
        data: summary,
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Could not load student attendance summary.",
      });
    } finally {
      setLoadingSummaryId(null);
    }
  };

  const counts = {
    PRESENT: records.filter((r) => r.status === "PRESENT").length,
    LATE: records.filter((r) => r.status === "LATE").length,
    EXCUSED: records.filter((r) => r.status === "EXCUSED").length,
    ABSENT: records.filter((r) => r.status === "ABSENT").length,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Attendance Oversight & Overrides
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect cohort class registers, apply audited status corrections, and verify 10% attendance grade weights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={loading || records.length === 0}
            onClick={() =>
              setRecords((prev) => prev.map((r) => ({ ...r, status: "PRESENT" })))
            }
            className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-10 px-4 rounded-xl"
          >
            <UserCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Mark All Present
          </Button>

          <Button
            onClick={handleBulkSave}
            disabled={isSaving || loading || records.length === 0}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-5 rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save Register
              </>
            )}
          </Button>
        </div>
      </div>

      {/* COHORT & CLASS FILTER BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-orange-400" /> Select Cohort
          </label>
          <select
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-orange-400" /> Select Class Session
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-orange-500"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title}
                {cls.startsAt
                  ? ` — ${new Date(cls.startsAt).toLocaleDateString()}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY STATS */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">PRESENT</span>
            <span className="text-base font-black text-emerald-400">{counts.PRESENT}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">LATE</span>
            <span className="text-base font-black text-amber-400">{counts.LATE}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">EXCUSED</span>
            <span className="text-base font-black text-blue-400">{counts.EXCUSED}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">ABSENT</span>
            <span className="text-base font-black text-red-400">{counts.ABSENT}</span>
          </div>
        </div>
      )}

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* REGISTER TABLE */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : records.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <p className="text-sm font-bold text-white">No student records found</p>
          <p className="text-xs text-slate-400">
            Ensure students are enrolled in this cohort before marking class attendance.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {records.map((rec) => (
                <tr key={rec.studentId} className="hover:bg-slate-900/80">
                  <td className="p-4">
                    <div className="font-bold text-white">{rec.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{rec.email}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {(
                        [
                          { key: "PRESENT", label: "Present", icon: CheckCircle2, active: "bg-emerald-500" },
                          { key: "LATE", label: "Late", icon: Clock, active: "bg-amber-500" },
                          { key: "EXCUSED", label: "Excused", icon: ShieldCheck, active: "bg-blue-500" },
                          { key: "ABSENT", label: "Absent", icon: XCircle, active: "bg-red-500" },
                        ] as const
                      ).map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = rec.status === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleStatusChange(rec.studentId, opt.key)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                              isSelected
                                ? `${opt.active} text-white shadow-md`
                                : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                            }`}
                          >
                            <Icon className="h-3 w-3" /> {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  <td className="p-4">
                    <input
                      type="text"
                      value={rec.notes || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRecords((prev) =>
                          prev.map((r) =>
                            r.studentId === rec.studentId ? { ...r, notes: val } : r
                          )
                        );
                      }}
                      placeholder="Remark..."
                      className="w-full min-w-[140px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </td>

                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingSummaryId === rec.studentId}
                      onClick={() => handleViewStudentSummary(rec)}
                      className="border-slate-800 text-slate-300 hover:bg-slate-800 text-[11px] h-8 px-2.5"
                    >
                      {loadingSummaryId === rec.studentId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <BarChart3 className="h-3 w-3 mr-1 text-orange-400" /> Summary
                        </>
                      )}
                    </Button>

                    {rec.recordId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOverrideTarget(rec);
                          setOverrideStatus(rec.status);
                          setOverrideReason("");
                        }}
                        className="border-slate-800 text-amber-400 hover:bg-amber-500/10 text-[11px] h-8 px-2.5"
                      >
                        <History className="h-3 w-3 mr-1" /> Audit Override
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AUDITED CORRECTION MODAL (PATCH /attendance/:recordId) */}
      {overrideTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Audited Attendance Override
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {overrideTarget.studentName} · Logged to system audit trail
                </p>
              </div>
              <button
                onClick={() => setOverrideTarget(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAuditedOverride} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Corrected Status
                </label>
                <select
                  value={overrideStatus}
                  onChange={(e) =>
                    setOverrideStatus(e.target.value as AttendanceStatus)
                  }
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="LATE">LATE</option>
                  <option value="EXCUSED">EXCUSED</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Audit Justification Reason (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified network outage / approved medical excuse submitted to admin."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOverrideTarget(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingOverride}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  {savingOverride ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Submit Audited Correction"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT SUMMARY MODAL (GET /attendance/summary) */}
      {summaryTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">
                  Cumulative Attendance Summary
                </h3>
                <p className="text-xs text-orange-400 font-mono">
                  {summaryTarget.studentName}
                </p>
              </div>
              <button
                onClick={() => setSummaryTarget(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] font-mono uppercase">
                  Attendance Rate
                </span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">
                  {summaryTarget.data?.attendanceRate ??
                    summaryTarget.data?.percentage ??
                    0}
                  %
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] font-mono uppercase">
                  Sessions Attended
                </span>
                <p className="text-lg font-black text-white mt-0.5">
                  {summaryTarget.data?.attendedClasses ??
                    summaryTarget.data?.presentCount ??
                    0}{" "}
                  / {summaryTarget.data?.totalClasses ?? 0}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setSummaryTarget(null)}
                className="border-slate-800 text-slate-300 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}