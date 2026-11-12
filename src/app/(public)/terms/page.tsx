// src/app/(public)/terms/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { SITE_CONFIG } from "@/lib/constants";
import { FileText, CheckCircle2, AlertTriangle, Award, DollarSign } from "lucide-react";

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState<string>("November 2026");

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleDateString("en-NG", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-300">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl space-y-12">
          
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center pb-8 border-b border-slate-800"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold uppercase tracking-widest">
              <FileText className="w-4 h-4" /> Academy Agreement
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Last updated: {lastUpdated}
            </p>
          </motion.div>

          {/* Content Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-8 text-xs sm:text-sm leading-relaxed text-slate-300"
          >
            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400" /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing or registering with <strong className="text-white">{SITE_CONFIG.name}</strong>, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-400" /> 2. Scholarship & Financial Policy
              </h2>
              <p>
                DevsCircle Academy provides scholarship-supported technology training under the following terms:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Every accepted student receives an automatic 90% scholarship on programme fees.</li>
                <li>The student financial contribution is locked to a flat maximum cap of <strong className="text-white">₦10,000</strong>.</li>
                <li>Fee payments are non-refundable once cohort onboarding and portal credentials have been provisioned.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-400" /> 3. Academic Integrity & Certification
              </h2>
              <p>
                To earn a verifiable DevsCircle Academy graduation certificate, students must actively participate in live classes, maintain satisfactory attendance, submit weekly coding assignments, pass bi-weekly tests, and successfully complete and defend their capstone project. Plagiarism or academic dishonesty will result in immediate dismissal without refund.
              </p>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" /> 4. User Conduct & Portal Access
              </h2>
              <p>
                Users (Students, Tutors, and Admins) agree not to misuse portal credentials, share accounts, harass other members, or upload malicious code to submission repositories. We reserve the right to suspend or terminate accounts that violate our code of conduct.
              </p>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-400" /> 5. Modifications to Terms
              </h2>
              <p>
                DevsCircle Academy may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these terms of service.
              </p>
            </section>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}