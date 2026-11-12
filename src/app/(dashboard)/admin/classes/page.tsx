// src/app/(dashboard)/admin/classes/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { classesApi, cohortsApi, programmesApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Video,
  Trash2,
  Layers,
  MapPin,
  ExternalLink,
  Film,
  X,
} from "lucide-react";

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export default function AdminClassesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminClassesContent />
    </Suspense>
  );
}

function AdminClassesContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");

  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);
  const [tutors, setTutors] = useState<Array<{ id: string; name: string }>>([]);

  const [timetableSlots, setTimetableSlots] = useState<any[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Create Weekly Timetable Slot Modal
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    moduleId: "",
    tutorId: "",
    dayOfWeek: "MONDAY",
    startTime: "18:00",
    endTime: "20:00",
    venue: "Google Meet / Live Stream",
  });

  // Schedule Live Class Session Modal
  const [showClassModal, setShowClassModal] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [classForm, setClassForm] = useState({
    moduleId: "",
    tutorId: "",
    timetableSlotId: "",
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    joinUrl: "",
  });

  // Attach Recording Modal
  const [recordingTarget, setRecordingTarget] = useState<any | null>(null);
  const [recordingForm, setRecordingForm] = useState({
    videoUrl: "",
    duration: "90",
  });
  const [attachingRecording, setAttachingRecording] = useState(false);

  // 1. Load cohorts on mount
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

  // 2. Load cohort timetable grid, live classes, assigned tutors, and programme modules
  useEffect(() => {
    if (!selectedCohortId) return;
    loadCohortScheduleData(selectedCohortId);
  }, [selectedCohortId]);

  const loadCohortScheduleData = async (cohortId: string) => {
    setLoading(true);
    try {
      const [gridRes, feedRes, tutorsRes, progsRes] = await Promise.allSettled([
        classesApi.getTimetableGrid(cohortId),
        classesApi.getTimetableFeed(cohortId),
        cohortsApi.getTutors(cohortId),
        programmesApi.getPublicList(),
      ]);

      // Timetable slots
      const rawGrid = gridRes.status === "fulfilled" ? gridRes.value : [];
      const slots = Array.isArray(rawGrid)
        ? rawGrid
        : Array.isArray(rawGrid?.slots)
        ? rawGrid.slots
        : [];
      setTimetableSlots(slots);

      // Scheduled live classes
      const rawFeed = feedRes.status === "fulfilled" ? feedRes.value : [];
      const classesList = Array.isArray(rawFeed)
        ? rawFeed
        : Array.isArray(rawFeed?.classes)
        ? rawFeed.classes
        : [];
      setScheduledClasses(classesList);

      // Tutors assigned to this cohort
      const rawTutors =
        tutorsRes.status === "fulfilled" && Array.isArray(tutorsRes.value)
          ? tutorsRes.value
          : [];
      const mappedTutors = rawTutors.map((t: any) => ({
        id: t.tutorId || t.tutor?.id || t.id,
        name:
          `${t.tutor?.firstName || ""} ${t.tutor?.lastName || ""}`.trim() ||
          t.name ||
          t.tutorId,
      }));
      setTutors(mappedTutors);

      // Modules for this cohort's programme
      const currentCohort = cohorts.find((c) => c.id === cohortId);
      const rawProgs =
        progsRes.status === "fulfilled" && Array.isArray(progsRes.value)
          ? progsRes.value
          : [];
      const matchedProg = rawProgs.find(
        (p: any) => p.id === currentCohort?.programmeId
      );

      let mappedModules: Array<{ id: string; title: string }> = [];
      if (matchedProg?.slug) {
        const fullProg = await programmesApi.getPublicBySlug(matchedProg.slug);
        if (Array.isArray(fullProg?.modules)) {
          mappedModules = fullProg.modules.map((m: any) => ({
            id: m.id,
            title: m.title,
          }));
        }
      }
      setModules(mappedModules);

      // Default form selections
      setSlotForm((prev) => ({
        ...prev,
        moduleId: mappedModules[0]?.id || "",
        tutorId: mappedTutors[0]?.id || "",
      }));
      setClassForm((prev) => ({
        ...prev,
        moduleId: mappedModules[0]?.id || "",
        tutorId: mappedTutors[0]?.id || "",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohortId || !slotForm.moduleId || !slotForm.tutorId) return;

    setSavingSlot(true);
    setFeedback(null);
    try {
      await classesApi.createTimetableSlot({
        cohortId: selectedCohortId,
        moduleId: slotForm.moduleId,
        tutorId: slotForm.tutorId,
        dayOfWeek: slotForm.dayOfWeek,
        startTime: slotForm.startTime,
        endTime: slotForm.endTime,
        ...(slotForm.venue.trim() ? { venue: slotForm.venue.trim() } : {}),
      });

      setShowSlotModal(false);
      setFeedback({
        type: "success",
        text: `Weekly ${slotForm.dayOfWeek} timetable slot created.`,
      });
      await loadCohortScheduleData(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to create timetable slot.",
      });
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await classesApi.deleteTimetableSlot(slotId);
      setTimetableSlots((prev) => prev.filter((s) => s.id !== slotId));
      setFeedback({ type: "success", text: "Timetable slot removed." });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to delete timetable slot.",
      });
    }
  };

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCohortId ||
      !classForm.moduleId ||
      !classForm.tutorId ||
      !classForm.title.trim() ||
      !classForm.startsAt ||
      !classForm.endsAt
    ) {
      return;
    }

    setSavingClass(true);
    setFeedback(null);
    try {
      await classesApi.scheduleClass({
        cohortId: selectedCohortId,
        moduleId: classForm.moduleId,
        tutorId: classForm.tutorId,
        ...(classForm.timetableSlotId
          ? { timetableSlotId: classForm.timetableSlotId }
          : {}),
        title: classForm.title.trim(),
        ...(classForm.description.trim()
          ? { description: classForm.description.trim() }
          : {}),
        startsAt: new Date(classForm.startsAt).toISOString(),
        endsAt: new Date(classForm.endsAt).toISOString(),
        ...(classForm.joinUrl.trim() ? { joinUrl: classForm.joinUrl.trim() } : {}),
      });

      setShowClassModal(false);
      setClassForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        startsAt: "",
        endsAt: "",
        joinUrl: "",
      }));
      setFeedback({
        type: "success",
        text: "Live class session scheduled and published to cohort timetable.",
      });
      await loadCohortScheduleData(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to schedule live class.",
      });
    } finally {
      setSavingClass(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await classesApi.deleteClass(classId);
      setScheduledClasses((prev) => prev.filter((c) => c.id !== classId));
      setFeedback({ type: "success", text: "Class session cancelled." });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to delete class session.",
      });
    }
  };

  const handleAttachRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingTarget || !recordingForm.videoUrl.trim()) return;

    setAttachingRecording(true);
    try {
      await classesApi.attachRecording(recordingTarget.id, {
        videoUrl: recordingForm.videoUrl.trim(),
        duration: Number(recordingForm.duration) || 60,
      });

      setRecordingTarget(null);
      setRecordingForm({ videoUrl: "", duration: "90" });
      setFeedback({
        type: "success",
        text: "Session recording attached and made available to students.",
      });
      await loadCohortScheduleData(selectedCohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to attach session recording.",
      });
    } finally {
      setAttachingRecording(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Timetable & Live Classes
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure recurring weekly cohort schedules, publish live meeting links, and attach session replays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* COHORT SELECTOR */}
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
            variant="outline"
            disabled={!selectedCohortId}
            onClick={() => setShowSlotModal(true)}
            className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-10 px-4 rounded-xl"
          >
            <Clock className="h-3.5 w-3.5 mr-1.5 text-orange-400" /> Add Weekly Slot
          </Button>

          <Button
            type="button"
            disabled={!selectedCohortId}
            onClick={() => setShowClassModal(true)}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-4 rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Schedule Live Class
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
      ) : (
        <>
          {/* SECTION 1: RECURRING WEEKLY TIMETABLE GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" /> Weekly Recurring
                Timetable Slots
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {timetableSlots.length} active slots
              </span>
            </div>

            {timetableSlots.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-500">
                No weekly timetable slots configured for this cohort yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timetableSlots.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {slot.dayOfWeek}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete slot"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-white">
                        {slot.module?.title || "Module Session"}
                      </h3>
                      <p className="text-xs font-mono text-slate-300">
                        {slot.startTime} — {slot.endTime}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{slot.venue || "Online Live Classroom"}</span>
                      </div>
                      {slot.tutor && (
                        <div className="font-mono text-slate-500">
                          Tutor: {slot.tutor.firstName} {slot.tutor.lastName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: SCHEDULED LIVE CLASSES & RECORDINGS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-emerald-400" /> Scheduled Live
                Sessions
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {scheduledClasses.length} sessions
              </span>
            </div>

            {scheduledClasses.length === 0 ? (
              <div className="p-10 rounded-2xl border border-slate-800 bg-slate-900/40 text-center text-xs text-slate-500">
                No live class sessions scheduled yet. Click &ldquo;Schedule Live Class&rdquo; to publish one.
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-4">Class Topic</th>
                      <th className="p-4">Schedule Window</th>
                      <th className="p-4">Meeting / Replay</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {scheduledClasses.map((cls: any) => (
                      <tr key={cls.id} className="hover:bg-slate-900/80">
                        <td className="p-4">
                          <div className="font-bold text-white">{cls.title}</div>
                          <div className="text-[11px] text-orange-400 font-mono">
                            {cls.module?.title || "Cohort Session"}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-300">
                          <div>{new Date(cls.startsAt).toLocaleDateString()}</div>
                          <div className="text-slate-500">
                            {new Date(cls.startsAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            –{" "}
                            {new Date(cls.endsAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="p-4 space-y-1">
                          {cls.joinUrl ? (
                            <a
                              href={cls.joinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                            >
                              Join Link <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              No link attached
                            </span>
                          )}
                          {cls.recordings?.length > 0 && (
                            <div className="text-[10px] font-mono text-blue-400">
                              {cls.recordings.length} replay attached
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRecordingTarget(cls);
                              setRecordingForm({ videoUrl: "", duration: "90" });
                            }}
                            className="border-slate-800 text-blue-400 hover:bg-blue-500/10 text-[11px] h-8 px-2.5"
                          >
                            <Film className="h-3.5 w-3.5 mr-1" /> Attach Replay
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClass(cls.id)}
                            className="text-slate-400 hover:text-red-400 h-8 px-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL 1: CREATE WEEKLY TIMETABLE SLOT */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Add Weekly Timetable Slot
                </h3>
                <p className="text-xs text-slate-400">
                  Define recurring weekly class hours for this cohort.
                </p>
              </div>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Module *</label>
                <select
                  required
                  value={slotForm.moduleId}
                  onChange={(e) =>
                    setSlotForm((p) => ({ ...p, moduleId: e.target.value }))
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
                <label className="text-slate-300 font-medium">Assigned Tutor *</label>
                <select
                  required
                  value={slotForm.tutorId}
                  onChange={(e) =>
                    setSlotForm((p) => ({ ...p, tutorId: e.target.value }))
                  }
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select tutor...</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Day *</label>
                  <select
                    value={slotForm.dayOfWeek}
                    onChange={(e) =>
                      setSlotForm((p) => ({ ...p, dayOfWeek: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-white focus:outline-none focus:border-orange-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Start *</label>
                  <input
                    required
                    type="time"
                    value={slotForm.startTime}
                    onChange={(e) =>
                      setSlotForm((p) => ({ ...p, startTime: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">End *</label>
                  <input
                    required
                    type="time"
                    value={slotForm.endTime}
                    onChange={(e) =>
                      setSlotForm((p) => ({ ...p, endTime: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Venue / Platform</label>
                <input
                  type="text"
                  value={slotForm.venue}
                  onChange={(e) =>
                    setSlotForm((p) => ({ ...p, venue: e.target.value }))
                  }
                  placeholder="e.g. Google Meet / Zoom Live"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSlotModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingSlot}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {savingSlot ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save Slot"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE LIVE CLASS SESSION */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Schedule Live Class Session
                </h3>
                <p className="text-xs text-slate-400">
                  Creates an attendance-tracked live session on student & tutor feeds.
                </p>
              </div>
              <button
                onClick={() => setShowClassModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleClass} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Class Topic *</label>
                <input
                  required
                  type="text"
                  value={classForm.title}
                  onChange={(e) =>
                    setClassForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Week 2: REST APIs & Middleware Architecture"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Module *</label>
                  <select
                    required
                    value={classForm.moduleId}
                    onChange={(e) =>
                      setClassForm((p) => ({ ...p, moduleId: e.target.value }))
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
                  <label className="text-slate-300 font-medium">Tutor *</label>
                  <select
                    required
                    value={classForm.tutorId}
                    onChange={(e) =>
                      setClassForm((p) => ({ ...p, tutorId: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select tutor...</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Starts At *</label>
                  <input
                    required
                    type="datetime-local"
                    value={classForm.startsAt}
                    onChange={(e) =>
                      setClassForm((p) => ({ ...p, startsAt: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Ends At *</label>
                  <input
                    required
                    type="datetime-local"
                    value={classForm.endsAt}
                    onChange={(e) =>
                      setClassForm((p) => ({ ...p, endsAt: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Live Join URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  value={classForm.joinUrl}
                  onChange={(e) =>
                    setClassForm((p) => ({ ...p, joinUrl: e.target.value }))
                  }
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowClassModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingClass}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {savingClass ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Publish Live Class"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ATTACH RECORDING */}
      {recordingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Attach Session Replay
                </h3>
                <p className="text-xs text-slate-400">{recordingTarget.title}</p>
              </div>
              <button
                onClick={() => setRecordingTarget(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAttachRecording} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Recording Video URL *
                </label>
                <input
                  required
                  type="url"
                  value={recordingForm.videoUrl}
                  onChange={(e) =>
                    setRecordingForm((p) => ({ ...p, videoUrl: e.target.value }))
                  }
                  placeholder="https://youtube.com/watch?v=... or Vimeo/Drive link"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Duration (Minutes) *
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  value={recordingForm.duration}
                  onChange={(e) =>
                    setRecordingForm((p) => ({ ...p, duration: e.target.value }))
                  }
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecordingTarget(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={attachingRecording}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  {attachingRecording ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save Recording"
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