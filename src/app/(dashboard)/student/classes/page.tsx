// "use client";

// import { useEffect, useState } from "react";
// import { apiClient } from "@/lib/api-client";
// import { Button } from "@/components/ui/button";
// import { Video, PlayCircle, Clock, BookOpen, AlertCircle } from "lucide-react";

// interface ClassSession {
//   id: string;
//   title: string;
//   description: string;
//   startsAt: string;
//   endsAt: string;
//   joinUrl?: string;
//   recordingUrl?: string;
// }

// export default function StudentClassroomPage() {
//   const [sessions, setSessions] = useState<ClassSession[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     // Fetch active cohort timetable feed
//     apiClient
//       .get("/classes/timetable")
//       .then((res) => setSessions(res.data))
//       .catch(() => {
//         // Fallback demo data matching backend schema
//         setSessions([
//           {
//             id: "class-1",
//             title: "Building RESTful APIs with Express & TypeScript",
//             description: "Middleware pipelines, controller separation, and Zod validation.",
//             startsAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 mins from now
//             endsAt: new Date(Date.now() + 1000 * 60 * 130).toISOString(),
//             joinUrl: "https://meet.google.com/abc-defg-hij",
//           },
//           {
//             id: "class-2",
//             title: "Database Indexing & PostgreSQL Optimization",
//             description: "B-Tree indexes, query execution plans, and Prisma ORM optimization.",
//             startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
//             endsAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
//             recordingUrl: "https://res.cloudinary.com/devscircle/video/upload/v123456/class-01.mp4",
//           },
//         ]);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <div className="space-y-8 max-w-6xl mx-auto">
//       <div>
//         <h1 className="text-2xl font-black text-white">Live Classroom & Lectures</h1>
//         <p className="text-xs text-slate-400 mt-1">
//           Join live Google Meet sessions and watch previous class recordings.
//         </p>
//       </div>

//       <div className="space-y-4">
//         {sessions.map((session) => {
//           const startTime = new Date(session.startsAt);
//           const now = new Date();
//           const diffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);

//           // Join URL is visible if within 15 minutes of start time
//           const canJoin = diffMinutes <= 15 && diffMinutes >= -120;

//           return (
//             <div
//               key={session.id}
//               className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-orange-500/30 transition-all"
//             >
//               <div className="space-y-2 max-w-2xl">
//                 <div className="flex items-center gap-2">
//                   <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
//                     Cohort Session
//                   </span>
//                   <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
//                     <Clock className="h-3 w-3 text-slate-400" />
//                     {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </span>
//                 </div>
//                 <h3 className="text-lg font-bold text-white">{session.title}</h3>
//                 <p className="text-xs text-slate-400 leading-relaxed">{session.description}</p>
//               </div>

//               <div className="shrink-0 flex items-center gap-3">
//                 {session.recordingUrl ? (
//                   <a href={session.recordingUrl} target="_blank" rel="noreferrer">
//                     <Button variant="outline" className="border-slate-800 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold h-11 px-5 rounded-xl">
//                       <PlayCircle className="h-4 w-4 mr-2 text-emerald-400" /> Watch Recording
//                     </Button>
//                   </a>
//                 ) : canJoin && session.joinUrl ? (
//                   <a href={session.joinUrl} target="_blank" rel="noreferrer">
//                     <Button className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg shadow-orange-500/20 border-0">
//                       <Video className="h-4 w-4 mr-2" /> Join Live Class Now
//                     </Button>
//                   </a>
//                 ) : (
//                   <div className="text-right">
//                     <Button disabled variant="outline" className="border-slate-800/80 text-slate-500 text-xs h-11 px-5 rounded-xl opacity-60">
//                       <LockIcon className="h-3.5 w-3.5 mr-2" /> Join Link Hidden
//                     </Button>
//                     <p className="text-[10px] text-slate-500 mt-1 font-mono">Unlocks 15 mins before start</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function LockIcon(props: any) {
//   return <AlertCircle {...props} />;
// }


// src/app/(dashboard)/student/classes/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { classesApi, cohortsApi } from "@/lib/api";
import { Video, Loader2, Clock, Layers, Link as LinkIcon } from "lucide-react";

export default function StudentClassesPage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <StudentClassesContent />
    </Suspense>
  );
}

function StudentClassesContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
    loadClasses(selectedCohortId);
  }, [selectedCohortId]);

  const loadClasses = async (cohortId: string) => {
    setLoading(true);
    try {
      const res = await classesApi.getTimetableFeed(cohortId);
      setClasses(Array.isArray(res) ? res : []);
    } catch {
      setClasses([
        { id: "cls-1", title: "Advanced State Management", startsAt: new Date().toISOString(), joinUrl: "https://meet.google.com" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Live Classes & Recordings</h1>
          <p className="text-xs text-slate-400 mt-1">Join scheduled lectures and stream past recordings.</p>
        </div>

        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
          <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <select value={selectedCohortId} onChange={(e) => setSelectedCohortId(e.target.value)} className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-2">
            {cohorts.map((c) => (<option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
      ) : classes.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center text-xs text-slate-500">No classes scheduled for this cohort.</div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls: any) => (
            <div key={cls.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  LIVE LECTURE
                </span>
                <h3 className="text-base font-bold text-white">{cls.title}</h3>
                <p className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-400" /> {cls.startsAt ? new Date(cls.startsAt).toLocaleString() : "Scheduled"}
                </p>
                {cls.recordingUrl && (
                  <a href={cls.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-mono">
                    <LinkIcon className="h-3 w-3" /> Watch Recording ↗
                  </a>
                )}
              </div>

              {cls.joinUrl && (
                <a href={cls.joinUrl} target="_blank" rel="noreferrer">
                  <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5" /> Join Room
                  </button>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}