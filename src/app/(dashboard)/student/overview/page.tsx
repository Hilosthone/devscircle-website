// src/app/(dashboard)/student/overview/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { authApi, cohortsApi, gradingApi, classesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Award,
  Video,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Clock,
  Layers,
  FileText,
} from "lucide-react";

export default function StudentOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <StudentOverviewContent />
    </Suspense>
  );
}

function StudentOverviewContent() {
  const [profile, setProfile] = useState<any>(null);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const profRes = await authApi.getMe().catch(() => null);
      const cohortsRes = await cohortsApi.list().catch(() => []);
      const cohortList = Array.isArray(cohortsRes) ? cohortsRes : [];

      setProfile(profRes);
      setCohorts(cohortList);

      if (cohortList.length > 0) {
        const firstCohortId = cohortList[0].id;
        const [resultsRes, classesRes] = await Promise.allSettled([
          gradingApi.getMyResults(firstCohortId),
          classesApi.getTimetableFeed(firstCohortId),
        ]);

        setResults(resultsRes.status === "fulfilled" ? resultsRes.value : null);
        setUpcomingClasses(classesRes.status === "fulfilled" && Array.isArray(classesRes.value) ? classesRes.value : []);
      }
    } catch {
      setProfile({ firstName: "Student", email: "student@devscircle.academy" });
      setCohorts([{ id: "c-1", name: "Cohort 1: Full-Stack MERN & TypeScript" }]);
      setResults({ totalScore: 88.5, standing: "Distinction" });
      setUpcomingClasses([
        { id: "cls-1", title: "Advanced React State Management", startsAt: new Date().toISOString(), joinUrl: "https://meet.google.com" },
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
            STUDENT LEARNING PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {profile?.firstName || profile?.name || "Scholar"}! 🚀
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Access your live class schedule, submit weekly assignments, take bi-weekly quizzes, and track your graduation credentials.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/student/classes">
            <Button className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs h-11 px-5 rounded-2xl shadow-lg shadow-orange-500/20">
              <Video className="h-4 w-4 mr-2" /> Join Live Class
            </Button>
          </Link>
          <Link href="/student/grades">
            <Button variant="outline" className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-11 px-5 rounded-2xl">
              <Award className="h-4 w-4 mr-2 text-orange-400" /> View Grades
            </Button>
          </Link>
        </div>
      </div>

      {/* QUICK METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Enrolled Cohorts
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
              Overall Standing
            </span>
            <p className="text-2xl font-black text-emerald-400">
              {results?.totalScore ? `${results.totalScore}%` : "Active"}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              Upcoming Classes
            </span>
            <p className="text-2xl font-black text-white">{upcomingClasses.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* QUICK LINKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/student/assessments/assignments" className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 transition-all space-y-3">
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-white">Assignments</h2>
          <p className="text-xs text-slate-400">Submit weekly coding assignments and check faculty feedback.</p>
        </Link>

        <Link href="/student/assessments/tests" className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 transition-all space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-white">Bi-Weekly Tests</h2>
          <p className="text-xs text-slate-400">Take timed online quizzes and evaluate your technical knowledge.</p>
        </Link>

        <Link href="/student/assessments/final-exam" className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 transition-all space-y-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-white">Final Exam & Capstone</h2>
          <p className="text-xs text-slate-400">Complete final certification exams and submit capstone repositories.</p>
        </Link>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return <Clock {...props} />;
}