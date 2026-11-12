"use client";

import { motion } from "framer-motion";

export function AssessmentSection() {
  const parts = [
    { weight: "30%", title: "Capstone Project", desc: "Ability to build a complete real project" },
    { weight: "25%", title: "Final Examination", desc: "Overall knowledge of the whole programme" },
    { weight: "20%", title: "Weekly Assignments", desc: "Steady practice and progress every week" },
    { weight: "15%", title: "Bi-Weekly Tests", desc: "Understanding throughout training" },
    { weight: "10%", title: "Attendance", desc: "Showing up and taking part in live classes" },
  ];

  return (
    <section id="assessment" className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Glow — Orange & Red */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-l from-red-600/15 via-orange-600/15 to-transparent blur-[140px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Section 07
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Assessment & Certification
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Half of your final grade (50%) comes directly from what you build—because doing is what counts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {parts.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl text-center space-y-3 hover:border-orange-500/40 transition-colors"
            >
              <span className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent block">
                {item.weight}
              </span>
              <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}