// import Link from "next/link";
// import Image from "next/image";
// import { SITE_CONFIG } from "@/lib/constants";
// import { Button } from "@/components/ui/button";
// import { Clock, MapPin, Award, ArrowRight } from "lucide-react";

// export function HeroSection() {
//   return (
//     <section className="relative overflow-hidden bg-slate-950 text-white py-20 md:py-28 border-b border-slate-800">
//       {/* Subtle Background Glows */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-500/20 blur-3xl pointer-events-none" />

//       <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
//           {/* Left Column Text */}
//           <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
//             <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
//               <span>Edition {SITE_CONFIG.edition}</span>
//               <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
//               <span>90% Scholarship Guaranteed</span>
//             </div>

//             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
//               Build Practical Tech Skills. <br />
//               <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent">
//                 Pay Only 10%.
//               </span>
//             </h1>

//             <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
//               Learn practical tech skills from expert tutors, build real projects, and earn a verifiable certificate in three months. Never pay more than ₦10,000.
//             </p>

//             <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
//               <Link href="/apply">
//                 <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold h-13 px-8 text-base shadow-lg shadow-orange-500/20 border-0">
//                   Apply Now — Free
//                   <ArrowRight className="h-5 w-5 ml-2" />
//                 </Button>
//               </Link>
//               <Link href="#scholarship">
//                 <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white h-13 px-8 text-base">
//                   See Fee Calculator
//                 </Button>
//               </Link>
//             </div>

//             {/* Feature Pills */}
//             <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-xl">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
//                   <MapPin className="h-5 w-5" />
//                 </div>
//                 <div className="text-left text-xs">
//                   <span className="block font-bold text-white">Format</span>
//                   <span className="text-slate-400">Online Live</span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
//                   <Clock className="h-5 w-5" />
//                 </div>
//                 <div className="text-left text-xs">
//                   <span className="block font-bold text-white">Duration</span>
//                   <span className="text-slate-400">3 Months</span>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
//                   <Award className="h-5 w-5" />
//                 </div>
//                 <div className="text-left text-xs">
//                   <span className="block font-bold text-white">Certificate</span>
//                   <span className="text-slate-400">Verifiable</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column Brand Card */}
//           <div className="lg:col-span-5 flex justify-center">
//             <div className="relative w-full max-w-md aspect-square rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl flex flex-col items-center justify-center text-center group hover:border-slate-700 transition-all">
//               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-emerald-500/10 rounded-3xl pointer-events-none" />
//               <Image
//                 src={SITE_CONFIG.logoPath}
//                 alt={SITE_CONFIG.name}
//                 width={180}
//                 height={180}
//                 className="h-36 w-auto object-contain mb-6 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_25px_rgba(37,99,235,0.3)]"
//                 priority
//               />
//               <h2 className="text-2xl font-black text-white tracking-tight">{SITE_CONFIG.name}</h2>
//               <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-2">
//                 {SITE_CONFIG.tagline}
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// }



"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Award, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-20 md:py-28 border-b border-slate-900">
      {/* Background Glow — Orange & Red Ambient Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-orange-600/25 via-red-600/20 to-amber-500/20 blur-[130px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400">
              <span>Edition {SITE_CONFIG.edition}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>90% Scholarship Guaranteed</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Build Practical Tech Skills. <br />
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-amber-400 bg-clip-text text-transparent">
                Pay Only 10%.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Learn practical tech skills from expert tutors, build real projects, and earn a verifiable certificate in three months. Never pay more than ₦10,000.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/apply">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold h-13 px-8 text-base shadow-lg shadow-orange-500/25 border-0">
                  Apply Now — Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="#scholarship">
                <Button size="lg" variant="outline" className="border-slate-800 text-slate-200 hover:bg-slate-900 hover:text-white h-13 px-8 text-base backdrop-blur-md">
                  See Fee Calculator
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-bold text-white">Format</span>
                  <span className="text-slate-400">Online Live</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-bold text-white">Duration</span>
                  <span className="text-slate-400">3 Months</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Award className="h-5 w-5" />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-bold text-white">Certificate</span>
                  <span className="text-slate-400">Verifiable</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column Brand Card with Orange/Red Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-slate-900/80 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center group hover:border-orange-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-red-500/10 rounded-3xl pointer-events-none" />
              <Image
                src={SITE_CONFIG.logoPath}
                alt={SITE_CONFIG.name}
                width={180}
                height={180}
                className="h-36 w-auto object-contain mb-6 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_30px_rgba(249,115,22,0.35)]"
                priority
              />
              <h2 className="text-2xl font-black text-white tracking-tight">{SITE_CONFIG.name}</h2>
              <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mt-2">
                {SITE_CONFIG.tagline}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}