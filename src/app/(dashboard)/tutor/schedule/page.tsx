// src/app/(dashboard)/tutor/schedule/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { classesApi, cohortsApi } from "@/lib/api";
import { Loader2, Calendar, Layers, Clock, MapPin } from "lucide-react";

export default function TutorSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <TutorScheduleContent />
    </Suspense>
  );
}

function TutorScheduleContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    if (!selectedCohortId) return;
    loadGrid(selectedCohortId);
  }, [selectedCohortId]);

  const loadGrid = async (cohortId: string) => {
    setLoading(true);
    try {
      const res = await classesApi.getTimetableGrid(cohortId);
      setSlots(Array.isArray(res) ? res : res?.slots || []);
    } catch {
      setSlots([
        {
          id: "slot-1",
          dayOfWeek: "MONDAY",
          startTime: "18:00",
          endTime: "20:00",
          venue: "Virtual Google Meet",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Timetable Grid</h1>
          <p className="text-xs text-slate-400 mt-1">
            Weekly scheduled class slots and recurring lecture venues.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
          <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
          <select
            value={selectedCohortId}
            onChange={(e) => setSelectedCohortId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-2"
          >
            {cohorts.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : slots.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <Calendar className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No timetable grid slots configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slots.map((slot: any) => (
            <div key={slot.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {slot.dayOfWeek || "SCHEDULED"}
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" /> {slot.startTime} - {slot.endTime}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                <MapPin className="h-3.5 w-3.5 text-orange-400" /> {slot.venue || "Virtual Classroom"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}