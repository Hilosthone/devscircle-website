"use client";

import { motion } from "framer-motion";

export function WhyDevsCircle() {
  const items = [
    { title: "Cost Barrier", desc: "Good training is often far too expensive for students and young graduates.", solution: "90% scholarship for every student (capped at ₦10,000 max)." },
    { title: "Too Much Theory", desc: "Many courses explain concepts but never help learners build real things.", solution: "Weekly assignments, bi-weekly tests, and a capstone project." },
    { title: "No Structure", desc: "Free videos are everywhere, but learning alone without tutors or deadlines is hard.", solution: "Fixed timetable, live interactive classes, and supportive cohort." },
    { title: "No Proof", desc: "Even after learning, many people have nothing credible to show an employer.", solution: "Online verifiable digital certificate + portfolio project." },
  ];

  return (
    <section className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Ambient Glow — Red & Orange */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-l from-red-600/15 via-orange-600/15 to-transparent blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Section 02
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Why DevsCircle Academy Exists
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Many talented young people want a career in technology, but keep running into barriers. Here is how we break them down.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-2xl bg-slate-900/50 border border-slate-800/80 p-6 backdrop-blur-xl hover:border-orange-500/40 hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-orange-500/5"
            >
              <div className="space-y-3 mb-6">
                <span className="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">Barrier 0{idx + 1}</span>
                <h3 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider block mb-1">Our Solution</span>
                <p className="text-xs font-semibold text-slate-200">{item.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}