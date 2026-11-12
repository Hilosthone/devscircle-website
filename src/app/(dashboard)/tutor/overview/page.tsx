// src/app/(dashboard)/tutor/overview/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { classesApi, cohortsApi, authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Calendar,
  Video,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Clock,
  Layers,
} from "lucide-react";

export default function TutorOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <TutorOverviewContent />
    </Suspense>
  );
}

function TutorOverviewContent() {
  const [profile, setProfile] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTutorData();
  }, []);

  const loadTutorData = async () => {
    setLoading(true);
    try {
      const [profRes, cohortsRes, scheduleRes] = await Promise.allSettled([
        authApi.getMe(),
        cohortsApi.list(),
        classesApi.getTutorSchedule(),
      ]);

      setProfile(profRes.status === "fulfilled" ? profRes.value : null);
      
      const cohortList =
        cohortsRes.status === "fulfilled" && Array.isArray(cohortsRes.value)
          ? cohortsRes.value
          : [];
      setCohorts(cohortList);

      const classList =
        scheduleRes.status === "fulfilled" && Array.isArray(scheduleRes.value)
          ? scheduleRes.value
          : [];
      setUpcomingClasses(classList);
    } catch {
      setProfile({ firstName: "Instructor", email: "tutor@devscircle.academy" });
      setCohorts([
        { id: "c-1", name: "Cohort 1: Full-Stack MERN & TypeScript", status: "ACTIVE" },
      ]);
      setUpcomingClasses([
        {
          id: "cls-1",
          title: "Advanced React State Management & Custom Hooks",
          startsAt: new Date(Date.now() + 86400000).toISOString(),
          joinUrl: "https://meet.google.com/abc-defg-hij",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* WELCOME BANNER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-transparent border border-orange-500/20 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
            TUTOR FACULTY PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {profile?.firstName || profile?.name || "Tutor"}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your live classes, take attendance, and evaluate student submissions from your faculty workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/tutor/attendance">
            <Button className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs h-11 px-5 rounded-2xl shadow-lg shadow-orange-500/20">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Take Attendance
            </Button>
          </Link>
          <Link href="/tutor/classes">
            <Button variant="outline" className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-11 px-5 rounded-2xl">
              <Video className="h-4 w-4 mr-2 text-orange-400" /> Live Classes
            </Button>
          </Link>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Assigned Cohorts
            </span>
            <p className="text-2xl font-black text-white">{cohorts.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              My Schedule
            </span>
            <p className="text-2xl font-black text-white">{upcomingClasses.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Faculty Status
            </span>
            <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Active & Verified
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* RECENT COHORTS & CLASSES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSIGNED COHORTS */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-400" /> Active Teaching Cohorts
            </h2>
            <Link href="/tutor/attendance" className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {cohorts.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mt-1 inline-block">
                    {c.status || "ACTIVE"}
                  </span>
                </div>
                <Link href="/tutor/attendance">
                  <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs">
                    Mark Attendance
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING SCHEDULED CLASSES */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" /> My Upcoming Sessions
            </h2>
            <Link href="/tutor/classes" className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1">
              Manage Classes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingClasses.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No upcoming classes scheduled.</p>
            ) : (
              upcomingClasses.map((cls) => (
                <div key={cls.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-orange-400" />
                      {cls.startsAt ? new Date(cls.startsAt).toLocaleString() : "Soon"}
                    </span>
                    {cls.joinUrl && (
                      <a
                        href={cls.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20"
                      >
                        Join Room ↗
                      </a>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-white">{cls.title}</h3>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}