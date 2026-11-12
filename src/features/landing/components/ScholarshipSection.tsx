"use client";

import { motion } from "framer-motion";
import { ScholarshipCalculator } from "@/features/scholarship/calculator";

export function ScholarshipSection() {
  return (
    <section id="scholarship" className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Ambient Glow — Orange to Red */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-600/15 via-red-600/15 to-transparent blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Section 03
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            How the Scholarship Works
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Every accepted student receives a 90% scholarship. You pay only 10% of the programme fee, and never more than ₦10,000.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <ScholarshipCalculator />
        </motion.div>
      </div>
    </section>
  );
}