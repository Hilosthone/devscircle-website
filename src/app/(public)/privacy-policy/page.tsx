// src/app/(public)/privacy-policy/page.tsx
"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { SITE_CONFIG } from "@/lib/constants";
import { ShieldCheck, Lock, Eye, Database, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-4 h-4" /> NDPA 2023 Compliant
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Last updated: {new Date().toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
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
                <Eye className="w-4 h-4 text-orange-400" /> 1. Introduction
              </h2>
              <p>
                Welcome to <strong className="text-white">{SITE_CONFIG.name}</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to protecting your personal data in accordance with the Nigeria Data Protection Act (NDPA) 2023 and global privacy standards. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, apply for our tech scholarships, or use our student, tutor, and admin portals.
              </p>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-orange-400" /> 2. Information We Collect
              </h2>
              <p>When you interact with DevsCircle Academy, we may collect the following categories of personal data:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li><strong className="text-slate-200">Identity & Contact Data:</strong> Full name, email address, phone number, and residential location.</li>
                <li><strong className="text-slate-200">Application & Academic Data:</strong> Programme choices, background experience, scholarship assessment responses, assignment submissions, and attendance records.</li>
                <li><strong className="text-slate-200">Transaction & Payment Data:</strong> Records of scholarship fee contributions (capped at ₦10,000) and manual payment reconciliation receipts.</li>
                <li><strong className="text-slate-200">Technical Data:</strong> IP address, browser type, device details, and session activity logs on our learning portals.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-400" /> 3. How We Use Your Information
              </h2>
              <p>We use your collected information strictly for educational and operational purposes, including:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                <li>Processing your scholarship applications and cohort admissions.</li>
                <li>Managing your role-based access across Student, Tutor, and Admin portals.</li>
                <li>Facilitating live classes, attendance tracking, and capstone project grading.</li>
                <li>Issuing verifiable graduation certificates and validating credentials.</li>
                <li>Sending cohort updates, schedule notifications, and support communications.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-400" /> 4. Data Security & Protection
              </h2>
              <p>
                We implement robust technical and organizational security measures—including encrypted database storage, secure token authentication (JWT), and role-based permission controls—to prevent unauthorised access, loss, or disclosure of your personal information.
              </p>
            </section>

            <section className="space-y-3 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" /> 5. Contact Our Data Protection Officer
              </h2>
              <p>
                If you have any questions, requests, or concerns regarding this Privacy Policy or your personal data rights, please contact us at:
              </p>
              <div className="pt-2">
                <a 
                  href={`mailto:${SITE_CONFIG.contacts.email}?subject=Privacy%20Enquiry`}
                  className="inline-flex items-center gap-2 font-mono text-orange-400 hover:text-orange-300 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20 transition-colors"
                >
                  <Mail className="w-4 h-4" /> {SITE_CONFIG.contacts.email}
                </a>
              </div>
            </section>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}