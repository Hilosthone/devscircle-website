// src/app/(dashboard)/tutor/attendance/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { classesApi, cohortsApi, attendanceApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Users,
  Calendar,
  Save,
  X,
} from "lucide-react";

export default function TutorAttendancePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <TutorAttendanceContent />
    </Suspense>
  );
}

function TutorAttendanceContent() {
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("");
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  
  const [enrolments, setEnrolments] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED">>({});
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
    loadCohortClassesAndEnrolments(selectedCohortId);
  }, [selectedCohortId]);

  const loadCohortClassesAndEnrolments = async (cohortId: string) => {
    setLoading(true);
    try {
      const [classRes, enrolRes] = await Promise.allSettled([
        classesApi.getTimetableFeed(cohortId),
        cohortsApi.getEnrolments(cohortId),
      ]);

      const classList = classRes.status === "fulfilled" && Array.isArray(classRes.value) ? classRes.value : [];
      setClasses(classList);
      if (classList.length > 0) setSelectedClassId(classList[0].id);

      const studentList = enrolRes.status === "fulfilled" && Array.isArray(enrolRes.value) ? enrolRes.value : [];
      setEnrolments(studentList);

      const initialMap: Record<string, "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"> = {};
      studentList.forEach((s: any) => {
        const studentId = s.studentId || s.id;
        initialMap[studentId] = "PRESENT";
      });
      setAttendanceMap(initialMap);
    } catch {
      setEnrolments([
        { studentId: "stu-1", student: { firstName: "Chidi", lastName: "Okafor", email: "chidi@devscircle.academy" } },
      ]);
      setAttendanceMap({ "stu-1": "PRESENT" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await attendanceApi.bulkMark(selectedClassId, records);

      setFeedback({
        type: "success",
        text: "Attendance register saved successfully using bulkMark!",
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to record attendance.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Class Attendance Register</h1>
          <p className="text-xs text-slate-400 mt-1">
            Record attendance status for live class sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* CLASS SELECTOR & TABLE */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : enrolments.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <Users className="h-8 w-8 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No enrolments found for this cohort</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitAttendance} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium">Select Class Session *</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              {classes.length === 0 ? (
                <option value="">No classes scheduled</option>
              ) : (
                classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title} ({new Date(cls.startsAt).toLocaleDateString()})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" /> Attendance Roster
              </span>
              <span className="text-xs font-mono text-slate-400">
                {enrolments.length} Students
              </span>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {enrolments.map((enr: any) => {
                  const studentId = enr.studentId || enr.id;
                  const student = enr.student || enr;
                  const currentStatus = attendanceMap[studentId] || "PRESENT";

                  return (
                    <tr key={studentId} className="hover:bg-slate-900/80">
                      <td className="p-4 font-bold text-white">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-4 font-mono text-slate-400">{student.email}</td>
                      <td className="p-4 text-right">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(studentId, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="LATE">LATE</option>
                          <option value="EXCUSED">EXCUSED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !selectedClassId}
              className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-11 px-6 rounded-2xl shadow-lg shadow-orange-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Save Bulk Attendance
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}