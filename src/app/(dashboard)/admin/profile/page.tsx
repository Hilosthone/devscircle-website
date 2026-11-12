// src/app/(dashboard)/admin/profile/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { User, Shield, Key, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<div className="py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>}>
      <AdminProfileContent />
    </Suspense>
  );
}

function AdminProfileContent() {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [revoking, setRevoking] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, sessRes] = await Promise.allSettled([
        authApi.getMe(),
        authApi.listSessions(),
      ]);
      setProfile(meRes.status === "fulfilled" ? meRes.value : null);
      setSessions(sessRes.status === "fulfilled" && Array.isArray(sessRes.value) ? sessRes.value : []);
    } catch {
      setProfile({ firstName: "Administrator", email: "admin@devscircle.academy", type: "ADMIN" });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSessions = async () => {
    setRevoking(true);
    setFeedback(null);
    try {
      await authApi.revokeOtherSessions();
      setFeedback({ type: "success", text: "All other active sessions revoked successfully." });
      await loadData();
    } catch (err) {
      const norm = extractApiError(err);
      setFeedback({ type: "error", text: norm.message || "Failed to revoke sessions." });
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Administrator Profile & Security</h1>
        <p className="text-xs text-slate-400 mt-1">Manage system credentials and active security sessions.</p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${feedback.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* PROFILE CARD */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 backdrop-blur-xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xl font-black">
            {profile?.firstName?.[0] || "A"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-xs font-mono text-slate-400">{profile?.email}</p>
            <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {profile?.type || "ADMIN"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <h3 className="text-sm font-bold text-white">Active Sessions</h3>
            <p className="text-xs text-slate-400">Securely sign out from all other connected browsers.</p>
          </div>
          <Button onClick={handleRevokeSessions} disabled={revoking} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
            {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Revoke Other Sessions"}
          </Button>
        </div>
      </div>
    </div>
  );
}