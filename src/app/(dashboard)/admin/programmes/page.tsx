//src/app/(dashboard)/admin/programmes/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { programmesApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { AVAILABLE_PROGRAMMES } from "@/features/programmes/data";
import { calculateStudentContribution, formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Banknote,
  Layers,
  X,
  Sparkles,
} from "lucide-react";

interface AdminProgrammeRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  feeNaira: number;
  isPublished: boolean;
  modulesCount?: number;
}

export default function AdminProgrammesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminProgrammesContent />
    </Suspense>
  );
}

function AdminProgrammesContent() {
  const [programmes, setProgrammes] = useState<AdminProgrammeRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Programme Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [feeNaira, setFeeNaira] = useState<number>(100000);
  const [publishNow, setPublishNow] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  // Configure Pricing Modal State
  const [pricingTarget, setPricingTarget] = useState<AdminProgrammeRow | null>(null);
  const [editFeeNaira, setEditFeeNaira] = useState<number>(100000);
  const [savingPricing, setSavingPricing] = useState<boolean>(false);

  // Add Module Modal State
  const [moduleTarget, setModuleTarget] = useState<AdminProgrammeRow | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleOrder, setModuleOrder] = useState<number>(1);
  const [savingModule, setSavingModule] = useState<boolean>(false);

  const loadProgrammes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await programmesApi.getPublicList();
      const list = Array.isArray(data) ? data : [];

      if (list.length === 0) {
        setProgrammes(
          AVAILABLE_PROGRAMMES.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.title,
            description: p.description,
            feeNaira: p.originalFee,
            isPublished: p.isAvailableNow,
          }))
        );
      } else {
        setProgrammes(
          list.map((item: any) => {
            const feeFromKobo =
              typeof item.pricing?.feeKobo === "number"
                ? Math.round(item.pricing.feeKobo / 100)
                : typeof item.feeKobo === "number"
                ? Math.round(item.feeKobo / 100)
                : item.baseFeeNaira ?? 100000;

            return {
              id: item.id,
              slug: item.slug,
              name: item.name || item.title || item.slug,
              description: item.description || "",
              feeNaira: feeFromKobo,
              isPublished: item.isPublished ?? true,
              modulesCount: Array.isArray(item.modules) ? item.modules.length : undefined,
            };
          })
        );
      }
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to load programmes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammes();
  }, []);

  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleCreateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setCreating(true);
    setErrorMsg(null);

    try {
      const created = await programmesApi.create({
        slug: slugify(slug),
        name: name.trim(),
        description: description.trim(),
      });

      const newId = created?.id;

      if (newId) {
        await programmesApi.configurePricing(newId, {
          feeKobo: Math.max(0, Number(feeNaira) || 0) * 100,
          studentPercent: 10,
          capKobo: 10000 * 100, // ₦10,000 cap in kobo
        });

        if (publishNow) {
          await programmesApi.togglePublish(newId);
        }
      }

      setSuccessMsg(`"${name.trim()}" created successfully.`);
      setCreateOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setFeeNaira(100000);
      await loadProgrammes();
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to create programme.");
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (prog: AdminProgrammeRow) => {
    try {
      const res = await programmesApi.togglePublish(prog.id);
      const nextPublished =
        typeof res?.isPublished === "boolean" ? res.isPublished : !prog.isPublished;

      setProgrammes((prev) =>
        prev.map((p) => (p.id === prog.id ? { ...p, isPublished: nextPublished } : p))
      );
      setSuccessMsg(
        nextPublished
          ? `"${prog.name}" is now published.`
          : `"${prog.name}" has been unpublished.`
      );
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to toggle publish status.");
    }
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingTarget) return;

    setSavingPricing(true);
    try {
      const safeFeeNaira = Math.max(0, Number(editFeeNaira) || 0);
      await programmesApi.configurePricing(pricingTarget.id, {
        feeKobo: safeFeeNaira * 100,
        studentPercent: 10,
        capKobo: 10000 * 100,
      });

      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === pricingTarget.id ? { ...p, feeNaira: safeFeeNaira } : p
        )
      );
      setSuccessMsg(`Updated tuition pricing for "${pricingTarget.name}".`);
      setPricingTarget(null);
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to update pricing.");
    } finally {
      setSavingPricing(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTarget || !moduleTitle.trim()) return;

    setSavingModule(true);
    try {
      await programmesApi.addModule(moduleTarget.id, {
        title: moduleTitle.trim(),
        description: moduleDesc.trim(),
        orderIndex: Number(moduleOrder) || 1,
      });

      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === moduleTarget.id
            ? { ...p, modulesCount: (p.modulesCount || 0) + 1 }
            : p
        )
      );
      setSuccessMsg(`Added module "${moduleTitle.trim()}" to ${moduleTarget.name}.`);
      setModuleTarget(null);
      setModuleTitle("");
      setModuleDesc("");
      setModuleOrder(1);
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Failed to add module.");
    } finally {
      setSavingModule(false);
    }
  };

  const createBreakdown = calculateStudentContribution(feeNaira);
  const editBreakdown = calculateStudentContribution(editFeeNaira);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Academic Programmes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create tracks, configure tuition pricing (10% student contribution capped at ₦10,000), and manage curriculum modules.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold h-10 px-5 rounded-xl border-0 shadow-lg shadow-orange-500/20 text-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-1.5" /> New Programme
        </Button>
      </div>

      {/* ALERTS */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* PROGRAMMES TABLE */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
        </div>
      ) : programmes.length === 0 ? (
        <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/50 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Programmes Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Create your first programme track to open scholarship applications.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto backdrop-blur-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-4">Programme</th>
                <th className="p-4">Base Fee</th>
                <th className="p-4">Student Pays (Capped)</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {programmes.map((prog) => {
                const { studentPays } = calculateStudentContribution(prog.feeNaira);
                return (
                  <tr key={prog.id} className="hover:bg-slate-900/80">
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white">{prog.name}</div>
                      <div className="text-[11px] font-mono text-orange-400 mt-0.5">
                        /{prog.slug}
                        {typeof prog.modulesCount === "number" && (
                          <span className="text-slate-500 ml-2">
                            · {prog.modulesCount} modules
                          </span>
                        )}
                      </div>
                      {prog.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                          {prog.description}
                        </p>
                      )}
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      {formatNaira(prog.feeNaira)}
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {formatNaira(studentPays)}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(prog)}
                        title="Click to toggle publish status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-colors ${
                          prog.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {prog.isPublished ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> PUBLISHED
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> UNPUBLISHED
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPricingTarget(prog);
                          setEditFeeNaira(prog.feeNaira);
                        }}
                        className="border-slate-800 text-slate-300 hover:bg-slate-800 text-[11px] h-8 px-3"
                      >
                        <Banknote className="h-3 w-3 mr-1 text-emerald-400" /> Pricing
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModuleTarget(prog);
                          setModuleOrder((prog.modulesCount || 0) + 1);
                        }}
                        className="border-slate-800 text-slate-300 hover:bg-slate-800 text-[11px] h-8 px-3"
                      >
                        <Layers className="h-3 w-3 mr-1 text-orange-400" /> Add Module
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. CREATE PROGRAMME MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Create Programme</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add a new programme and configure its 90% scholarship pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgramme} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Programme Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Backend Engineering (MERN)"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="backend-mern"
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs font-mono text-orange-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Original Fee (₦ Naira)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={feeNaira}
                    onChange={(e) => setFeeNaira(Number(e.target.value))}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Scholarship Covers:{" "}
                  <strong className="text-emerald-400">
                    {formatNaira(createBreakdown.scholarshipAmount)}
                  </strong>
                </span>
                <span className="text-slate-300">
                  Student Pays:{" "}
                  <strong className="text-orange-400">
                    {formatNaira(createBreakdown.studentPays)}
                  </strong>
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what learners will master and build..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publishNow}
                  onChange={(e) => setPublishNow(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 accent-orange-500 h-4 w-4"
                />
                Publish immediately after creation
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-5 rounded-xl border-0"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Programme"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CONFIGURE PRICING MODAL */}
      {pricingTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Configure Pricing</h2>
                <p className="text-xs text-orange-400 font-mono mt-0.5">
                  {pricingTarget.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPricingTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Base Programme Fee (₦ Naira)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  required
                  value={editFeeNaira}
                  onChange={(e) => setEditFeeNaira(Number(e.target.value))}
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>90% Scholarship Discount:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    -{formatNaira(editBreakdown.scholarshipAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Student Pays (10%, Max ₦10,000):</span>
                  <span className="text-orange-400 font-mono">
                    {formatNaira(editBreakdown.studentPays)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPricingTarget(null)}
                  className="border-slate-800 text-slate-300 text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingPricing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-5 rounded-xl border-0"
                >
                  {savingPricing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save Pricing"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD MODULE MODAL */}
      {moduleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Add Curriculum Module</h2>
                <p className="text-xs text-orange-400 font-mono mt-0.5">
                  {moduleTarget.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModuleTarget(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Module Title
                  </label>
                  <input
                    type="text"
                    required
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g. REST APIs & Authentication"
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Order #</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={moduleOrder}
                    onChange={(e) => setModuleOrder(Number(e.target.value))}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Module Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Topics covered in this module..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModuleTarget(null)}
                  className="border-slate-800 text-slate-300 text-xs h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingModule}
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-5 rounded-xl border-0"
                >
                  {savingModule ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Add Module"
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