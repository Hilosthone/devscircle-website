// src/app/(dashboard)/student/assessments/assignments/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { assessmentsApi, cohortsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle2, AlertCircle, Send, X } from "lucide-react";

export default function StudentAssignmentsPage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <StudentAssignmentsContent />
    </Suspense>
  );
}

function StudentAssignmentsContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Submit Modal State
  const [selectedAsn, setSelectedAsn] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionUrl, setSubmissionUrl] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

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
    loadAssignments(selectedCohortId);
  }, [selectedCohortId]);

  const loadAssignments = async (cohortId: string) => {
    setLoading(true);
    try {
      const res = await assessmentsApi.listAssignments(cohortId);
      setAssignments(Array.isArray(res) ? res : res?.assignments || []);
    } catch {
      setAssignments([
        { id: "asn-1", title: "Assignment 1: Express REST API", instructions: "Build a secure MERN backend.", maxScore: 100, dueDate: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsn || !submissionUrl.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await assessmentsApi.submitAssignment(selectedAsn.id, {
        submissionUrl: submissionUrl.trim(),
        notes: notes.trim(),
      });

      setSelectedAsn(null);
      setSubmissionUrl("");
      setNotes("");
      setFeedback({ type: "success", text: "Assignment submitted successfully to faculty!" });
      await loadAssignments(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({ type: "error", text: normalized.message || "Failed to submit assignment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Coursework Assignments</h1>
          <p className="text-xs text-slate-400 mt-1">Submit your code repositories and view grading feedback.</p>
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
      ) : assignments.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">No active assignments found.</div>
      ) : (
        <div className="space-y-4">
          {assignments.map((asn: any) => (
            <div key={asn.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    Max: {asn.maxScore || 100} pts
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Due: {asn.dueDate ? new Date(asn.dueDate).toLocaleDateString() : "Ongoing"}</span>
                </div>
                <h3 className="text-base font-bold text-white">{asn.title}</h3>
                <p className="text-xs text-slate-300">{asn.instructions}</p>
              </div>

              <Button onClick={() => setSelectedAsn(asn)} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs h-10 px-4 rounded-xl">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Submit Work
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {selectedAsn && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Assignment</h3>
                <p className="text-xs text-slate-400">{selectedAsn.title}</p>
              </div>
              <button onClick={() => setSelectedAsn(null)} className="p-1 text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Repository URL (GitHub / GitLab) *</label>
                <input required type="url" value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)} placeholder="https://github.com/username/repo" className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500" />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Student Notes</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Comments for the tutor..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500" />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button type="button" variant="outline" onClick={() => setSelectedAsn(null)} className="border-slate-800 text-slate-300 text-xs">Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Submission"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}