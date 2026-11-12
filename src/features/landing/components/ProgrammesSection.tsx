"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AVAILABLE_PROGRAMMES } from "@/features/programmes/data";
import { Button } from "@/components/ui/button";

export function ProgrammesSection() {
  return (
    <section id="programmes" className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Ambient Glow — Orange & Red */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[300px] bg-gradient-to-r from-orange-600/15 via-red-600/15 to-transparent blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Section 04
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Programmes Available Now
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Every programme runs for 3 months and ends with a real capstone project you can show to employers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AVAILABLE_PROGRAMMES.map((prog, idx) => (
            <motion.div 
              key={prog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative rounded-3xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-xl hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-orange-500/10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Available Now
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">3 Months</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">
                    {prog.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Stack & Tools:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.tools.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Capstone Project:</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{prog.youWillBuild}</p>
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-800/80">
                <Link href={`/apply?programme=${prog.slug}`}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-500/20 border-0">
                    Apply for {prog.title.split(" ")[0]}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}