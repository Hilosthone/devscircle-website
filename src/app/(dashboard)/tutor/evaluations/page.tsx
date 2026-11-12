// "use client";

// import { useEffect, useState } from "react";
// import { apiClient } from "@/lib/api-client";
// import { Button } from "@/components/ui/button";
// import {
//   FileCheck2,
//   GitBranch,
//   Globe,
//   Loader2,
//   CheckCircle2,
//   AlertCircle,
//   ExternalLink,
// } from "lucide-react";

// interface SubmissionItem {
//   id: string;
//   studentId: string;
//   studentName: string;
//   repoUrl: string;
//   liveUrl: string;
//   score?: number;
//   submittedAt: string;
// }

// export default function TutorEvaluationsPage() {
//   const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);
//   const [architectureScore, setArchitectureScore] = useState<number>(28);
//   const [codeQualityScore, setCodeQualityScore] = useState<number>(28);
//   const [featuresScore, setFeaturesScore] = useState<number>(18);
//   const [deploymentScore, setDeploymentScore] = useState<number>(18);
//   const [notes, setNotes] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   useEffect(() => {
//     fetchSubmissions();
//   }, []);

//   const fetchSubmissions = async () => {
//     setLoading(true);
//     try {
//       const res = await apiClient.get("/capstone/projects/default/submissions");
//       setSubmissions(res.data);
//     } catch {
//       setSubmissions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEvaluate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedSub) return;

//     setIsSubmitting(true);
//     setErrorMsg(null);
//     const totalScore = architectureScore + codeQualityScore + featuresScore + deploymentScore;

//     try {
//       await apiClient.post(`/capstone/submissions/${selectedSub.id}/evaluate`, {
//         score: totalScore,
//         feedbackJson: {
//           architecture: architectureScore,
//           codeQuality: codeQualityScore,
//           features: featuresScore,
//           deployment: deploymentScore,
//           notes,
//         },
//       });

//       setSubmissions((prev) =>
//         prev.map((s) => (s.id === selectedSub.id ? { ...s, score: totalScore } : s))
//       );
//       setSelectedSub(null);
//     } catch (err: any) {
//       setErrorMsg(err.response?.data?.message || "Failed to submit capstone evaluation.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-8 max-w-6xl mx-auto">
//       <div>
//         <h1 className="text-2xl font-black text-white">Capstone Evaluation Console</h1>
//         <p className="text-xs text-slate-400 mt-1">
//           Review student GitHub repositories, inspect deployments, and score against the capstone rubric.
//         </p>
//       </div>

//       {errorMsg && (
//         <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
//           <AlertCircle className="h-4 w-4 shrink-0" />
//           <span>{errorMsg}</span>
//         </div>
//       )}

//       {loading ? (
//         <div className="py-12 flex justify-center">
//           <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
//         </div>
//       ) : (
//         <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
//           <table className="w-full text-left text-xs text-slate-300">
//             <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
//               <tr>
//                 <th className="p-4">Student</th>
//                 <th className="p-4">Repository & Live URL</th>
//                 <th className="p-4">Score</th>
//                 <th className="p-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-800/80">
//               {submissions.map((sub) => (
//                 <tr key={sub.id} className="hover:bg-slate-900/80">
//                   <td className="p-4 font-bold text-white">{sub.studentName}</td>
//                   <td className="p-4 space-y-1">
//                     <a
//                       href={sub.repoUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-orange-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
//                     >
//                       <GitBranch className="h-3 w-3" /> {sub.repoUrl} <ExternalLink className="h-2.5 w-2.5" />
//                     </a>
//                     <a
//                       href={sub.liveUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
//                     >
//                       <Globe className="h-3 w-3" /> {sub.liveUrl} <ExternalLink className="h-2.5 w-2.5" />
//                     </a>
//                   </td>
//                   <td className="p-4 font-mono font-bold">
//                     {sub.score !== undefined ? (
//                       <span className="text-emerald-400 flex items-center gap-1">
//                         <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {sub.score}%
//                       </span>
//                     ) : (
//                       <span className="text-amber-400 font-mono">Unevaluated</span>
//                     )}
//                   </td>
//                   <td className="p-4 text-right">
//                     <Button
//                       size="sm"
//                       onClick={() => setSelectedSub(sub)}
//                       className="bg-orange-600 hover:bg-orange-500 text-white text-[11px] h-8 px-3 rounded-lg"
//                     >
//                       <FileCheck2 className="h-3.5 w-3.5 mr-1" /> Score Submission
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* EVALUATION MODAL */}
//       {selectedSub && (
//         <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
//           <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-6 shadow-2xl">
//             <div className="flex justify-between items-start border-b border-slate-800 pb-4">
//               <div>
//                 <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
//                   Capstone Evaluation
//                 </span>
//                 <h3 className="text-lg font-bold text-white mt-1">{selectedSub.studentName}</h3>
//               </div>
//               <span className="text-xl font-black font-mono text-emerald-400">
//                 {architectureScore + codeQualityScore + featuresScore + deploymentScore}/100
//               </span>
//             </div>

//             <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1">
//                   <label className="text-slate-300 font-semibold">Architecture (Max 30):</label>
//                   <input
//                     type="number"
//                     max={30}
//                     min={0}
//                     value={architectureScore}
//                     onChange={(e) => setArchitectureScore(Number(e.target.value))}
//                     className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-slate-300 font-semibold">Code Quality (Max 30):</label>
//                   <input
//                     type="number"
//                     max={30}
//                     min={0}
//                     value={codeQualityScore}
//                     onChange={(e) => setCodeQualityScore(Number(e.target.value))}
//                     className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-slate-300 font-semibold">Features (Max 20):</label>
//                   <input
//                     type="number"
//                     max={20}
//                     min={0}
//                     value={featuresScore}
//                     onChange={(e) => setFeaturesScore(Number(e.target.value))}
//                     className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <label className="text-slate-300 font-semibold">Deployment (Max 20):</label>
//                   <input
//                     type="number"
//                     max={20}
//                     min={0}
//                     value={deploymentScore}
//                     onChange={(e) => setDeploymentScore(Number(e.target.value))}
//                     className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-slate-300 font-semibold">Feedback & Notes:</label>
//                 <textarea
//                   rows={3}
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   placeholder="Excellent modular architecture and clean TypeScript types..."
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
//                 />
//               </div>

//               <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setSelectedSub(null)}
//                   className="border-slate-800 text-slate-300 text-xs"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting...
//                     </>
//                   ) : (
//                     "Save & Submit Grade"
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// src/app/(dashboard)/tutor/evaluations/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { assessmentsApi, capstoneApi, cohortsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Award,
  BookOpen,
  X,
} from "lucide-react";

type EvaluationTab = "assignments" | "capstones";

export default function TutorEvaluationsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <TutorEvaluationsContent />
    </Suspense>
  );
}

function TutorEvaluationsContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<EvaluationTab>("assignments");

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [capstones, setCapstones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Grade Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [grading, setGrading] = useState<boolean>(false);
  const [gradeForm, setGradeForm] = useState({ score: "85", feedbackText: "" });

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
    loadEvaluationData(selectedCohortId);
  }, [selectedCohortId, activeTab]);

  const loadEvaluationData = async (cohortId: string) => {
    setLoading(true);
    try {
      if (activeTab === "assignments") {
        const res = await assessmentsApi.listSubmissions("", cohortId);
        setSubmissions(Array.isArray(res) ? res : res?.submissions || []);
      } else {
        const res = await capstoneApi.listProjects(cohortId);
        setCapstones(Array.isArray(res) ? res : res?.projects || []);
      }
    } catch {
      if (activeTab === "assignments") {
        setSubmissions([
          {
            id: "sub-101",
            student: { firstName: "Chidi", lastName: "Okafor" },
            submissionUrl: "https://github.com/chidi/api-repo",
          },
        ]);
      } else {
        setCapstones([
          {
            id: "cap-101",
            title: "GleamLearn AI E-Learning Platform",
            dueDate: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setGrading(true);
    setFeedback(null);
    try {
      if (activeTab === "assignments") {
        await assessmentsApi.gradeSubmission(selectedItem.id, {
          score: Number(gradeForm.score) || 0,
          feedback: gradeForm.feedbackText.trim(),
        });
      } else {
        await capstoneApi.evaluateSubmission(selectedItem.id, {
          score: Number(gradeForm.score) || 0,
          feedbackJson: { notes: gradeForm.feedbackText.trim() },
        });
      }

      setSelectedItem(null);
      setGradeForm({ score: "85", feedbackText: "" });
      setFeedback({
        type: "success",
        text: "Evaluation and grade recorded successfully.",
      });
      await loadEvaluationData(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to submit grade.",
      });
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Student Evaluations & Grading</h1>
          <p className="text-xs text-slate-400 mt-1">
            Grade assignment submissions and evaluate capstone projects.
          </p>
        </div>

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

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl w-fit">
        {[
          { key: "assignments", label: "Assignment Submissions", icon: BookOpen },
          { key: "capstones", label: "Capstone Projects", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as EvaluationTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : activeTab === "assignments" ? (
        submissions.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
            No assignment submissions pending review.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Submission Link</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-900/80">
                    <td className="p-4 font-bold text-white">
                      {sub.student?.firstName} {sub.student?.lastName}
                    </td>
                    <td className="p-4 font-mono">
                      {sub.submissionUrl ? (
                        <a href={sub.submissionUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                          View Repository ↗
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedItem(sub)}
                        className="bg-orange-600 hover:bg-orange-500 text-white text-[11px] h-8 px-3"
                      >
                        Grade Submission
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : capstones.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
          No capstone project submissions recorded yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Project Title</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {capstones.map((cap: any) => (
                <tr key={cap.id} className="hover:bg-slate-900/80">
                  <td className="p-4 font-bold text-orange-400">
                    {cap.title}
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    {cap.dueDate ? new Date(cap.dueDate).toLocaleDateString() : "Ongoing"}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedItem(cap)}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-[11px] h-8 px-3"
                    >
                      Evaluate Capstone
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GRADE MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Evaluate Submission</h3>
                <p className="text-xs text-slate-400">
                  Provide numeric score and feedback.
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Score (0 - 100) *</label>
                <input
                  required
                  type="number"
                  min={0}
                  max={100}
                  value={gradeForm.score}
                  onChange={(e) =>
                    setGradeForm((p) => ({ ...p, score: e.target.value }))
                  }
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Faculty Feedback / Notes *</label>
                <textarea
                  required
                  rows={4}
                  value={gradeForm.feedbackText}
                  onChange={(e) =>
                    setGradeForm((p) => ({ ...p, feedbackText: e.target.value }))
                  }
                  placeholder="Code review notes and recommendations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={grading}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {grading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Submit Grade"
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