// import Link from "next/link";
// import { Navbar } from "@/components/common/navbar";
// import { Footer } from "@/components/common/footer";
// import { Button } from "@/components/ui/button";
// import { CheckCircle2, Clock, Mail } from "lucide-react";

// export default function ApplicationStatusPage() {
//   return (
//     <div className="min-h-screen flex flex-col bg-slate-950 text-white">
//       <Navbar />

//       <main className="flex-1 flex items-center justify-center py-20 px-4">
//         <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl">
//           <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
//             <CheckCircle2 className="h-8 w-8" />
//           </div>

//           <div className="space-y-2">
//             <h1 className="text-2xl font-bold">Application Received!</h1>
//             <p className="text-xs text-slate-400 leading-relaxed">
//               Your 90% scholarship application has been successfully submitted to the admissions committee.
//             </p>
//           </div>

//           <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-left space-y-3">
//             <div className="flex items-center gap-3 text-slate-300">
//               <Clock className="h-4 w-4 text-orange-400 shrink-0" />
//               <span>Review Time: 24–48 Hours</span>
//             </div>
//             <div className="flex items-center gap-3 text-slate-300">
//               <Mail className="h-4 w-4 text-orange-400 shrink-0" />
//               <span>Decision sent directly to your email</span>
//             </div>
//           </div>

//           <div className="pt-2">
//             <Link href="/">
//               <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold">
//                 Back to Homepage
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }

import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Mail, MessageSquare } from "lucide-react";

export default function ApplicationStatusPage() {
  // Demo WhatsApp Group Link — replace with your actual WhatsApp community/group URL later
  const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/demo-group-link";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-orange-600/15 via-red-600/15 to-transparent blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl text-center space-y-6 shadow-2xl relative z-10">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Application Received!</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your 90% scholarship application has been successfully submitted to the admissions committee.
            </p>
          </div>

          {/* WHATSAPP GROUP CALLOUT BANNER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-900 border border-emerald-500/30 text-left space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>Join Applicants Community</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Join the official WhatsApp group for live cohort updates, admission announcements, and notifications when approval emails are sent.
            </p>
            <a
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block pt-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 rounded-xl border-0 shadow-lg shadow-emerald-600/20 text-xs">
                Join WhatsApp Group Now
              </Button>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-left space-y-3">
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="h-4 w-4 text-orange-400 shrink-0" />
              <span>Review Time: 24–48 Hours</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="h-4 w-4 text-orange-400 shrink-0" />
              <span>Decision sent directly to your email</span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/">
              <Button variant="ghost" className="w-full text-slate-400 hover:text-white text-xs">
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}