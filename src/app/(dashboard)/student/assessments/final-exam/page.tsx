// src/app/(dashboard)/student/assessments/final-exam/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { capstoneApi, testsApi, cohortsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Award, Loader2, CheckCircle2, AlertCircle, Send, X } from "lucide-react";

export default function StudentFinalExamPage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <StudentFinalExamContent />
    </Suspense>
  );
}

function StudentFinalExamContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [capstones, setCapstones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Capstone Submit Modal State
  const [selectedCapstone, setSelectedCapstone] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [liveUrl, setLiveUrl] = useState<string>("");

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
    loadCapstones(selectedCohortId);
  }, [selectedCohortId]);

  const loadCapstones = async (cohortId: string) => {
    setLoading(true);
    try {
      const res = await capstoneApi.listProjects(cohortId);
      setCapstones(Array.isArray(res) ? res : res?.projects || []);
    } catch {
      setCapstones([
        { id: "cap-1", title: "Full-Stack E-Learning Platform Capstone", description: "Build and deploy GleamLearn.", dueDate: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCapstone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCapstone || !repoUrl.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await capstoneApi.submitProject(selectedCapstone.id, {
        repoUrl: repoUrl.trim(),
        liveUrl: liveUrl.trim() ? liveUrl.trim() : undefined,
      });

      setSelectedCapstone(null);
      setRepoUrl("");
      setLiveUrl("");
      setFeedback({ type: "success", text: "Capstone project submitted successfully for faculty evaluation!" });
      await loadCapstones(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({ type: "error", text: normalized.message || "Failed to submit capstone project." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Final Examination & Capstone Project</h1>
          <p className="text-xs text-slate-400 mt-1">Submit your graduation capstone repository for final evaluation.</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${feedback.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
      ) : capstones.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">No capstone projects assigned yet.</div>
      ) : (
        <div className="space-y-4">
          {capstones.map((cap: any) => (
            <div key={cap.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  GRADUATION MILESTONE
                </span>
                <h3 className="text-base font-bold text-white">{cap.title}</h3>
                <p className="text-xs text-slate-300">{cap.description}</p>
              </div>

              <Button onClick={() => setSelectedCapstone(cap)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs h-10 px-4 rounded-xl">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Capstone
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* SUBMIT CAPSTONE MODAL */}
      {selectedCapstone && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Capstone Project</h3>
                <p className="text-xs text-slate-400">{selectedCapstone.title}</p>
              </div>
              <button onClick={() => setSelectedCapstone(null)} className="p-1 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmitCapstone} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Repository URL *</label>
                <input required type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/username/capstone-repo" className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Live Deployment URL (Optional)</label>
                <input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://my-capstone.vercel.app" className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500" />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setSelectedCapstone(null)} className="border-slate-800 text-slate-300 text-xs">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Submit Capstone"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}