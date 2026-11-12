// src/app/(dashboard)/admin/grading/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { certificatesApi, cohortsApi, gradingApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Calculator,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Award,
  SlidersHorizontal,
  RefreshCw,
  X,
} from "lucide-react";

export default function AdminGradingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminGradingContent />
    </Suspense>
  );
}

function AdminGradingContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [batchComputing, setBatchComputing] = useState<boolean>(false);
  const [activeRowAction, setActiveRowAction] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Adjust Leaderboard Points Modal
  const [adjustTarget, setAdjustTarget] = useState<any | null>(null);
  const [pointsDelta, setPointsDelta] = useState<string>("10");
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [savingAdjustment, setSavingAdjustment] = useState<boolean>(false);

  useEffect(() => {
    cohortsApi
      .list()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setCohorts(list);
        if (list.length > 0) {
          setSelectedCohortId(list[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCohortId) return;
    fetchLeaderboard(selectedCohortId);
  }, [selectedCohortId]);

  const fetchLeaderboard = async (cohortId: string) => {
    setLoading(true);
    try {
      const data = await gradingApi.getLeaderboard(cohortId);
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchCompute = async () => {
    if (!selectedCohortId) return;
    setBatchComputing(true);
    setFeedback(null);

    try {
      await gradingApi.batchComputeCohortGrades(selectedCohortId);
      setFeedback({
        type: "success",
        text: "Batch grade computation complete across all cohort students (10% Attendance / 20% Assignments / 20% Tests / 20% Final / 30% Capstone).",
      });
      await fetchLeaderboard(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Batch grade computation failed.",
      });
    } finally {
      setBatchComputing(false);
    }
  };

  const handleSingleCompute = async (studentId: string, studentName: string) => {
    if (!selectedCohortId || !studentId) return;
    setActiveRowAction(`compute-${studentId}`);
    setFeedback(null);

    try {
      await gradingApi.computeStudentGrade(studentId, selectedCohortId);
      setFeedback({
        type: "success",
        text: `Recalculated cumulative grade for ${studentName}.`,
      });
      await fetchLeaderboard(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Could not recompute student grade.",
      });
    } finally {
      setActiveRowAction(null);
    }
  };

  const handleQuickIssueCertificate = async (
    studentId: string,
    studentName: string
  ) => {
    if (!selectedCohortId || !studentId) return;
    setActiveRowAction(`cert-${studentId}`);
    setFeedback(null);

    try {
      const cert = await certificatesApi.issue(studentId, selectedCohortId);
      setFeedback({
        type: "success",
        text: `Graduation certificate issued to ${studentName} (Code: ${
          cert?.certificateCode || "VERIFIED"
        }).`,
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text:
          normalized.message ||
          `${studentName} has not met the 70% cumulative passing threshold.`,
      });
    } finally {
      setActiveRowAction(null);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget || !adjustReason.trim()) return;

    const numericPoints = Number(pointsDelta);
    if (Number.isNaN(numericPoints) || numericPoints === 0) return;

    setSavingAdjustment(true);
    try {
      await gradingApi.adjustLeaderboard({
        studentId: adjustTarget.studentId,
        points: numericPoints,
        reason: adjustReason.trim(),
      });

      setAdjustTarget(null);
      setAdjustReason("");
      setFeedback({
        type: "success",
        text: `Adjusted leaderboard points (${
          numericPoints > 0 ? `+${numericPoints}` : numericPoints
        } pts) for ${adjustTarget.studentName}.`,
      });
      await fetchLeaderboard(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to adjust leaderboard points.",
      });
    } finally {
      setSavingAdjustment(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Grading Engine & Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compute weighted cumulative scores (70% pass threshold), adjust merit points, and mint graduation certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
            <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-2"
            >
              {cohorts.length === 0 ? (
                <option value="">No cohorts found</option>
              ) : (
                cohorts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <Button
            type="button"
            disabled={batchComputing || !selectedCohortId}
            onClick={handleBatchCompute}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-5 rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            {batchComputing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{" "}
                Computing Cohort...
              </>
            ) : (
              <>
                <Calculator className="h-3.5 w-3.5 mr-1.5" /> Compute All Cohort
                Grades
              </>
            )}
          </Button>
        </div>
      </div>

      {/* WEIGHTING LEGEND */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        {[
          { label: "Attendance", weight: "10%" },
          { label: "Assignments", weight: "20%" },
          { label: "Bi-Weekly Tests", weight: "20%" },
          { label: "Final Exam", weight: "20%" },
          { label: "Capstone Project", weight: "30%" },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800"
          >
            <div className="text-[10px] font-mono uppercase text-slate-400">
              {item.label}
            </div>
            <div className="text-sm font-black text-orange-400 mt-0.5">
              {item.weight}
            </div>
          </div>
        ))}
      </div>

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

      {/* LEADERBOARD & CUMULATIVE GRADES TABLE */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <Trophy className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No computed grades yet</p>
          <p className="text-xs text-slate-400">
            Click &ldquo;Compute All Cohort Grades&rdquo; to aggregate attendance, test, assignment, and capstone scores.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">Leaderboard Pts</th>
                <th className="p-4">Cumulative Score</th>
                <th className="p-4">Graduation Status</th>
                <th className="p-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leaderboard.map((row: any, idx: number) => {
                const studentId = row.studentId || row.student?.id || row.id;
                const studentName =
                  row.studentName ||
                  `${row.student?.firstName || ""} ${
                    row.student?.lastName || ""
                  }`.trim() ||
                  "Student";
                const score = Number(
                  row.cumulativeScore ?? row.totalScore ?? row.score ?? 0
                );
                const points = Number(row.points ?? row.leaderboardPoints ?? 0);
                const passed = score >= 70;

                return (
                  <tr key={studentId || idx} className="hover:bg-slate-900/80">
                    <td className="p-4 font-mono font-black text-orange-400">
                      #{row.rank || idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {row.email || row.student?.email || ""}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {points} pts
                    </td>
                    <td className="p-4 font-mono font-black text-sm text-white">
                      {score.toFixed(1)}%
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                          passed
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {passed ? "PASS (≥ 70%)" : "BELOW 70%"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAdjustTarget({ studentId, studentName });
                          setPointsDelta("10");
                          setAdjustReason("");
                        }}
                        className="border-slate-800 text-slate-200 hover:bg-slate-800 text-[11px] h-8 px-2.5"
                      >
                        <SlidersHorizontal className="h-3 w-3 mr-1 text-orange-400" />{" "}
                        Points
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeRowAction === `compute-${studentId}`}
                        onClick={() =>
                          handleSingleCompute(studentId, studentName)
                        }
                        className="border-slate-800 text-slate-300 hover:bg-slate-800 text-[11px] h-8 px-2.5"
                      >
                        {activeRowAction === `compute-${studentId}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" /> Recompute
                          </>
                        )}
                      </Button>

                      {passed && (
                        <Button
                          size="sm"
                          disabled={activeRowAction === `cert-${studentId}`}
                          onClick={() =>
                            handleQuickIssueCertificate(studentId, studentName)
                          }
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-8 px-3"
                        >
                          {activeRowAction === `cert-${studentId}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Award className="h-3 w-3 mr-1" /> Issue Cert
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* LEADERBOARD POINT ADJUSTMENT MODAL */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Adjust Leaderboard Points
                </h3>
                <p className="text-xs text-orange-400 font-mono">
                  {adjustTarget.studentName}
                </p>
              </div>
              <button
                onClick={() => setAdjustTarget(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustPoints} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Points Delta (positive to bonus, negative to deduct) *
                </label>
                <input
                  required
                  type="number"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(e.target.value)}
                  placeholder="e.g. 15 or -5"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Audit Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Hackathon demo day winner / Peer mentorship bonus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustTarget(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingAdjustment}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {savingAdjustment ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Apply Points Adjustment"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}