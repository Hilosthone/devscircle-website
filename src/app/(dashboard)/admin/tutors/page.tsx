// src/app/(dashboard)/admin/tutors/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { cohortsApi, iamApi, programmesApi } from "@/lib/api";
import { apiClient, extractApiError } from "@/lib/api-client";
import { AVAILABLE_PROGRAMMES } from "@/features/programmes/data";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  GraduationCap,
  X,
} from "lucide-react";

interface TutorOption {
  id: string;
  name: string;
  email: string;
}

interface ProgrammeOption {
  id: string;
  slug: string;
  name: string;
}

interface CohortOption {
  id: string;
  programmeId: string;
  name: string;
}

interface ModuleOption {
  id: string;
  title: string;
}

export default function AdminTutorsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminTutorsContent />
    </Suspense>
  );
}

function AdminTutorsContent() {
  // Lookup Collections
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
  const [allCohorts, setAllCohorts] = useState<CohortOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);
  const [manualTutorMode, setManualTutorMode] = useState(false);

  // Assignment Form State
  const [tutorId, setTutorId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [moduleId, setModuleId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Assignments Roster for Selected Cohort
  const [cohortAssignments, setCohortAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Provision New Tutor Modal State (iamApi.provisionUser)
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [newTutorForm, setNewTutorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  useEffect(() => {
    bootstrapLookups();
  }, []);

  const bootstrapLookups = async () => {
    setLoadingInit(true);
    try {
      const [tutorsRes, progsRes, cohortsRes] = await Promise.allSettled([
        apiClient.get("/iam/users", { params: { type: "TUTOR" } }),
        programmesApi.getPublicList(),
        cohortsApi.list(),
      ]);

      // 1. Tutors
      if (tutorsRes.status === "fulfilled") {
        const payload = tutorsRes.value?.data?.data ?? tutorsRes.value?.data;
        const list = Array.isArray(payload) ? payload : [];
        const mappedTutors: TutorOption[] = list.map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
          email: u.email,
        }));
        setTutors(mappedTutors);
        if (mappedTutors.length > 0) {
          setTutorId(mappedTutors[0].id);
        } else {
          setManualTutorMode(true);
        }
      } else {
        setManualTutorMode(true);
      }

      // 2. Programmes
      const rawProgs =
        progsRes.status === "fulfilled" && Array.isArray(progsRes.value)
          ? progsRes.value
          : [];
      const mappedProgs: ProgrammeOption[] =
        rawProgs.length > 0
          ? rawProgs.map((p: any) => ({
              id: p.id,
              slug: p.slug,
              name: p.name || p.title || p.slug,
            }))
          : AVAILABLE_PROGRAMMES.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.title,
            }));
      setProgrammes(mappedProgs);
      if (mappedProgs.length > 0) {
        setProgrammeId(mappedProgs[0].id);
      }

      // 3. Cohorts
      const rawCohorts =
        cohortsRes.status === "fulfilled" && Array.isArray(cohortsRes.value)
          ? cohortsRes.value
          : [];
      setAllCohorts(rawCohorts);
    } finally {
      setLoadingInit(false);
    }
  };

  // Update Cohort & Modules when Programme changes
  useEffect(() => {
    if (!programmeId || programmes.length === 0) return;

    const matchingCohorts = allCohorts.filter(
      (c) => c.programmeId === programmeId
    );
    const activeCohortList =
      matchingCohorts.length > 0 ? matchingCohorts : allCohorts;
    setCohortId(activeCohortList[0]?.id || "");

    const selectedProg = programmes.find((p) => p.id === programmeId);
    if (!selectedProg?.slug) {
      setModules([]);
      setModuleId("");
      return;
    }

    setLoadingModules(true);
    programmesApi
      .getPublicBySlug(selectedProg.slug)
      .then((fullProg: any) => {
        const mods = Array.isArray(fullProg?.modules)
          ? fullProg.modules.map((m: any) => ({ id: m.id, title: m.title }))
          : [];
        setModules(mods);
        setModuleId("");
      })
      .catch(() => {
        setModules([]);
        setModuleId("");
      })
      .finally(() => setLoadingModules(false));
  }, [programmeId, programmes, allCohorts]);

  // Load current tutor assignments whenever selected cohort changes
  useEffect(() => {
    if (!cohortId) {
      setCohortAssignments([]);
      return;
    }
    fetchCohortAssignments(cohortId);
  }, [cohortId]);

  const fetchCohortAssignments = async (targetCohortId: string) => {
    setLoadingAssignments(true);
    try {
      const data = await cohortsApi.getTutors(targetCohortId);
      setCohortAssignments(Array.isArray(data) ? data : []);
    } catch {
      setCohortAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId.trim() || !cohortId.trim() || !programmeId.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setAssignedMessage(null);

    try {
      await cohortsApi.assignTutor({
        tutorId: tutorId.trim(),
        programmeId: programmeId.trim(),
        cohortId: cohortId.trim(),
        ...(moduleId.trim() ? { moduleId: moduleId.trim() } : {}),
      });

      setAssignedMessage(
        "Tutor successfully assigned. Session and class permissions have been updated."
      );
      await fetchCohortAssignments(cohortId);
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(
        normalized.message || "Failed to assign tutor to cohort module."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProvisionTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisioning(true);
    setErrorMsg(null);

    try {
      const created = await iamApi.provisionUser({
        firstName: newTutorForm.firstName.trim(),
        lastName: newTutorForm.lastName.trim(),
        email: newTutorForm.email.trim(),
        ...(newTutorForm.phoneNumber.trim()
          ? { phoneNumber: newTutorForm.phoneNumber.trim() }
          : {}),
        password: newTutorForm.password,
        type: "TUTOR",
      });

      if (created?.id) {
        const newOption: TutorOption = {
          id: created.id,
          name: `${newTutorForm.firstName.trim()} ${newTutorForm.lastName.trim()}`,
          email: newTutorForm.email.trim(),
        };
        setTutors((prev) => [newOption, ...prev]);
        setTutorId(created.id);
        setManualTutorMode(false);
      }

      setShowProvisionModal(false);
      setNewTutorForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
      setAssignedMessage(
        `Tutor account provisioned for ${newTutorForm.firstName} ${newTutorForm.lastName}.`
      );
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to provision tutor account.");
    } finally {
      setProvisioning(false);
    }
  };

  const filteredCohorts = allCohorts.filter(
    (c) => c.programmeId === programmeId
  );
  const cohortOptions =
    filteredCohorts.length > 0 ? filteredCohorts : allCohorts;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Tutor Assignments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision faculty accounts and assign tutors to specific cohort batches and curriculum modules.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowProvisionModal(true)}
          variant="outline"
          className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-10 px-4 rounded-xl"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5 text-orange-400" /> Provision New Tutor
        </Button>
      </div>

      {/* ASSIGNMENT FORM CARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
        {loadingInit ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : (
          <form onSubmit={handleAssign} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. TUTOR PICKER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Select Tutor *
                  </label>
                  {tutors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setManualTutorMode((prev) => !prev)}
                      className="text-[10px] font-mono text-slate-400 hover:text-orange-400 underline"
                    >
                      {manualTutorMode ? "Use Dropdown" : "Paste UUID"}
                    </button>
                  )}
                </div>

                {!manualTutorMode && tutors.length > 0 ? (
                  <select
                    required
                    value={tutorId}
                    onChange={(e) => setTutorId(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Choose a tutor...</option>
                    {tutors.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type="text"
                    value={tutorId}
                    onChange={(e) => setTutorId(e.target.value)}
                    placeholder="Paste Tutor User UUID..."
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                )}
              </div>

              {/* 2. PROGRAMME PICKER */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Programme *
                </label>
                <select
                  required
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. COHORT PICKER */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Cohort Batch *
                </label>
                {cohortOptions.length > 0 ? (
                  <select
                    required
                    value={cohortId}
                    onChange={(e) => setCohortId(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {cohortOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type="text"
                    value={cohortId}
                    onChange={(e) => setCohortId(e.target.value)}
                    placeholder="No cohorts found — paste Cohort UUID"
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                )}
              </div>

              {/* 4. MODULE PICKER (OPTIONAL) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Curriculum Module (Optional)
                </label>
                {loadingModules ? (
                  <div className="h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 flex items-center text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-orange-400" />
                    Loading modules...
                  </div>
                ) : (
                  <select
                    value={moduleId}
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">All Modules (Full Cohort Lead)</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !tutorId || !cohortId}
              className="w-full h-11 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs rounded-xl border-0 shadow-lg shadow-orange-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registering
                  Assignment...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Assign Tutor to Cohort
                </>
              )}
            </Button>
          </form>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {assignedMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{assignedMessage}</span>
          </div>
        )}
      </div>

      {/* CURRENT COHORT TUTOR ASSIGNMENTS */}
      {cohortId && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-orange-400" />
              <h2 className="text-sm font-bold text-white">
                Assigned Tutors for Selected Cohort
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {cohortAssignments.length} assigned
            </span>
          </div>

          {loadingAssignments ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            </div>
          ) : cohortAssignments.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No tutors assigned to this cohort yet. Use the form above to assign one.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Tutor</th>
                  <th className="p-4">Module Scope</th>
                  <th className="p-4 text-right">Assigned Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {cohortAssignments.map((item: any, idx: number) => {
                  const tutorObj = item.tutor || item.user || item;
                  const fullName =
                    `${tutorObj.firstName || ""} ${
                      tutorObj.lastName || ""
                    }`.trim() ||
                    tutorObj.name ||
                    item.tutorId;
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-900/80">
                      <td className="p-4">
                        <div className="font-bold text-white">{fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {tutorObj.email || item.tutorId}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-orange-400">
                        {item.module?.title || "All Modules (Full Cohort)"}
                      </td>
                      <td className="p-4 text-right font-mono text-[11px] text-slate-400">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "Active"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PROVISION NEW TUTOR MODAL (POST /iam/users) */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase">
                  IAM Faculty Onboarding
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Provision New Tutor
                </h3>
              </div>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionTutor} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">First Name *</label>
                  <input
                    required
                    type="text"
                    value={newTutorForm.firstName}
                    onChange={(e) =>
                      setNewTutorForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={newTutorForm.lastName}
                    onChange={(e) =>
                      setNewTutorForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Email Address *</label>
                <input
                  required
                  type="email"
                  value={newTutorForm.email}
                  onChange={(e) =>
                    setNewTutorForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="tutor@devscircle.academy"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newTutorForm.phoneNumber}
                  onChange={(e) =>
                    setNewTutorForm((p) => ({
                      ...p,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="+2348000000000"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  Temporary Password *
                </label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={newTutorForm.password}
                  onChange={(e) =>
                    setNewTutorForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Min 8 characters"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProvisionModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={provisioning}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {provisioning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Create Tutor Account"
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
//applications, attendance, certificate, cohorts, overview, programmes, payments, students, tutors, 