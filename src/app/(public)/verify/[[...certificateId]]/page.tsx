// src/app/(public)/verify/[[...certificateId]]/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { certificatesApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { VerifyCertificateResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  BookOpen,
  FileText,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

function CertificateVerifyContent() {
  const params = useParams();
  const rawParam = params?.certificateId;
  const initialCode = Array.isArray(rawParam) ? rawParam[0] : rawParam || "";

  const [code, setCode] = useState<string>(initialCode);
  const [certData, setCertData] = useState<VerifyCertificateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleVerify(initialCode);
    }
  }, [initialCode]);

  const handleVerify = async (searchCode: string) => {
    const queryCode = searchCode.trim().toUpperCase();
    if (!queryCode) return;

    setLoading(true);
    setSearched(true);
    setErrorMsg(null);
    setCertData(null);

    try {
      const data = await certificatesApi.verify(queryCode);
      setCertData(data);
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(normalized.message || "Certificate record not found or code is invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SEARCH FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(code);
        }}
        className="flex gap-2 max-w-md mx-auto"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. DC-2026-MERN-000123-X7Y9Z2"
            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 text-xs font-mono uppercase text-white focus:outline-none focus:border-orange-500"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold h-11 px-6 rounded-xl border-0 shadow-lg shadow-orange-500/20 text-xs"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
        </Button>
      </form>

      {/* VERIFICATION RESULT CARD */}
      {searched && (
        <div className="max-w-xl mx-auto">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : certData && certData.isValid ? (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6 text-center">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block">
                  Verified Authentic Credential
                </span>
                <h2 className="text-2xl font-black text-white pt-2">
                  {certData.recipientName}
                </h2>
                <p className="text-xs font-mono text-orange-400">
                  Code: {certData.code}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-slate-800 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-orange-400" /> Programme
                  </span>
                  <p className="font-bold text-white">{certData.programmeName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-emerald-400" /> Issued Date
                  </span>
                  <p className="font-mono text-slate-300">
                    {new Date(certData.issuedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {certData.pdfHash && (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 sm:col-span-2">
                    <span className="text-slate-500 text-[10px] uppercase font-mono flex items-center gap-1">
                      <FileText className="h-3 w-3 text-slate-400" /> SHA-256 Document Checksum
                    </span>
                    <p className="font-mono text-[11px] text-slate-400 break-all">
                      {certData.pdfHash}
                    </p>
                  </div>
                )}
              </div>

              {certData.pdfUrl && (
                <div className="pt-2">
                  <a
                    href={certData.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition-colors"
                  >
                    View Official Certificate PDF <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : certData && !certData.isValid ? (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-amber-500/40 backdrop-blur-xl shadow-2xl text-center space-y-4">
              <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 inline-block">
                  Revoked Credential
                </span>
                <h2 className="text-xl font-bold text-white pt-2">
                  {certData.recipientName} — {certData.code}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
                  {certData.revocationReason ||
                    "This certificate has been revoked by DevsCircle Academy and is no longer valid."}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-red-500/30 backdrop-blur-xl shadow-2xl text-center space-y-4">
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Invalid Certificate Code</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  {errorMsg || "No matching graduation certificate record was found for this code."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function CertificateVerifyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-600/10 via-red-600/10 to-transparent blur-[140px] pointer-events-none" />

        <div className="container mx-auto max-w-3xl space-y-10 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Public Authentication Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">Verify Certificate</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Enter a DevsCircle certificate verification code to validate graduation records and cryptographic hashes.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            }
          >
            <CertificateVerifyContent />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}