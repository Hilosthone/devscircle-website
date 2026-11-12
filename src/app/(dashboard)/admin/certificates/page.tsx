"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { certificatesApi, cohortsApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Search,
} from "lucide-react";

interface CohortOption {
  id: string;
  name: string;
}

interface EnrolledStudentOption {
  studentId: string;
  name: string;
  email: string;
}

export default function AdminCertificatesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminCertificatesContent />
    </Suspense>
  );
}

function AdminCertificatesContent() {
  // Cohorts & Enrolled Students for Dropdown Selection
  const [cohorts, setCohorts] = useState<CohortOption[]>([]);
  const [students, setStudents] = useState<EnrolledStudentOption[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Issue Certificate State
  const [cohortId, setCohortId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuedResult, setIssuedResult] = useState<any | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Verify Certificate Quick Lookup State
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Revoke Certificate State
  const [revokeCertId, setRevokeCertId] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Load cohorts on mount
  useEffect(() => {
    cohortsApi
      .list()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setCohorts(list);
        if (list.length > 0) {
          setCohortId(list[0].id);
        } else {
          setManualMode(true);
        }
      })
      .catch(() => {
        setManualMode(true);
      });
  }, []);

  // Load enrolled students whenever cohortId changes
  useEffect(() => {
    if (!cohortId || manualMode) return;
    setLoadingRoster(true);
    setStudentId("");
    cohortsApi
      .getEnrolments(cohortId)
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((item: any) => ({
          studentId: item.studentId || item.student?.id || item.id,
          name:
            `${item.student?.firstName || item.firstName || ""} ${
              item.student?.lastName || item.lastName || ""
            }`.trim() || "Enrolled Student",
          email: item.student?.email || item.email || "",
        }));
        setStudents(mapped);
        if (mapped.length > 0) setStudentId(mapped[0].studentId);
      })
      .catch(() => {
        setStudents([]);
      })
      .finally(() => setLoadingRoster(false));
  }, [cohortId, manualMode]);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !cohortId.trim()) return;

    setIsIssuing(true);
    setIssueError(null);
    setIssuedResult(null);

    try {
      const data = await certificatesApi.issue(studentId.trim(), cohortId.trim());
      setIssuedResult(data);
    } catch (err) {
      const normalized = extractApiError(err);
      setIssueError(
        normalized.message ||
          "Student has not met the 70% passing threshold required for graduation certificate issuance."
      );
    } finally {
      setIsIssuing(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;

    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const data = await certificatesApi.verify(verifyCode.trim());
      setVerifyResult(data);
    } catch (err) {
      const normalized = extractApiError(err);
      setVerifyError(normalized.message || "Certificate code not found.");
    } finally {
      setVerifying(false);
    }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertId.trim() || !revokeReason.trim()) return;

    setIsRevoking(true);
    setRevokeError(null);
    setRevokeSuccess(null);

    try {
      await certificatesApi.revoke(revokeCertId.trim(), revokeReason.trim());
      setRevokeSuccess(`Certificate ${revokeCertId.trim()} has been revoked.`);
      setRevokeCertId("");
      setRevokeReason("");
    } catch (err) {
      const normalized = extractApiError(err);
      setRevokeError(normalized.message || "Failed to revoke certificate.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Certificates & Credentials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Issue verifiable graduation certificates (70% cumulative pass threshold), verify codes, or revoke credentials.
          </p>
        </div>

        <Link
          href="/verify"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300"
        >
          Public Verification Portal <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 1. ISSUE GRADUATION CERTIFICATE */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Issue Graduation Certificate
              </h2>
              <p className="text-[11px] text-slate-400">
                Validates cumulative grade ≥ 70% before minting certificate code.
              </p>
            </div>
          </div>

          {cohorts.length > 0 && (
            <button
              type="button"
              onClick={() => setManualMode((prev) => !prev)}
              className="text-[11px] font-mono text-slate-400 hover:text-orange-400 underline"
            >
              {manualMode ? "Use Dropdown Picker" : "Enter Raw UUIDs"}
            </button>
          )}
        </div>

        <form onSubmit={handleIssue} className="space-y-4">
          {!manualMode && cohorts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Select Cohort *
                </label>
                <select
                  required
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Select Enrolled Student *
                </label>
                {loadingRoster ? (
                  <div className="h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 flex items-center text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-orange-400" />
                    Loading cohort students...
                  </div>
                ) : students.length > 0 ? (
                  <select
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    {students.map((s) => (
                      <option key={s.studentId} value={s.studentId}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="No roster found — paste Student UUID"
                    className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Student User ID *
                </label>
                <input
                  required
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. s1t2u3v4-1111-2222-3333-444455556666"
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Cohort ID *
                </label>
                <input
                  required
                  type="text"
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  placeholder="e.g. c1d2e3f4-5555-6666-7777-888899990000"
                  className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isIssuing}
            className="w-full h-11 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            {isIssuing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying Threshold &
                Issuing...
              </>
            ) : (
              <>
                <Award className="h-4 w-4 mr-2" /> Issue Certificate
              </>
            )}
          </Button>
        </form>

        {issueError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{issueError}</span>
          </div>
        )}

        {issuedResult && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" /> Certificate Issued Successfully!
              </div>
              {issuedResult.certificateCode && (
                <Link
                  href={`/verify?code=${encodeURIComponent(
                    issuedResult.certificateCode
                  )}`}
                  target="_blank"
                  className="text-xs font-semibold text-emerald-300 hover:text-white inline-flex items-center gap-1"
                >
                  Inspect <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5 font-mono">
              {issuedResult.id && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Certificate ID:</span>
                  <span className="text-slate-300 select-all">{issuedResult.id}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Certificate Code:</span>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-bold select-all">
                    {issuedResult.certificateCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(issuedResult.certificateCode)}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    title="Copy certificate code"
                  >
                    {copiedCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              {issuedResult.issuedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Issued Timestamp:</span>
                  <span className="text-white">
                    {new Date(issuedResult.issuedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. VERIFY & REVOKE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QUICK VERIFY */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Quick Code Lookup</h2>
              <p className="text-[11px] text-slate-400">
                Verify authenticity and check revocation status.
              </p>
            </div>
          </div>

          <form onSubmit={handleQuickVerify} className="space-y-3">
            <input
              type="text"
              required
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="e.g. DC-2026-8841-ABCD"
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <Button
              type="submit"
              disabled={verifying}
              variant="outline"
              className="w-full h-10 border-slate-800 text-xs text-white hover:bg-slate-800"
            >
              {verifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Search className="h-3.5 w-3.5 mr-1.5" /> Verify Certificate
                </>
              )}
            </Button>
          </form>

          {verifyError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {verifyError}
            </p>
          )}

          {verifyResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span
                  className={
                    verifyResult.isRevoked || verifyResult.status === "REVOKED"
                      ? "text-red-400 font-bold"
                      : "text-emerald-400 font-bold"
                  }
                >
                  {verifyResult.isRevoked || verifyResult.status === "REVOKED"
                    ? "REVOKED"
                    : "VALID"}
                </span>
              </div>
              {verifyResult.studentName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Graduate:</span>
                  <span className="text-white">{verifyResult.studentName}</span>
                </div>
              )}
              {verifyResult.id && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Record ID:</span>
                  <span className="text-slate-300 select-all">{verifyResult.id}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* REVOKE CERTIFICATE */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Revoke Certificate</h2>
              <p className="text-[11px] text-slate-400">
                Invalidate a certificate ID with an audit reason.
              </p>
            </div>
          </div>

          <form onSubmit={handleRevoke} className="space-y-3">
            <input
              type="text"
              required
              value={revokeCertId}
              onChange={(e) => setRevokeCertId(e.target.value)}
              placeholder="Certificate UUID"
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs font-mono text-white focus:outline-none focus:border-red-500"
            />
            <input
              type="text"
              required
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation (e.g. Academic misconduct)"
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <Button
              type="submit"
              disabled={isRevoking}
              variant="outline"
              className="w-full h-10 border-red-500/30 text-xs text-red-400 hover:bg-red-500/10"
            >
              {isRevoking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Revoke Credential"
              )}
            </Button>
          </form>

          {revokeError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {revokeError}
            </p>
          )}

          {revokeSuccess && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              {revokeSuccess}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}