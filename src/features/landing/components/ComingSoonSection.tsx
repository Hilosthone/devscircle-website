// src/components/sections/coming-soon-section.tsx
"use client";

import { motion } from "framer-motion";
import { COMING_SOON_PROGRAMMES } from "@/features/programmes/data";

export function ComingSoonSection() {
  return (
    <section className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Ambient Glow — Red & Orange */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-red-600/10 via-orange-600/10 to-transparent blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            Section 05
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Coming Soon
          </h2>
          <p className="text-slate-400 text-sm">
            We&apos;ll launch new programmes in phases as tutors and resources are ready.
          </p>
        </motion.div>

        {/* SINGLE LINE HORIZONTAL SCROLL / CAROUSEL */}
        <div className="flex overflow-x-auto pb-4 pt-2 gap-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {COMING_SOON_PROGRAMMES.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group min-w-[280px] sm:min-w-[320px] max-w-[350px] shrink-0 snap-start p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md hover:border-orange-500/40 hover:bg-slate-900/80 transition-all duration-300 space-y-2.5"
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400">Phase Launch</span>
              <h4 className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}