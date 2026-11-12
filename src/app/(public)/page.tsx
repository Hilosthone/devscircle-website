import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";
import { API_BASE_URL } from "@/lib/api-client";
import { AVAILABLE_PROGRAMMES, COMING_SOON_PROGRAMMES } from "@/features/programmes/data";
import { ScholarshipCalculator } from "@/features/scholarship/calculator";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, MapPin, Award, BookOpen, Users, Rocket, ShieldCheck } from "lucide-react";

export const revalidate = 60; // Re-fetch published programmes every 60 seconds

interface DisplayProgramme {
  id: string;
  slug: string;
  title: string;
  description: string;
  tools: string[];
  youWillBuild: string;
}

async function getPublishedProgrammes(): Promise<DisplayProgramme[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/programmes/public`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return AVAILABLE_PROGRAMMES;

    const json = await res.json();
    const list = json?.data ?? json;

    if (!Array.isArray(list) || list.length === 0) {
      return AVAILABLE_PROGRAMMES;
    }

    // Merge live backend programmes with rich local metadata (tools/capstone preview)
    return list.map((apiProg: any) => {
      const localMatch = AVAILABLE_PROGRAMMES.find((p) => p.slug === apiProg.slug);
      return {
        id: apiProg.id || apiProg.slug,
        slug: apiProg.slug,
        title: apiProg.name || localMatch?.title || apiProg.slug,
        description: apiProg.description || localMatch?.description || "",
        tools: localMatch?.tools || ["Git", "REST APIs", "Production Deployment"],
        youWillBuild:
          localMatch?.youWillBuild ||
          "A full-stack, production-deployed capstone project reviewed by industry tutors.",
      };
    });
  } catch {
    return AVAILABLE_PROGRAMMES;
  }
}

export default async function HomePage() {
  const programmes = await getPublishedProgrammes();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-background to-background py-16 md:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <span>Edition {SITE_CONFIG.edition}</span>
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  <span>90% Scholarship Available</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Build Practical Tech Skills with a{" "}
                  <span className="text-primary">90% Scholarship</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
                  Learn practical tech skills from expert tutors, build real projects, and earn a verifiable certificate in three months. You pay only 10%, never more than ₦10,000.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link href="/apply">
                    <Button size="lg" variant="accent" className="h-12 px-8 text-base shadow-md">
                      Apply Now — Free Application
                    </Button>
                  </Link>
                  <Link href="#programmes">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                      Explore Programmes
                    </Button>
                  </Link>
                </div>

                {/* QUICK FACTS BAR */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div className="text-left text-xs">
                      <span className="block font-bold text-slate-900">Format</span>
                      <span className="text-slate-500">Online · Live classes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <div className="text-left text-xs">
                      <span className="block font-bold text-slate-900">Duration</span>
                      <span className="text-slate-500">3 months per programme</span>
                    </div>
                  </div>
                  <Link
                    href="/verify"
                    className="flex items-center gap-3 col-span-2 sm:col-span-1 group"
                  >
                    <Award className="h-5 w-5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="text-left text-xs">
                      <span className="block font-bold text-slate-900 group-hover:text-primary transition-colors">
                        Certificate
                      </span>
                      <span className="text-slate-500 underline decoration-dotted">
                        Verify Online →
                      </span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* LOGO HERO BANNER */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 p-8 shadow-2xl flex flex-col items-center justify-center text-center text-white border border-slate-700">
                  <Image
                    src={SITE_CONFIG.logoPath}
                    alt={SITE_CONFIG.name}
                    width={160}
                    height={160}
                    className="h-32 w-auto object-contain mb-6 drop-shadow-md"
                    priority
                  />
                  <h2 className="text-2xl font-extrabold tracking-tight">{SITE_CONFIG.name}</h2>
                  <p className="text-emerald-400 font-semibold text-sm mt-1">{SITE_CONFIG.tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 01: WELCOME */}
        <section id="about" className="py-16 bg-white border-t border-slate-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Section 01</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Welcome to DevsCircle Academy</h3>
              <p className="text-slate-600 leading-relaxed">
                DevsCircle Academy is a scholarship-based online technology academy. We help young people build practical, job-ready digital skills through live classes, real projects, and expert tutors at a price they can actually afford.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 leading-relaxed">
                  To become a recognised technology academy that develops competent, innovative, and industry-ready technology professionals across Nigeria and Africa.
                </CardContent>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-emerald-600 flex items-center gap-2">
                    <Rocket className="h-5 w-5" /> Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 leading-relaxed">
                  To make quality technology education accessible through scholarship-supported training, experienced tutors, structured programmes, and practical, project-based learning.
                </CardContent>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-accent flex items-center gap-2">
                    <Users className="h-5 w-5" /> Our Motto
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-base font-bold text-slate-800 text-center py-4">
                  Learn · Build · Collaborate · Grow
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 02: WHY WE EXIST */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Section 02</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Why DevsCircle Academy Exists</h3>
              <p className="text-slate-600">
                Many talented young people want a career in technology, but they keep running into the same barriers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Cost Barrier", desc: "Good training is often far too expensive for students and young graduates.", solution: "A 90% scholarship for every accepted student (max ₦10,000 contribution)." },
                { title: "Too Much Theory", desc: "Many courses explain concepts but never help learners build real things.", solution: "Weekly assignments, regular bi-weekly tests, and a real final capstone project." },
                { title: "No Structure", desc: "Free videos are everywhere, but learning alone without tutors or deadlines is hard.", solution: "Fixed timetable, live classes, recordings, and a supportive cohort." },
                { title: "No Proof", desc: "Even after learning, many people have nothing credible to show an employer.", solution: "Verifiable digital certificate plus a portfolio-ready capstone project." },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                  <div className="pt-4 border-t border-slate-100">
                    <span className="block text-[11px] font-bold text-emerald-600 uppercase mb-1">Our Solution</span>
                    <p className="text-xs text-slate-700 font-medium">{item.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 03 & CALCULATOR: HOW SCHOLARSHIP WORKS */}
        <section id="scholarship" className="py-16 bg-white border-t border-slate-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Section 03</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">How the Scholarship Works</h3>
              <p className="text-slate-600">
                Each programme has a real course fee. When your application is approved, the scholarship covers 90% of it. You pay the remaining 10%, but never more than ₦10,000, no matter how much the programme costs.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <ScholarshipCalculator />
            </div>
          </div>
        </section>

        {/* SECTION 04: PROGRAMMES AVAILABLE NOW */}
        <section id="programmes" className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Section 04</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Programmes Available Now</h3>
              <p className="text-slate-600">
                Every programme lasts three months and ends with a real project you can show to employers or clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programmes.map((prog) => (
                <Card key={prog.id} className="flex flex-col bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded mb-2">
                      Available Now
                    </div>
                    <CardTitle className="text-lg text-slate-900">{prog.title}</CardTitle>
                    <CardDescription className="text-xs text-slate-600 line-clamp-2">{prog.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">Tools You Will Use:</span>
                      <div className="flex flex-wrap gap-1">
                        {prog.tools.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-1">You Will Build:</span>
                      <p className="text-slate-600">{prog.youWillBuild}</p>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Link href={`/apply?programme=${prog.slug}`}>
                      <Button className="w-full" variant="accent">
                        Apply for {prog.title.split(" ")[0]}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 05: COMING SOON */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Section 05</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Coming Soon</h3>
              <p className="text-slate-600">
                We will launch new programmes in phases as tutors and resources are ready.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {COMING_SOON_PROGRAMMES.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phase Launch</span>
                  <h5 className="font-bold text-slate-900 text-sm">{item.title}</h5>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 07: ASSESSMENT BREAKDOWN */}
        <section id="assessment" className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-400">Section 07</h2>
              <h3 className="text-3xl font-extrabold">Assessment & Certification</h3>
              <p className="text-slate-400 text-sm">
                Half of your final grade (50%) comes directly from what you build.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              {[
                { weight: "30%", title: "Capstone Project", desc: "Ability to build a complete real project" },
                { weight: "25%", title: "Final Examination", desc: "Overall knowledge of the programme" },
                { weight: "20%", title: "Weekly Assignments", desc: "Steady practice every week" },
                { weight: "15%", title: "Bi-Weekly Tests", desc: "Understanding throughout training" },
                { weight: "10%", title: "Attendance", desc: "Showing up and taking part" },
              ].map((a, i) => (
                <div key={i} className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <span className="text-3xl font-black text-emerald-400">{a.weight}</span>
                  <h4 className="font-bold text-sm text-white">{a.title}</h4>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 12: FAQ */}
        <section id="faq" className="py-16 bg-white border-t border-slate-200">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-xs uppercase font-bold tracking-widest text-primary">Section 12</h2>
              <h3 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              {[
                { q: "Is DevsCircle Academy online?", a: "Yes. Classes are live online via Google Meet or Zoom, with recordings available afterwards." },
                { q: "How much does it cost?", a: "Only 10% of the programme fee, and never more than ₦10,000. You pay only after your application is approved." },
                { q: "Is applying free?", a: "Yes, applying for the scholarship is completely free." },
                { q: "How long is each programme?", a: "Three months: two months of hands-on training, then one month for the final exam and capstone project." },
                { q: "Do I need prior experience?", a: "No. Most programmes start right from the foundations." },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 bg-primary text-white text-center">
          <div className="container mx-auto max-w-4xl px-4 space-y-6">
            <h3 className="text-3xl font-extrabold">Ready to Start Your Tech Journey?</h3>
            <p className="text-blue-100 max-w-xl mx-auto text-sm">
              Applications for the {SITE_CONFIG.edition} cohort are currently open. Apply today with zero upfront fees.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/apply">
                <Button size="lg" variant="accent" className="h-12 px-8 text-base">
                  Start Your Free Application
                </Button>
              </Link>
              <Link href="/verify">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base bg-white/10 border-white/25 text-white hover:bg-white/20"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Verify a Certificate
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}