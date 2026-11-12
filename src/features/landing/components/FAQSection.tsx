"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default first item open

const faqs = [
    {
      q: "Is DevsCircle Academy online?",
      a: "Yes. Classes are live online via Google Meet or Zoom, with session recordings and study resources made available in your student portal afterwards.",
    },
    {
      q: "How much does it cost?",
      a: "Only 10% of the programme fee, and never more than ₦10,000. You pay only after your application is reviewed and approved.",
    },
    {
      q: "Is applying free?",
      a: "Yes, applying for the scholarship is 100% free with no commitment until you are accepted.",
    },
    {
      q: "How long is each programme?",
      a: "Three months: two full months of intensive live training followed by one month dedicated to your final capstone project and evaluation exam.",
    },
    {
      q: "Do I need prior experience?",
      a: "No. Most of our tracks start right from absolute foundations and progressively build up to advanced software engineering concepts.",
    },
    {
      q: "Will I get a verified certificate upon completion?",
      a: "Yes! Every graduate receives a digital certificate with a unique Verification ID (`/verify/ID`) that recruiters and organizations can verify on our portal.",
    },
    {
      q: "What are the hardware and internet requirements?",
      a: "You need a functional laptop (at least 4GB RAM) and a stable internet connection for live sessions and hands-on coding exercises.",
    },
    {
      q: "What is the schedule for live classes?",
      a: "Classes are strategically scheduled on weekends and evening slots to accommodate university students, working professionals, and beginners.",
    },
    {
      q: "What happens if I miss a live class?",
      a: "All live classes are recorded and uploaded to your dashboard within 24 hours, alongside code repositories and lesson slides.",
    },
    {
      q: "How does the scholarship evaluation work?",
      a: "Applicants complete a short online assessment and profile screening. Scholarships are awarded based on motivation, commitment, and assessment scores.",
    },
    {
      q: "Do we work on real-world projects?",
      a: "Yes. In the final month, you will collaborate in project teams to design, build, and deploy production-grade software for your portfolio.",
    },
    {
      q: "How can I contact support or ask questions during the course?",
      a: "Students get direct access to dedicated WhatsApp workspace channels with dedicated tutors and peer discussion groups.",
    },
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="relative py-24 bg-slate-950 text-white border-b border-slate-900 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-orange-600/10 via-amber-500/5 to-transparent blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 relative z-10 space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need to know about our cohorts, scholarship structure, and classes.
          </p>
        </motion.div>

        {/* Accordion FAQ List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className={`rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                  isOpen
                    ? "border-orange-500/50 bg-slate-900/80 shadow-lg shadow-orange-500/5"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                {/* Trigger Button */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-2xl"
                  aria-expanded={isOpen}
                >
                  <span className={`font-bold text-sm sm:text-base transition-colors ${isOpen ? "text-orange-400" : "text-white"}`}>
                    {faq.q}
                  </span>
                  
                  {/* Icon Indicator */}
                  <div
                    className={`p-1.5 rounded-xl border transition-all duration-300 shrink-0 ml-4 ${
                      isOpen
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-400 rotate-180"
                        : "bg-slate-800/60 border-slate-700/60 text-slate-400"
                    }`}
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {/* Animated Collapsible Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-slate-800/50">
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}