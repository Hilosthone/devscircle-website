// src/app/(dashboard)/admin/announcements/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { cohortsApi, notificationsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Mail,
  Send,
  Calendar,
  X,
} from "lucide-react";

export default function AdminAnnouncementsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminAnnouncementsContent />
    </Suspense>
  );
}

function AdminAnnouncementsContent() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Broadcast Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    cohortId: "ALL",
    sendEmail: true,
  });

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annRes, cohortsRes] = await Promise.allSettled([
        notificationsApi.listAnnouncements(),
        cohortsApi.list(),
      ]);

      const list =
        annRes.status === "fulfilled" && Array.isArray(annRes.value)
          ? annRes.value
          : [];
      setAnnouncements(list);

      const cohortList =
        cohortsRes.status === "fulfilled" && Array.isArray(cohortsRes.value)
          ? cohortsRes.value
          : [];
      setCohorts(cohortList);
    } catch {
      setAnnouncements([
        {
          id: "ann-101",
          title: "Welcome to DevsCircle Academy Cohort 1",
          content:
            "Orientation starts this Monday at 18:00 WAT. Ensure your Discord and GitHub accounts are linked.",
          cohortId: "ALL",
          sendEmail: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;

    setIsSending(true);
    setFeedback(null);
    try {
      await notificationsApi.createAnnouncement({
        title: form.title.trim(),
        content: form.message.trim(),
        cohortId: form.cohortId === "ALL" ? undefined : form.cohortId,
        sendEmail: form.sendEmail,
      });

      setShowModal(false);
      setForm({ title: "", message: "", cohortId: "ALL", sendEmail: true });
      setFeedback({
        type: "success",
        text: "Broadcast announcement published successfully!",
      });
      await loadData();
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to publish broadcast announcement.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Announcements & Broadcasts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish platform-wide or cohort-targeted announcements with automated email notification blasts.
          </p>
        </div>

        <Button
          onClick={() => {
            setFeedback(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-5 rounded-xl border-0 shadow-lg shadow-orange-500/20"
        >
          <Megaphone className="h-4 w-4 mr-1.5" /> Broadcast Announcement
        </Button>
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

      {/* ANNOUNCEMENTS LIST */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <Megaphone className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No announcements published</p>
          <p className="text-xs text-slate-400">
            Create your first broadcast announcement using the button above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item: any) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {item.cohortId && item.cohortId !== "ALL"
                      ? "Cohort Targeted"
                      : "Platform-Wide"}
                  </span>
                  {item.sendEmail && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Mail className="h-3 w-3" /> Email Blasted
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "Recently"}
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {item.content || item.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* BROADCAST MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                  Academy Communications
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  New Broadcast Announcement
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Announcement Title *
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Mid-Term Capstone Guidelines Released"
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Target Audience</label>
                <div className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 w-full h-11">
                  <Layers className="h-4 w-4 text-orange-400 shrink-0" />
                  <select
                    value={form.cohortId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, cohortId: e.target.value }))
                    }
                    className="bg-transparent text-xs text-white focus:outline-none w-full"
                  >
                    <option value="ALL" className="bg-slate-950">
                      All Students (Platform-Wide)
                    </option>
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-950">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Message Body *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  placeholder="Type the announcement details here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sendEmail: e.target.checked }))
                  }
                  className="rounded border-slate-800 bg-slate-950 text-orange-500 focus:ring-0 h-4 w-4"
                />
                <span className="text-slate-300">
                  Send automated email notification blast to recipients
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
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
                  disabled={isSending}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />{" "}
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Publish Broadcast
                    </>
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