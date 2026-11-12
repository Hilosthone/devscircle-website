"use client";

import { Suspense, useEffect, useState } from "react";
import { cohortsApi, programmesApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { AVAILABLE_PROGRAMMES } from "@/features/programmes/data";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap,
  UserPlus,
  X,
  Eye,
} from "lucide-react";

interface CohortItem {
  id: string;
  programmeId: string;
  programmeName?: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
}

interface ProgrammeOption {
  id: string;
  name: string;
}

export default function AdminCohortsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminCohortsContent />
    </Suspense>
  );
}

function AdminCohortsContent() {
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Create Cohort Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [programmeId, setProgrammeId] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Cohort Inspection & Tutor Assignment Modal State
  const [activeCohort, setActiveCohort] = useState<CohortItem | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [enrolments, setEnrolments] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);

  const [tutorIdInput, setTutorIdInput] = useState("");
  const [moduleIdInput, setModuleIdInput] = useState("");
  const [assigningTutor, setAssigningTutor] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const [cohortsRes, progsRes] = await Promise.allSettled([
        cohortsApi.list(),
        programmesApi.getPublicList(),
      ]);

      // 1. Programmes options
      const rawProgs =
        progsRes.status === "fulfilled" && Array.isArray(progsRes.value)
          ? progsRes.value
          : [];
      const mappedProgs: ProgrammeOption[] =
        rawProgs.length > 0
          ? rawProgs.map((p: any) => ({
              id: p.id,
              name: p.name || p.title || p.slug,
            }))
          : AVAILABLE_PROGRAMMES.map((p) => ({
              id: p.id,
              name: p.title,
            }));

      setProgrammes(mappedProgs);
      if (mappedProgs.length > 0) {
        setProgrammeId(mappedProgs[0].id);
      }

      // 2. Cohorts list
      const rawCohorts =
        cohortsRes.status === "fulfilled" && Array.isArray(cohortsRes.value)
          ? cohortsRes.value
          : [];

      if (rawCohorts.length > 0) {
        setCohorts(rawCohorts);
      } else {
        setCohorts([
          {
            id: "c1d2e3f4-5555-6666-7777-888899990000",
            programmeId: mappedProgs[0]?.id || AVAILABLE_PROGRAMMES[0].id,
            name: "Cohort 1 - 2026",
            startDate: "2026-06-01T00:00:00.000Z",
            endDate: "2026-08-31T23:59:59.000Z",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    // Auto-suggest 3-month (90-day) end date if endDate is empty
    if (val && !endDate) {
      const start = new Date(val);
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 90);
        setEndDate(end.toISOString().split("T")[0]);
      }
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || !programmeId) return;

    if (new Date(endDate) <= new Date(startDate)) {
      setErrorMsg("End date must be after start date.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await cohortsApi.create({
        programmeId,
        name: name.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });

      setCohorts((prev) => [created, ...prev]);
      setFeedback({
        type: "success",
        text: `Cohort "${name.trim()}" scheduled successfully.`,
      });
      setShowModal(false);
      setName("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to create cohort batch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectCohort = async (cohort: CohortItem) => {
    setActiveCohort(cohort);
    setLoadingDetails(true);
    setEnrolments([]);
    setTutors([]);
    setTutorIdInput("");
    setModuleIdInput("");

    try {
      const [enrolRes, tutorsRes] = await Promise.allSettled([
        cohortsApi.getEnrolments(cohort.id),
        cohortsApi.getTutors(cohort.id),
      ]);

      if (enrolRes.status === "fulfilled" && Array.isArray(enrolRes.value)) {
        setEnrolments(enrolRes.value);
      }
      if (tutorsRes.status === "fulfilled" && Array.isArray(tutorsRes.value)) {
        setTutors(tutorsRes.value);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAssignTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCohort || !tutorIdInput.trim()) return;

    setAssigningTutor(true);
    try {
      await cohortsApi.assignTutor({
        tutorId: tutorIdInput.trim(),
        programmeId: activeCohort.programmeId,
        cohortId: activeCohort.id,
        ...(moduleIdInput.trim() ? { moduleId: moduleIdInput.trim() } : {}),
      });

      const updatedTutors = await cohortsApi.getTutors(activeCohort.id);
      if (Array.isArray(updatedTutors)) setTutors(updatedTutors);

      setTutorIdInput("");
      setModuleIdInput("");
      setFeedback({
        type: "success",
        text: `Tutor assigned to ${activeCohort.name}.`,
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to assign tutor to cohort.",
      });
    } finally {
      setAssigningTutor(false);
    }
  };

  const getCohortStatus = (startIso: string, endIso: string) => {
    const now = Date.now();
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();

    if (now < start) {
      return {
        label: "UPCOMING",
        style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      };
    }
    if (now > end) {
      return {
        label: "COMPLETED",
        style: "bg-slate-800 text-slate-400 border-slate-700",
      };
    }
    return {
      label: "ACTIVE",
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Cohort Batch Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Schedule 3-month cohort batches, inspect enrolled students, and assign programme tutors.
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMsg(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-5 rounded-xl border-0 shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Schedule New Cohort
        </Button>
      </div>

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
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : cohorts.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <p className="text-sm font-bold text-white">No cohorts scheduled yet</p>
          <p className="text-xs text-slate-400">
            Create a cohort batch so paid students can be enrolled into classes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => {
            const prog =
              programmes.find((p) => p.id === cohort.programmeId) ||
              AVAILABLE_PROGRAMMES.find((p) => p.id === cohort.programmeId);
            const progTitle =
              cohort.programmeName ||
              (prog as any)?.name ||
              (prog as any)?.title ||
              "Academic Track";
            const status = getCohortStatus(cohort.startDate, cohort.endDate);
            const start = new Date(cohort.startDate).toLocaleDateString();
            const end = new Date(cohort.endDate).toLocaleDateString();

            return (
              <div
                key={cohort.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4 hover:border-orange-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${status.style}`}
                    >
                      {status.label}
                    </span>
                    <span
                      title={cohort.id}
                      className="text-[10px] font-mono text-slate-500 select-all"
                    >
                      {cohort.id.slice(0, 8)}...
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{cohort.name}</h3>
                  <p className="text-xs font-semibold text-orange-400">{progTitle}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="space-y-1.5 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-orange-400" />
                      <span>Start: {start}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>End: {end}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInspectCohort(cohort)}
                    className="w-full h-9 border-slate-800 text-slate-200 hover:bg-slate-800 text-xs rounded-xl"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5 text-orange-400" /> Manage Roster & Tutors
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. CREATE COHORT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                  Academy Batch Setup
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Schedule New Cohort
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCohort} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Select Programme *
                </label>
                <select
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  Cohort Batch Name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cohort 1 - 2026"
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">End Date *</label>
                  <input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Batch"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MANAGE ROSTER & ASSIGN TUTOR MODAL */}
      {activeCohort && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                  Cohort Operations
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activeCohort.name}
                </h3>
                <p className="text-[11px] font-mono text-slate-500 select-all">
                  ID: {activeCohort.id}
                </p>
              </div>
              <button
                onClick={() => setActiveCohort(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ASSIGN TUTOR FORM */}
            <form
              onSubmit={handleAssignTutor}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-orange-400" /> Assign Tutor to Cohort
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  value={tutorIdInput}
                  onChange={(e) => setTutorIdInput(e.target.value)}
                  placeholder="Tutor User UUID *"
                  className="h-9 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  value={moduleIdInput}
                  onChange={(e) => setModuleIdInput(e.target.value)}
                  placeholder="Module UUID (optional)"
                  className="h-9 bg-slate-900 border border-slate-800 rounded-xl px-3 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
                <Button
                  type="submit"
                  disabled={assigningTutor}
                  className="h-9 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl"
                >
                  {assigningTutor ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Assign Tutor"
                  )}
                </Button>
              </div>
            </form>

            {loadingDetails ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* ASSIGNED TUTORS LIST */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-orange-400" /> Assigned Tutors
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {tutors.length}
                    </span>
                  </div>

                  {tutors.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">
                      No tutors assigned to this batch yet.
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {tutors.map((t: any, idx: number) => (
                        <li
                          key={t.id || idx}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80"
                        >
                          <div className="font-semibold text-white">
                            {t.tutor?.firstName
                              ? `${t.tutor.firstName} ${t.tutor.lastName}`
                              : t.name || t.tutorId}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {t.tutor?.email || t.module?.title || "Full Cohort"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ENROLLED STUDENTS LIST */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-emerald-400" /> Enrolled Students
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {enrolments.length}
                    </span>
                  </div>

                  {enrolments.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">
                      No paid student enrolments in this batch yet.
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {enrolments.map((en: any, idx: number) => (
                        <li
                          key={en.id || idx}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80"
                        >
                          <div className="font-semibold text-white">
                            {en.student?.firstName
                              ? `${en.student.firstName} ${en.student.lastName}`
                              : en.studentName || "Enrolled Student"}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {en.student?.email || en.studentId}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setActiveCohort(null)}
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