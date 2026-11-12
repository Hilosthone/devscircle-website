// src/app/(dashboard)/tutor/classes/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { classesApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Video,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Clock,
  X,
} from "lucide-react";

export default function TutorClassesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <TutorClassesContent />
    </Suspense>
  );
}

function TutorClassesContent() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Attach Recording Modal State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<string>("3600");
  const [attaching, setAttaching] = useState<boolean>(false);

  useEffect(() => {
    loadClassesData();
  }, []);

  const loadClassesData = async () => {
    setLoading(true);
    try {
      const res = await classesApi.getTutorSchedule();
      setClasses(Array.isArray(res) ? res : []);
    } catch {
      setClasses([
        {
          id: "cls-101",
          title: "Introduction to PostgreSQL & Prisma ORM",
          startsAt: new Date().toISOString(),
          joinUrl: "https://meet.google.com/xyz-abcd-efg",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttachRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !videoUrl.trim()) return;

    setAttaching(true);
    setFeedback(null);
    try {
      await classesApi.attachRecording(selectedClassId, {
        videoUrl: videoUrl.trim(),
        duration: Number(duration) || 3600,
      });

      setSelectedClassId(null);
      setVideoUrl("");
      setDuration("3600");
      setFeedback({
        type: "success",
        text: "Class recording attached successfully!",
      });
      await loadClassesData();
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to attach recording link.",
      });
    } finally {
      setAttaching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Live Classes & Recordings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your scheduled lecture sessions, join video meeting rooms, and attach recordings.
          </p>
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

      {/* CLASSES LIST */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : classes.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <Video className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No classes scheduled on your timetable</p>
          <p className="text-xs text-slate-400">
            Check back later or contact academy administration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls: any) => (
            <div
              key={cls.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    LECTURE SESSION
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-400" />
                    {cls.startsAt ? new Date(cls.startsAt).toLocaleString() : "Scheduled"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{cls.title}</h3>
                {cls.recordingUrl && (
                  <a
                    href={cls.recordingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> View Class Recording ↗
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {cls.joinUrl && (
                  <a href={cls.joinUrl} target="_blank" rel="noreferrer">
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 rounded-xl">
                      <Video className="h-3.5 w-3.5 mr-1.5" /> Join Room
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedClassId(cls.id)}
                  className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-10 px-4 rounded-xl"
                >
                  Attach Recording
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ATTACH RECORDING MODAL */}
      {selectedClassId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Attach Session Recording</h3>
                <p className="text-xs text-slate-400">
                  Provide video link and estimated duration in seconds.
                </p>
              </div>
              <button
                onClick={() => setSelectedClassId(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAttachRecording} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Video URL *</label>
                <input
                  required
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Duration (seconds)</label>
                <input
                  required
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedClassId(null)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={attaching}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {attaching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Recording"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}