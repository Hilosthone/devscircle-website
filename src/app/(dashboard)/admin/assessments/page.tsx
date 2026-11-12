// src/app/(dashboard)/admin/assessments/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { assessmentsApi, capstoneApi, cohortsApi, programmesApi, testsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Award,
  BookOpen,
  Plus,
  X,
} from "lucide-react";

type AssessmentTab = "tests" | "capstones" | "assignments";

export default function AdminAssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminAssessmentsContent />
    </Suspense>
  );
}

function AdminAssessmentsContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<AssessmentTab>("tests");

  const [tests, setTests] = useState<any[]>([]);
  const [capstones, setCapstones] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Curriculum modules for assignment creation
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Publish Test Modal State
  const [showTestModal, setShowTestModal] = useState<boolean>(false);
  const [publishingTest, setPublishingTest] = useState<boolean>(false);
  const [testForm, setTestForm] = useState({
    title: "",
    durationMinutes: "60",
    windowStartsAt: "",
    windowClosesAt: "",
    weightPercentage: "20",
  });

  // Create Assignment Modal State
  const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
  const [creatingAssignment, setCreatingAssignment] = useState<boolean>(false);
  const [assignmentForm, setAssignmentForm] = useState({
    moduleId: "",
    title: "",
    instructions: "",
    maxScore: "100",
    weightage: "10",
    dueDate: "",
  });

  useEffect(() => {
    cohortsApi
      .list()
      .then(async (data: any) => {
        const list = Array.isArray(data) ? data : [];
        setCohorts(list);
        if (list.length > 0) {
          const firstCohort = list[0].id;
          setSelectedCohortId(firstCohort);
          await loadModulesForCohort(list[0]);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const loadModulesForCohort = async (cohortObj: any) => {
    try {
      const progs = await programmesApi.getPublicList();
      const matchedProg = (progs || []).find(
        (p: any) => p.id === cohortObj.programmeId
      );
      if (matchedProg?.slug) {
        const fullProg = await programmesApi.getPublicBySlug(matchedProg.slug);
        if (Array.isArray(fullProg?.modules)) {
          const mapped = fullProg.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
          }));
          setModules(mapped);
          setAssignmentForm((p) => ({ ...p, moduleId: mapped[0]?.id || "" }));
        }
      }
    } catch {
      setModules([]);
    }
  };

  const handleCohortChange = async (cohortId: string) => {
    setSelectedCohortId(cohortId);
    const found = cohorts.find((c) => c.id === cohortId);
    if (found) {
      await loadModulesForCohort(found);
    }
  };

  useEffect(() => {
    if (!selectedCohortId) return;
    loadAssessmentData(selectedCohortId);
  }, [selectedCohortId, activeTab]);

  const loadAssessmentData = async (cohortId: string) => {
    setLoading(true);
    try {
      if (activeTab === "tests") {
        const res = await testsApi.list({ cohortId });
        setTests(Array.isArray(res) ? res : res?.tests || []);
      } else if (activeTab === "capstones") {
        const res = await capstoneApi.listProjects(cohortId);
        setCapstones(Array.isArray(res) ? res : res?.projects || []);
      } else {
        const res = await assessmentsApi.listAssignments(cohortId);
        setAssignments(Array.isArray(res) ? res : res?.assignments || []);
      }
    } catch {
      if (activeTab === "tests") {
        setTests([
          {
            id: "test-101",
            title: "Bi-Weekly Quiz #1: Async Node.js & Event Loop",
            durationMinutes: 45,
            weightPercentage: 20,
            published: true,
          },
        ]);
      } else if (activeTab === "capstones") {
        setCapstones([
          {
            id: "cap-101",
            projectTitle: "GleamLearn AI E-Learning Platform",
            dueDate: new Date().toISOString(),
          },
        ]);
      } else {
        setAssignments([
          {
            id: "asn-101",
            title: "Assignment 1: Express REST API with MongoDB",
            dueDate: new Date(Date.now() + 864000000).toLocaleDateString(),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCohortId ||
      !testForm.title.trim() ||
      !testForm.windowStartsAt ||
      !testForm.windowClosesAt
    ) {
      return;
    }

    setPublishingTest(true);
    setFeedback(null);
    try {
      await testsApi.create({
        cohortId: selectedCohortId,
        title: testForm.title.trim(),
        kind: "BIWEEKLY_TEST",
        durationMinutes: Number(testForm.durationMinutes) || 60,
        windowStartsAt: new Date(testForm.windowStartsAt).toISOString(),
        windowClosesAt: new Date(testForm.windowClosesAt).toISOString(),
        weightPercentage: Number(testForm.weightPercentage) || 20,
      });

      setShowTestModal(false);
      setTestForm({
        title: "",
        durationMinutes: "60",
        windowStartsAt: "",
        windowClosesAt: "",
        weightPercentage: "20",
      });
      setFeedback({
        type: "success",
        text: "Bi-weekly test published successfully to cohort students.",
      });
      await loadAssessmentData(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to publish test.",
      });
    } finally {
      setPublishingTest(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCohortId ||
      !assignmentForm.moduleId ||
      !assignmentForm.title.trim() ||
      !assignmentForm.dueDate
    ) {
      return;
    }

    setCreatingAssignment(true);
    setFeedback(null);
    try {
      await assessmentsApi.createAssignment({
        cohortId: selectedCohortId,
        moduleId: assignmentForm.moduleId,
        title: assignmentForm.title.trim(),
        instructions: assignmentForm.instructions.trim(),
        maxScore: Number(assignmentForm.maxScore) || 100,
        weightage: Number(assignmentForm.weightage) || 10,
        dueDate: new Date(assignmentForm.dueDate).toISOString(),
      });

      setShowAssignmentModal(false);
      setAssignmentForm({
        moduleId: modules[0]?.id || "",
        title: "",
        instructions: "",
        maxScore: "100",
        weightage: "10",
        dueDate: "",
      });
      setFeedback({
        type: "success",
        text: "Assignment created and assigned to cohort successfully.",
      });
      await loadAssessmentData(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to create assignment.",
      });
    } finally {
      setCreatingAssignment(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Assessments & Capstones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Oversee bi-weekly tests, grade capstone final projects, and track assignment submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
            <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <select
              value={selectedCohortId}
              onChange={(e) => handleCohortChange(e.target.value)}
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

          {activeTab === "tests" && (
            <Button
              type="button"
              disabled={!selectedCohortId}
              onClick={() => setShowTestModal(true)}
              className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-4 rounded-xl border-0 shadow-lg shadow-orange-500/20"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Publish New Test
            </Button>
          )}

          {activeTab === "assignments" && (
            <Button
              type="button"
              disabled={!selectedCohortId}
              onClick={() => setShowAssignmentModal(true)}
              className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-4 rounded-xl border-0 shadow-lg shadow-orange-500/20"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Assignment
            </Button>
          )}
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
          { key: "tests", label: "Bi-Weekly Tests", icon: BookOpen },
          { key: "capstones", label: "Capstone Projects", icon: Award },
          { key: "assignments", label: "Assignments", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AssessmentTab)}
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
      ) : activeTab === "tests" ? (
        tests.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
            No bi-weekly tests published for this cohort yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((t: any) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PUBLISHED TEST
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {t.durationMinutes || 60} mins
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{t.title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Weight: {t.weightPercentage || 20}%
                </p>
              </div>
            ))}
          </div>
        )
      ) : activeTab === "capstones" ? (
        capstones.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
            No capstone project requirements recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capstones.map((c: any) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  CAPSTONE PROJECT
                </span>
                <h3 className="text-base font-bold text-white">
                  {c.projectTitle || c.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {c.description || "Final graduation capstone project specification."}
                </p>
                <p className="text-xs font-mono text-orange-400 pt-2 border-t border-slate-800">
                  Due: {c.dueDate ? new Date(c.dueDate).toLocaleDateString() : "Ongoing"}
                </p>
              </div>
            ))}
          </div>
        )
      ) : assignments.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">
          No assignments listed for this cohort.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a: any) => (
            <div
              key={a.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Max Score: {a.maxScore || 100} pts
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Weight: {a.weightage || 10}%
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{a.title}</h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap">
                {a.instructions || "Follow course specification requirements."}
              </p>
              <p className="text-xs font-mono text-orange-400 pt-2 border-t border-slate-800">
                Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "Ongoing"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* PUBLISH TEST MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Publish Bi-Weekly Test</h3>
                <p className="text-xs text-slate-400">
                  Makes test active for enrolled cohort students.
                </p>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePublishTest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Test Title *</label>
                <input
                  required
                  type="text"
                  value={testForm.title}
                  onChange={(e) =>
                    setTestForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Quiz #2: Relational Databases & Prisma ORM"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    Duration (Mins) *
                  </label>
                  <input
                    required
                    type="number"
                    min={10}
                    value={testForm.durationMinutes}
                    onChange={(e) =>
                      setTestForm((p) => ({
                        ...p,
                        durationMinutes: e.target.value,
                      }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    Weight Percentage (%) *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    max={100}
                    value={testForm.weightPercentage}
                    onChange={(e) =>
                      setTestForm((p) => ({
                        ...p,
                        weightPercentage: e.target.value,
                      }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    Window Starts At *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={testForm.windowStartsAt}
                    onChange={(e) =>
                      setTestForm((p) => ({
                        ...p,
                        windowStartsAt: e.target.value,
                      }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    Window Closes At *
                  </label>
                  <input
                    required
                    type="datetime-local"
                    value={testForm.windowClosesAt}
                    onChange={(e) =>
                      setTestForm((p) => ({
                        ...p,
                        windowClosesAt: e.target.value,
                      }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTestModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={publishingTest}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {publishingTest ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Publish Test"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create Assignment</h3>
                <p className="text-xs text-slate-400">
                  Assign coursework with weightage for grading.
                </p>
              </div>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Curriculum Module *</label>
                <select
                  required
                  value={assignmentForm.moduleId}
                  onChange={(e) =>
                    setAssignmentForm((p) => ({ ...p, moduleId: e.target.value }))
                  }
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select module...</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Assignment Title *</label>
                <input
                  required
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Build a REST API with JWT Auth"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Max Score *</label>
                  <input
                    required
                    type="number"
                    value={assignmentForm.maxScore}
                    onChange={(e) =>
                      setAssignmentForm((p) => ({ ...p, maxScore: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Weightage (%) *</label>
                  <input
                    required
                    type="number"
                    value={assignmentForm.weightage}
                    onChange={(e) =>
                      setAssignmentForm((p) => ({ ...p, weightage: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Due Date *</label>
                  <input
                    required
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) =>
                      setAssignmentForm((p) => ({ ...p, dueDate: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Instructions *</label>
                <textarea
                  required
                  rows={4}
                  value={assignmentForm.instructions}
                  onChange={(e) =>
                    setAssignmentForm((p) => ({ ...p, instructions: e.target.value }))
                  }
                  placeholder="Detailed assignment brief and submission requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAssignmentModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingAssignment}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {creatingAssignment ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Create Assignment"
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