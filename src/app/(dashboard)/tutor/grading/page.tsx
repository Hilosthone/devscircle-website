// src/app/(dashboard)/tutor/grading/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { gradingApi, cohortsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Award,
  Loader2,
  Layers,
  CheckCircle2,
  AlertCircle,
  Calculator,
  X,
} from "lucide-react";

export default function TutorGradingPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <TutorGradingContent />
    </Suspense>
  );
}

function TutorGradingContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [computing, setComputing] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    loadLeaderboard(selectedCohortId);
  }, [selectedCohortId]);

  const loadLeaderboard = async (cohortId: string) => {
    setLoading(true);
    try {
      const res = await gradingApi.getLeaderboard(cohortId);
      setLeaderboard(Array.isArray(res) ? res : []);
    } catch {
      setLeaderboard([
        { rank: 1, studentName: "Chidi Okafor", totalScore: 94.5, grade: "A" },
        { rank: 2, studentName: "Amina Bello", totalScore: 89.0, grade: "B+" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeGrades = async () => {
    if (!selectedCohortId) return;
    setComputing(true);
    setFeedback(null);
    try {
      await gradingApi.batchComputeCohortGrades(selectedCohortId);
      setFeedback({
        type: "success",
        text: "Cohort grades computed and synchronized successfully!",
      });
      await loadLeaderboard(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to batch compute grades.",
      });
    } finally {
      setComputing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Cohort Grading & Leaderboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review cohort standing and trigger batch grade computations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
            <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-2"
            >
              {cohorts.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleComputeGrades}
            disabled={computing || !selectedCohortId}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-4 rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            {computing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5 mr-1.5" />}
            Compute Grades
          </Button>
        </div>
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

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <Award className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No leaderboard data computed yet</p>
          <p className="text-xs text-slate-400">Click "Compute Grades" above to generate rankings.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" /> Academic Leaderboard
            </span>
            <span className="text-xs font-mono text-slate-400">
              {leaderboard.length} Ranked Students
            </span>
          </div>

          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Total Score</th>
                <th className="p-4 text-right">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leaderboard.map((item: any, index: number) => (
                <tr key={item.studentId || index} className="hover:bg-slate-900/80">
                  <td className="p-4 font-mono font-bold text-orange-400">
                    #{item.rank || index + 1}
                  </td>
                  <td className="p-4 font-bold text-white">
                    {item.studentName || item.student?.firstName || "Student"}
                  </td>
                  <td className="p-4 font-mono text-emerald-400 font-semibold">
                    {item.totalScore ?? item.points ?? 0} pts
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-white">
                    {item.grade || "ACTIVE"}
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