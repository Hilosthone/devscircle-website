// src/app/(dashboard)/student/assessments/tests/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { testsApi, cohortsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { BookOpen, Loader2, CheckCircle2, AlertCircle, Play, X } from "lucide-react";

export default function StudentTestsPage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <StudentTestsContent />
    </Suspense>
  );
}

function StudentTestsContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Test Attempt State
  const [activeAttempt, setActiveAttempt] = useState<any | null>(null);
  const [testDetails, setTestDetails] = useState<any | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [starting, setStarting] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    loadTests(selectedCohortId);
  }, [selectedCohortId]);

  const loadTests = async (cohortId: string) => {
    setLoading(true);
    try {
      const res = await testsApi.list({ cohortId, kind: "BIWEEKLY_TEST" });
      setTests(Array.isArray(res) ? res : res?.tests || []);
    } catch {
      setTests([
        { id: "test-1", title: "Bi-Weekly Quiz 1: Node.js & Express", durationMinutes: 45, weightPercentage: 15 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    setStarting(true);
    setFeedback(null);
    try {
      const [testInfo, attempt] = await Promise.all([
        testsApi.getById(testId),
        testsApi.startAttempt(testId),
      ]);
      setTestDetails(testInfo);
      setActiveAttempt(attempt);
      setResponses({});
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({ type: "error", text: normalized.message || "Failed to start test attempt." });
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!activeAttempt?.id) return;
    setSubmitting(true);
    try {
      const formattedResponses = Object.entries(responses).map(([questionId, responseText]) => ({
        questionId,
        responseText,
      }));

      await testsApi.submitAttempt(activeAttempt.id, formattedResponses);
      setActiveAttempt(null);
      setTestDetails(null);
      setFeedback({ type: "success", text: "Test submitted successfully! Score recorded." });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({ type: "error", text: normalized.message || "Failed to submit test attempt." });
    } finally {
      setSubmitting(false);
    }
  };

  if (activeAttempt && testDetails) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{testDetails.title}</h1>
            <p className="text-xs text-orange-400 font-mono mt-1">Duration: {testDetails.durationMinutes} minutes</p>
          </div>
          <Button onClick={handleSubmitAttempt} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Finish & Submit"}
          </Button>
        </div>

        <div className="space-y-4">
          {testDetails.questions?.map((q: any, idx: number) => (
            <div key={q.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Q{idx + 1}. {q.text}</h3>
              <textarea
                rows={3}
                value={responses[q.id] || ""}
                onChange={(e) => setResponses((p) => ({ ...p, [q.id]: e.target.value }))}
                placeholder="Type your answer here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Bi-Weekly Online Tests</h1>
          <p className="text-xs text-slate-400 mt-1">Take scheduled quizzes and evaluate your mastery.</p>
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
      ) : tests.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">No active bi-weekly tests found.</div>
      ) : (
        <div className="space-y-4">
          {tests.map((t: any) => (
            <div key={t.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Weight: {t.weightPercentage}%
                </span>
                <h3 className="text-base font-bold text-white">{t.title}</h3>
                <p className="text-xs font-mono text-slate-400">Duration: {t.durationMinutes || 60} minutes</p>
              </div>

              <Button onClick={() => handleStartTest(t.id)} disabled={starting} className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs h-10 px-4 rounded-xl">
                {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Play className="h-3.5 w-3.5 mr-1.5" /> Start Test</>}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}