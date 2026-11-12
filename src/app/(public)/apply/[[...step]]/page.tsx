import { Suspense } from "react";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { ApplyWizard } from "@/features/applications/components/ApplyWizard";
import { Loader2 } from "lucide-react";

export default function ApplyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Free Scholarship Application
            </span>
            <h1 className="text-3xl sm:text-4xl font-black">Join DevsCircle Academy</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Complete this quick application to be considered for a 90% scholarship. No upfront payment required.
            </p>
          </div>

          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-500" /></div>}>
            <ApplyWizard />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}