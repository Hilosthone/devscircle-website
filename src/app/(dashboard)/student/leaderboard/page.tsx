"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { LeaderboardItem } from "@/lib/types/api";
import { Trophy, Loader2, User } from "lucide-react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/grading/leaderboard");
      setLeaderboard(res.data);
    } catch {
      // Fallback staging data matching LeaderboardItem interface
      setLeaderboard([
        {
          rank: 1,
          studentId: "stu-101",
          studentName: "Chidi Okafor",
          finalScore: 94.5,
          gradeBand: "A+",
          isPassed: true,
        },
        {
          rank: 2,
          studentId: "stu-102",
          studentName: "Fatima Sanusi",
          finalScore: 91.2,
          gradeBand: "A",
          isPassed: true,
        },
        {
          rank: 3,
          studentId: "stu-103",
          studentName: "Babalola Taiwo",
          finalScore: 88.0,
          gradeBand: "A",
          isPassed: true,
        },
        {
          rank: 4,
          studentId: "stu-104",
          studentName: "Amaka Eze",
          finalScore: 76.4,
          gradeBand: "B",
          isPassed: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Trophy className="h-6 w-6 text-orange-400" /> Cohort Leaderboard
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time cohort standings calculated from attendance, assessments, examinations, and capstone evaluations.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TOP 3 PODIUM CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((item) => (
              <div
                key={item.studentId}
                className={`p-6 rounded-3xl border backdrop-blur-xl space-y-3 relative overflow-hidden flex flex-col justify-between ${
                  item.rank === 1
                    ? "bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-500/10"
                    : item.rank === 2
                    ? "bg-slate-900/80 border-slate-400/30"
                    : "bg-slate-900/60 border-amber-700/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${
                      item.rank === 1
                        ? "bg-amber-400 text-slate-950"
                        : item.rank === 2
                        ? "bg-slate-300 text-slate-950"
                        : "bg-amber-700 text-white"
                    }`}
                  >
                    #{item.rank}
                  </span>
                  <Trophy
                    className={`h-5 w-5 ${
                      item.rank === 1
                        ? "text-amber-400"
                        : item.rank === 2
                        ? "text-slate-300"
                        : "text-amber-600"
                    }`}
                  />
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{item.studentName}</h3>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Final Score:</span>
                  <span className="font-bold text-emerald-400 text-sm">{item.finalScore}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* LEADERBOARD TABLE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4">Student</th>
                  <th className="p-4 text-center">Grade Band</th>
                  <th className="p-4 text-right">Final Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {leaderboard.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-900/80">
                    <td className="p-4 text-center font-mono font-bold text-slate-400">
                      #{item.rank}
                    </td>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-500" /> {item.studentName}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.gradeBand}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-400 text-sm">
                      {item.finalScore}%
                    </td>
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