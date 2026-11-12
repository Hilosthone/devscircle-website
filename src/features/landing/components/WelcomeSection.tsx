"use client";

import { motion } from "framer-motion";
import { BookOpen, Rocket, Users } from "lucide-react";

export function WelcomeSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section id="about" className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Ambient Glow — Orange & Red Accent */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-orange-600/15 via-red-600/15 to-transparent blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10 space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Section 01
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Welcome to DevsCircle Academy
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            DevsCircle Academy is a scholarship-based online technology academy. We help young people build practical, job-ready digital skills through live classes, real projects, and expert tutors at a price they can actually afford.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Vision Card — Primary Orange */}
          <motion.div variants={itemVariants} className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-xl hover:border-orange-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 w-fit mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To become a recognised technology academy that develops competent, innovative, and industry-ready technology professionals across Nigeria and Africa.
            </p>
          </motion.div>

          {/* Mission Card — Accent Red */}
          <motion.div variants={itemVariants} className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-xl hover:border-red-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-fit mb-6 group-hover:scale-110 transition-transform">
              <Rocket className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              To make quality technology education accessible through scholarship-supported training, experienced tutors, structured programmes, and practical, project-based learning.
            </p>
          </motion.div>

          {/* Motto Card — Learning Green Accent */}
          <motion.div variants={itemVariants} className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Our Motto</h3>
            </div>
            <div className="pt-6 border-t border-slate-800">
              <span className="text-lg font-black bg-gradient-to-r from-orange-400 via-red-500 to-emerald-400 bg-clip-text text-transparent">
                Learn · Build · Collaborate · Grow
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}