// src/app/(dashboard)/admin/students/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { attendanceApi, cohortsApi, gradingApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Loader2,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Layers,
  Calculator,
  Download,
  BarChart3,
  X,
} from "lucide-react";

interface EnrolledStudent {
  id: string;
  studentId: string;
  cohortId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  programmeSlug: string;
  cohortName: string;
  enrolledAt: string;
  status: "ACTIVE" | "COMPLETED" | "DROPPED";
}

interface CohortOption {
  id: string;
  name: string;
  programmeSlug?: string;
}

const STATUS_FILTERS = ["ALL", "ACTIVE", "COMPLETED", "DROPPED"] as const;

export default function AdminStudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminStudentsContent />
    </Suspense>
  );
}

function AdminStudentsContent() {
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("ALL");

  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [computingId, setComputingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Student Academic Snapshot Modal
  const [inspectedStudent, setInspectedStudent] =
    useState<EnrolledStudent | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState<boolean>(false);
  const [snapshotData, setSnapshotData] = useState<{
    attendance: any;
    grade: any;
  } | null>(null);

  useEffect(() => {
    loadCohortsAndEnrolments();
  }, []);

  useEffect(() => {
    if (cohorts.length > 0) {
      fetchEnrolmentsForSelection(selectedCohortId, cohorts);
    }
  }, [selectedCohortId]);

  const normalizeEnrolment = (
    raw: any,
    cohortMeta?: CohortOption
  ): EnrolledStudent => {
    const studentObj = raw.student || raw.user || raw;
    return {
      id: raw.id || `enrol-${studentObj.id || Math.random()}`,
      studentId: raw.studentId || studentObj.id || "",
      cohortId: raw.cohortId || cohortMeta?.id || "",
      firstName: studentObj.firstName || raw.firstName || "Student",
      lastName: studentObj.lastName || raw.lastName || "",
      email: studentObj.email || raw.email || "",
      phoneNumber: studentObj.phoneNumber || raw.phoneNumber || "—",
      programmeSlug:
        raw.programmeSlug ||
        raw.cohort?.programme?.slug ||
        cohortMeta?.programmeSlug ||
        "academy-track",
      cohortName:
        raw.cohortName || raw.cohort?.name || cohortMeta?.name || "Active Cohort",
      enrolledAt: raw.enrolledAt || raw.createdAt || new Date().toISOString(),
      status: (raw.status || "ACTIVE").toUpperCase() as EnrolledStudent["status"],
    };
  };

  const loadCohortsAndEnrolments = async () => {
    setLoading(true);
    try {
      const cohortList = await cohortsApi.list();
      const parsedCohorts: CohortOption[] = Array.isArray(cohortList)
        ? cohortList.map((c: any) => ({
            id: c.id,
            name: c.name,
            programmeSlug: c.programme?.slug,
          }))
        : [];

      if (parsedCohorts.length > 0) {
        setCohorts(parsedCohorts);
        await fetchEnrolmentsForSelection("ALL", parsedCohorts);
      } else {
        throw new Error("No cohorts returned");
      }
    } catch {
      setCohorts([
        {
          id: "c1d2e3f4-5555-6666-7777-888899990000",
          name: "Cohort 1 - 2026",
          programmeSlug: "backend-mern",
        },
      ]);
      setStudents([
        {
          id: "enrol-101",
          studentId: "stu-101",
          cohortId: "c1d2e3f4-5555-6666-7777-888899990000",
          firstName: "Chidi",
          lastName: "Okafor",
          email: "chidi.okafor@example.com",
          phoneNumber: "+2348012345678",
          programmeSlug: "backend-mern",
          cohortName: "Cohort 1 - 2026",
          enrolledAt: new Date(Date.now() - 864000000).toISOString(),
          status: "ACTIVE",
        },
        {
          id: "enrol-102",
          studentId: "stu-102",
          cohortId: "c1d2e3f4-5555-6666-7777-888899990000",
          firstName: "Fatima",
          lastName: "Sanusi",
          email: "fatima.sanusi@example.com",
          phoneNumber: "+2348098765432",
          programmeSlug: "frontend-react",
          cohortName: "Cohort 1 - 2026",
          enrolledAt: new Date(Date.now() - 1728000000).toISOString(),
          status: "ACTIVE",
        },
      ]);
      setLoading(false);
    }
  };

  const fetchEnrolmentsForSelection = async (
    cohortSelection: string,
    availableCohorts: CohortOption[]
  ) => {
    setLoading(true);
    try {
      const targetCohorts =
        cohortSelection === "ALL"
          ? availableCohorts
          : availableCohorts.filter((c) => c.id === cohortSelection);

      const results = await Promise.allSettled(
        targetCohorts.map(async (c) => {
          const list = await cohortsApi.getEnrolments(c.id);
          return Array.isArray(list)
            ? list.map((item) => normalizeEnrolment(item, c))
            : [];
        })
      );

      const merged = results.flatMap((r) =>
        r.status === "fulfilled" ? r.value : []
      );
      setStudents(merged);
    } finally {
      setLoading(false);
    }
  };

  const handleComputeGrade = async (student: EnrolledStudent) => {
    if (!student.studentId || !student.cohortId) return;
    setComputingId(student.id);
    setFeedback(null);

    try {
      const grade = await gradingApi.computeStudentGrade(
        student.studentId,
        student.cohortId
      );
      const score =
        grade?.cumulativeScore ?? grade?.totalScore ?? grade?.finalScore;
      setFeedback({
        type: "success",
        text: `Computed cumulative grade for ${student.firstName} ${
          student.lastName
        }${score !== undefined ? `: ${Number(score).toFixed(1)}%` : "."}`,
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to compute student grade.",
      });
    } finally {
      setComputingId(null);
    }
  };

  const handleInspectStudent = async (student: EnrolledStudent) => {
    setInspectedStudent(student);
    setLoadingSnapshot(true);
    setSnapshotData(null);

    try {
      const [attRes, gradeRes] = await Promise.allSettled([
        attendanceApi.getSummary(student.studentId, student.cohortId),
        gradingApi.computeStudentGrade(student.studentId, student.cohortId),
      ]);

      setSnapshotData({
        attendance: attRes.status === "fulfilled" ? attRes.value : null,
        grade: gradeRes.status === "fulfilled" ? gradeRes.value : null,
      });
    } finally {
      setLoadingSnapshot(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Programme",
      "Cohort",
      "Status",
      "Enrolled Date",
    ];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      s.firstName,
      s.lastName,
      s.email,
      s.phoneNumber,
      s.programmeSlug,
      s.cohortName,
      s.status,
      new Date(s.enrolledAt).toISOString().split("T")[0],
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devscircle-students-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter((s) => {
    const matchesStatus =
      statusFilter === "ALL" || s.status === statusFilter;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.programmeSlug.toLowerCase().includes(q) ||
      s.cohortName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Enrolled Students Roster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspect active student profiles, filter by cohort batch, and trigger cumulative grade computations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* COHORT FILTER */}
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 h-10">
            <Layers className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-2"
            >
              <option value="ALL" className="bg-slate-900">
                All Cohorts ({cohorts.length})
              </option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* CSV EXPORT */}
          <Button
            type="button"
            variant="outline"
            disabled={filteredStudents.length === 0}
            onClick={handleExportCsv}
            className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-10 px-4 rounded-xl"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-orange-400" /> Export CSV
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

      {/* STATUS PILLS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
          <Users className="h-3.5 w-3.5 text-slate-400 ml-2 mr-1" />
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                statusFilter === st
                  ? "bg-orange-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, email, track..."
            className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* STUDENTS TABLE */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800 bg-slate-900/50 text-center space-y-2">
          <p className="text-sm font-bold text-white">No enrolled students found</p>
          <p className="text-xs text-slate-400">
            Students appear here automatically once their scholarship payment is confirmed or reconciled.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Programme & Cohort</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Enrolled Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-900/80">
                  <td className="p-4">
                    <div className="font-bold text-white">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {student.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-orange-400">
                      {student.programmeSlug}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {student.cohortName}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-500" />{" "}
                      {student.phoneNumber}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        student.status === "DROPPED"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : student.status === "COMPLETED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" /> {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInspectStudent(student)}
                      className="border-slate-800 text-slate-200 hover:bg-slate-800 text-[11px] h-8 px-2.5"
                    >
                      <BarChart3 className="h-3.5 w-3.5 mr-1 text-orange-400" />{" "}
                      Standing
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={computingId === student.id}
                      onClick={() => handleComputeGrade(student)}
                      className="border-slate-800 text-emerald-400 hover:bg-emerald-500/10 text-[11px] h-8 px-2.5"
                    >
                      {computingId === student.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <Calculator className="h-3.5 w-3.5 mr-1" /> Compute
                          Grade
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STUDENT ACADEMIC STANDING MODAL */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {inspectedStudent.firstName} {inspectedStudent.lastName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {inspectedStudent.cohortName} · {inspectedStudent.programmeSlug}
                </p>
              </div>
              <button
                onClick={() => setInspectedStudent(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingSnapshot ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      Attendance Rate
                    </span>
                    <p className="text-lg font-black text-white mt-0.5">
                      {snapshotData?.attendance?.attendanceRate ??
                        snapshotData?.attendance?.percentage ??
                        0}
                      %
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      Cumulative Score
                    </span>
                    <p className="text-lg font-black text-emerald-400 mt-0.5">
                      {Number(
                        snapshotData?.grade?.cumulativeScore ??
                          snapshotData?.grade?.totalScore ??
                          0
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">
                    70% Graduation Certificate Eligibility
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      Number(
                        snapshotData?.grade?.cumulativeScore ??
                          snapshotData?.grade?.totalScore ??
                          0
                      ) >= 70
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {Number(
                      snapshotData?.grade?.cumulativeScore ??
                        snapshotData?.grade?.totalScore ??
                        0
                    ) >= 70
                      ? "ELIGIBLE"
                      : "IN PROGRESS"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => setInspectedStudent(null)}
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