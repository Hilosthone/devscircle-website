"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GitBranch,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CapstoneProject {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  rubricJson: {
    architecture: number;
    codeQuality: number;
    features: number;
    deployment: number;
  };
}

interface ExistingSubmission {
  id: string;
  repoUrl: string;
  liveUrl: string;
  score?: number;
  feedbackJson?: {
    architecture: number;
    codeQuality: number;
    features: number;
    deployment: number;
    notes?: string;
  };
}

export default function StudentCapstonePage() {
  const [project, setProject] = useState<CapstoneProject | null>(null);
  const [submission, setSubmission] = useState<ExistingSubmission | null>(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCapstoneDetails();
  }, []);

  const fetchCapstoneDetails = async () => {
    setLoading(true);
    try {
      const projRes = await apiClient.get("/capstone/projects");
      const projectData = Array.isArray(projRes.data) ? projRes.data[0] : projRes.data;
      setProject(projectData);

      if (projectData?.id) {
        const subRes = await apiClient.get(`/capstone/projects/${projectData.id}/submissions`);
        if (subRes.data && subRes.data.length > 0) {
          setSubmission(subRes.data[0]);
          setRepoUrl(subRes.data[0].repoUrl);
          setLiveUrl(subRes.data[0].liveUrl);
        }
      }
    } catch {
      setErrorMsg("Failed to load capstone project details from backend engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { data } = await apiClient.post(`/capstone/projects/${project.id}/submit`, {
        repoUrl,
        liveUrl,
      });

      setSubmission(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to submit project repository.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">Capstone Project</h1>
        <p className="text-xs text-slate-400 mt-1">
          Your capstone counts for 30% of your final grade. Build and submit your production MVP repository.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {project && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PROJECT BRIEF & RUBRIC */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                30% Final Weight
              </span>
              <h2 className="text-xl font-bold text-white">{project.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* SCORING RUBRIC */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Evaluation Rubric Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-lg font-bold text-white font-mono">
                    {project.rubricJson.architecture}%
                  </span>
                  <span className="text-[10px] text-slate-400">Architecture</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-lg font-bold text-white font-mono">
                    {project.rubricJson.codeQuality}%
                  </span>
                  <span className="text-[10px] text-slate-400">Code Quality</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-lg font-bold text-white font-mono">
                    {project.rubricJson.features}%
                  </span>
                  <span className="text-[10px] text-slate-400">Features</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="block text-lg font-bold text-white font-mono">
                    {project.rubricJson.deployment}%
                  </span>
                  <span className="text-[10px] text-slate-400">Deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMISSION FORM / EVALUATION RESULT */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl space-y-6 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-400" />
                Submission Console
              </h3>

              {submission?.score !== undefined ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <span className="block text-xs font-mono font-bold text-emerald-400 uppercase">
                    Graded & Evaluated
                  </span>
                  <span className="text-3xl font-black text-white font-mono">
                    {submission.score}%
                  </span>
                  {submission.feedbackJson?.notes && (
                    <p className="text-[11px] text-slate-300 italic pt-2 border-t border-emerald-500/20">
                      &quot;{submission.feedbackJson.notes}&quot;
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">GitHub Repository URL *</label>
                    <div className="relative">
                      <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        required
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/user/project"
                        className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Live Production URL *</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        required
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://my-capstone.vercel.app"
                        className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xs rounded-xl border-0 shadow-lg shadow-orange-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : submission ? (
                      "Update Submission Links"
                    ) : (
                      "Submit Capstone MVP"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}