// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X, ChevronRight, Sparkles } from "lucide-react";
// import { SITE_CONFIG } from "@/lib/constants";
// import { Button } from "@/components/ui/button";

// const NAV_LINKS = [
//   { href: "/#about", label: "About Us" },
//   { href: "/#programmes", label: "Programmes" },
//   { href: "/#scholarship", label: "Scholarship" },
//   { href: "/#assessment", label: "Assessment" },
//   { href: "/#faq", label: "FAQ" },
// ];

// export function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Lock body scroll when mobile menu is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   return (
//     <motion.header
//       initial={{ y: -20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
//       className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none"
//     >
//       <div
//         className={`mx-auto max-w-7xl rounded-2xl transition-all duration-300 pointer-events-auto border ${
//           scrolled
//             ? "border-slate-800/80 bg-slate-950/85 shadow-2xl shadow-orange-950/10 backdrop-blur-2xl py-2.5"
//             : "border-slate-800/50 bg-slate-950/60 backdrop-blur-xl py-3"
//         }`}
//       >
//         <div className="flex items-center justify-between px-4 sm:px-6">
//           {/* Logo Brand */}
//           <Link href="/" className="flex items-center gap-3 group">
//             <div className="relative p-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 group-hover:border-orange-500/50 transition-all duration-300 shadow-inner group-hover:shadow-orange-500/10">
//               <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
//               <Image
//                 src={SITE_CONFIG.logoPath}
//                 alt={SITE_CONFIG.name}
//                 width={36}
//                 height={36}
//                 className="h-7 w-auto object-contain relative z-10"
//                 priority
//               />
//             </div>
//             <div className="flex flex-col">
//               <span className="font-bold text-white text-sm tracking-tight group-hover:text-orange-400 transition-colors flex items-center gap-1">
//                 {SITE_CONFIG.name}
//               </span>
//               <span className="text-[10px] text-slate-400 font-medium tracking-wide">
//                 {SITE_CONFIG.tagline}
//               </span>
//             </div>
//           </Link>

//           {/* Desktop Navigation Link Pills */}
//           <nav className="hidden lg:flex items-center gap-1 rounded-full border border-slate-800/60 bg-slate-900/50 p-1.5 backdrop-blur-md">
//             {NAV_LINKS.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className="px-4 py-1.5 text-xs font-semibold text-slate-300 rounded-full hover:text-white hover:bg-slate-800/70 transition-all duration-200"
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </nav>

//           {/* Desktop Right CTA Buttons */}
//           <div className="hidden lg:flex items-center gap-3">
//             <Link href="/login">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-semibold px-4"
//               >
//                 Sign In
//               </Button>
//             </Link>
//             <Link href="/apply">
//               <Button
//                 size="sm"
//                 className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs px-5 shadow-lg shadow-orange-500/25 border-0 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
//               >
//                 <Sparkles className="w-3.5 h-3.5 mr-1.5 fill-white/20" />
//                 Apply Now
//               </Button>
//             </Link>
//           </div>

//           {/* Mobile & Tablet Hamburger Toggle */}
//           <div className="flex items-center gap-2 lg:hidden">
//             <Link href="/apply">
//               <Button
//                 size="sm"
//                 className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs px-3 h-8 shadow-md shadow-orange-500/20"
//               >
//                 Apply
//               </Button>
//             </Link>
//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               aria-label="Toggle navigation menu"
//               className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
//             >
//               {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Drawer Overlay */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.25, ease: "easeInOut" }}
//             className="lg:hidden pointer-events-auto mt-2 rounded-2xl border border-slate-800/90 bg-slate-950/95 p-5 backdrop-blur-2xl shadow-2xl shadow-slate-950/80"
//           >
//             <div className="flex flex-col space-y-2">
//               {NAV_LINKS.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   onClick={() => setIsOpen(false)}
//                   className="flex items-center justify-between p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all text-sm font-semibold group"
//                 >
//                   <span>{link.label}</span>
//                   <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
//                 </Link>
//               ))}

//               <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
//                 <Link href="/login" onClick={() => setIsOpen(false)}>
//                   <Button
//                     variant="outline"
//                     className="w-full rounded-xl border-slate-800 bg-slate-900/50 text-slate-200 hover:bg-slate-800 text-xs font-semibold py-5"
//                   >
//                     Sign In
//                   </Button>
//                 </Link>
//                 <Link href="/apply" onClick={() => setIsOpen(false)}>
//                   <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white font-bold text-xs py-5 shadow-lg shadow-orange-500/25 border-0">
//                     <Sparkles className="w-4 h-4 mr-1.5" />
//                     Apply Now
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.header>
//   );
// }







// src/components/common/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, ArrowRight, Compass, LogIn } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/#about", label: "About Us" },
  { href: "/#programmes", label: "Programmes" },
  { href: "/#scholarship", label: "Scholarship" },
  { href: "/#assessment", label: "Assessment" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 transition-all duration-300 pointer-events-none"
    >
      <div
        className={`mx-auto max-w-7xl rounded-2xl transition-all duration-300 pointer-events-auto border ${
          scrolled
            ? "border-slate-800/80 bg-slate-950/90 shadow-2xl shadow-orange-950/20 backdrop-blur-2xl py-2.5"
            : "border-slate-800/50 bg-slate-950/70 backdrop-blur-xl py-3.5"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 group-hover:border-orange-500/50 transition-all duration-300 shadow-inner">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Image
                src={SITE_CONFIG.logoPath}
                alt={SITE_CONFIG.name}
                width={36}
                height={36}
                className="h-7 w-auto object-contain relative z-10"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm tracking-tight group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
                {SITE_CONFIG.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wide">
                {SITE_CONFIG.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Link Pills */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-slate-800/80 bg-slate-900/60 p-1.5 backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 rounded-full hover:text-white hover:bg-slate-800/80 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-semibold px-4 h-9"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Sign In
              </Button>
            </Link>
            <Link href="/apply">
              <Button
                size="sm"
                className="rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs px-5 h-9 shadow-lg shadow-orange-500/25 border-0 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]"
              >
                <Terminal className="w-3.5 h-3.5 mr-1.5 text-white/90" />
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Mobile & Tablet Controls */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <Link href="/apply">
              <Button
                size="sm"
                className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-xs px-3.5 h-8 shadow-md shadow-orange-500/20"
              >
                Apply
              </Button>
            </Link>

            {/* Pro Animated Hamburger Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-colors focus:outline-none"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-4 h-0.5 bg-current rounded-full block absolute"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-0.5 bg-current rounded-full block absolute"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-4 h-0.5 bg-current rounded-full block absolute"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay with Smooth Opening & Closing Animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden pointer-events-auto mt-2 rounded-3xl border border-slate-800 bg-slate-950/95 p-5 backdrop-blur-2xl shadow-2xl shadow-slate-950/90"
          >
            <motion.div 
              initial="hidden"
              animate="show"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.05,
                  },
                },
                exit: {
                  opacity: 0,
                  transition: {
                    staggerChildren: 0.02,
                    staggerDirection: -1,
                  }
                }
              }}
              className="flex flex-col space-y-2"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -8 },
                  show: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -8 }
                }}
                className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500"
              >
                Navigation Menu
              </motion.div>
              
              {NAV_LINKS.map((link) => (
                <motion.div
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    show: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: -12 }
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-xs font-semibold group"
                  >
                    <span className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
                      {link.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 10 }
                }}
                className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5"
              >
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-slate-800 bg-slate-900/50 text-slate-200 hover:bg-slate-800 text-xs font-semibold h-11 justify-center"
                  >
                    <LogIn className="w-4 h-4 mr-2 text-slate-400" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/apply" onClick={() => setIsOpen(false)}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white font-bold text-xs h-11 shadow-lg shadow-orange-500/25 border-0 justify-center">
                    <Terminal className="w-4 h-4 mr-2 text-white/90" />
                    Apply Now
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}