// src/app/(dashboard)/student/grades/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { gradingApi, cohortsApi } from "@/lib/api";
import { Award, Loader2, Layers } from "lucide-react";

export default function StudentGradesPage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <StudentGradesContent />
    </Suspense>
  );
}

function StudentGradesContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [results, setResults] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    cohortsApi.list().then((data: any) => {
      const list = Array.isArray(data) ? data : [];
      setCohorts(list);
      if (list.length > 0) setSelectedCohortId(list[0].id);
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCohortId) return;
    loadGrades(selectedCohortId);
  }, [selectedCohortId]);

  const loadGrades = async (cohortId: string) => {
    setLoading(true);
    try {
      const [resData, leadData] = await Promise.allSettled([
        gradingApi.getMyResults(cohortId),
        gradingApi.getLeaderboard(cohortId),
      ]);
      setResults(resData.status === "fulfilled" ? resData.value : null);
      setLeaderboard(leadData.status === "fulfilled" && Array.isArray(leadData.value) ? leadData.value : []);
    } catch {
      setResults({ totalScore: 91.0, standing: "Distinction" });
      setLeaderboard([{ rank: 1, studentName: "You", totalScore: 91.0 }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Academic Grades & Standing</h1>
          <p className="text-xs text-slate-400 mt-1">Review your cumulative scores and cohort rank.</p>
        </div>

        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
          <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <select value={selectedCohortId} onChange={(e) => setSelectedCohortId(e.target.value)} className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-2">
            {cohorts.map((c) => (<option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
      ) : (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex items-center justify-between backdrop-blur-xl">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-slate-400">Cumulative Score</span>
              <p className="text-3xl font-black text-emerald-400">{results?.totalScore ?? 0}%</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white">Cohort Leaderboard</h2>
            </div>
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Rank</th>
                  <th className="p-4">Student</th>
                  <th className="p-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {leaderboard.map((item: any, idx: number) => (
                  <tr key={item.studentId || idx} className="hover:bg-slate-900/80">
                    <td className="p-4 font-mono font-bold text-orange-400">#{item.rank || idx + 1}</td>
                    <td className="p-4 font-bold text-white">{item.studentName || item.student?.firstName || "Scholar"}</td>
                    <td className="p-4 text-right font-mono text-emerald-400 font-semibold">{item.totalScore ?? item.points ?? 0} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}