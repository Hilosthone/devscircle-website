"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { AVAILABLE_PROGRAMMES } from "@/features/programmes/data";
import { applicationSchema, ApplicationFormData } from "../schemas";
import { calculateStudentContribution, formatNaira } from "@/lib/utils";
import { applicationsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, ArrowLeft, Loader2, Sparkles, ShieldCheck } from "lucide-react";

const STEPS = [
  { id: 1, title: "Programme", desc: "Choose your course" },
  { id: 2, title: "Personal Details", desc: "Contact & background" },
  { id: 3, title: "Motivation", desc: "Why you deserve it" },
  { id: 4, title: "Review & Submit", desc: "Final verification" },
];

export function ApplyWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProgramme = searchParams.get("programme");

  const defaultProg = AVAILABLE_PROGRAMMES.find((p) => p.slug === initialProgramme)?.id || AVAILABLE_PROGRAMMES[0].id;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      programmeId: defaultProg,
      fullName: "",
      email: "",
      phone: "",
      country: "NG",
      state: "",
      gender: "MALE",
      educationalBackground: "Undergraduate",
      occupation: "Student",
      previousExperience: "Beginner",
      motivation: "",
      whyDeserve: "",
      additionalInfo: "",
      consent: true,
    },
    mode: "onChange",
  });

  const selectedProgId = watch("programmeId");
  const selectedProg = AVAILABLE_PROGRAMMES.find((p) => p.id === selectedProgId) || AVAILABLE_PROGRAMMES[0];
  const { scholarshipAmount, studentPays } = calculateStudentContribution(selectedProg.originalFee);

  const validateAndNext = async () => {
    let fieldsToValidate: (keyof ApplicationFormData)[] = [];

    if (currentStep === 1) fieldsToValidate = ["programmeId"];
    if (currentStep === 2) fieldsToValidate = ["fullName", "email", "phone", "country", "state", "occupation", "educationalBackground", "previousExperience"];
    if (currentStep === 3) fieldsToValidate = ["motivation", "whyDeserve"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const targetProg = AVAILABLE_PROGRAMMES.find((p) => p.id === data.programmeId);
      const slug = targetProg ? targetProg.slug : "backend-mern";

      await applicationsApi.submit(data, slug);
      router.push("/application/status?submitted=true");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to submit application. An active application may already exist for this email.";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* STEP PROGRESS BAR */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`p-3 sm:p-4 rounded-2xl border transition-all ${
                isActive
                  ? "bg-slate-900 border-orange-500 shadow-lg shadow-orange-500/10"
                  : isDone
                  ? "bg-slate-900/40 border-emerald-500/30 text-slate-400"
                  : "bg-slate-900/20 border-slate-800/60 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold font-mono ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                </span>
                <span className={`text-xs font-bold hidden sm:inline ${isActive ? "text-white" : isDone ? "text-slate-300" : "text-slate-500"}`}>
                  {step.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* FORM CARD */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* STEP 1: PROGRAMME SELECTION */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">Select Your Programme</h2>
                  <p className="text-xs text-slate-400 mt-1">Choose the 3-month programme you want to apply for.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_PROGRAMMES.map((prog) => {
                    const isSelected = selectedProgId === prog.id;
                    const { studentPays } = calculateStudentContribution(prog.originalFee);

                    return (
                      <div
                        key={prog.id}
                        onClick={() => setValue("programmeId", prog.id, { shouldValidate: true })}
                        className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? "bg-slate-900 border-orange-500 ring-2 ring-orange-500/20 shadow-xl"
                            : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Available Now
                            </span>
                            {isSelected && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                          </div>
                          <h3 className="font-bold text-white text-base">{prog.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prog.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                          <span className="text-slate-400">Your Fee:</span>
                          <span className="font-bold text-orange-400 font-mono text-sm">{formatNaira(studentPays)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: PERSONAL DETAILS */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                  <p className="text-xs text-slate-400 mt-1">We need these details to process your scholarship application.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Full Name *</label>
                    <input
                      {...register("fullName")}
                      placeholder="e.g. John Doe"
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    {errors.fullName && <p className="text-[11px] text-red-400">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Email Address *</label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="e.g. john@example.com"
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    {errors.email && <p className="text-[11px] text-red-400">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">WhatsApp / Phone Number *</label>
                    <input
                      {...register("phone")}
                      placeholder="+2349051772499"
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    {errors.phone && <p className="text-[11px] text-red-400">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">State / Location *</label>
                    <input
                      {...register("state")}
                      placeholder="e.g. Kwara, Lagos, FCT"
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    {errors.state && <p className="text-[11px] text-red-400">{errors.state.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Educational Background *</label>
                    <select
                      {...register("educationalBackground")}
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Secondary School Student">Secondary School Student</option>
                      <option value="Undergraduate">Undergraduate Student</option>
                      <option value="Graduate">University / Polytechnic Graduate</option>
                      <option value="Self-Taught">Self-Taught Learner</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Prior Tech Experience *</label>
                    <select
                      {...register("previousExperience")}
                      className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="Beginner">Absolute Beginner (No experience)</option>
                      <option value="Some Knowledge">Basic Knowledge (HTML/CSS or basics)</option>
                      <option value="Intermediate">Intermediate (Built small projects)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: MOTIVATION */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">Motivation & Statement</h2>
                  <p className="text-xs text-slate-400 mt-1">Our admissions team reviews every application carefully on merit.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Why do you want to learn {selectedProg.title}? (150+ chars) *</label>
                    <textarea
                      {...register("motivation")}
                      rows={4}
                      placeholder="Tell us what inspired you to choose this tech skill and what you hope to achieve after 3 months..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    {errors.motivation && <p className="text-[11px] text-red-400">{errors.motivation.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Why do you deserve a 90% scholarship? (100+ chars) *</label>
                    <textarea
                      {...register("whyDeserve")}
                      rows={4}
                      placeholder="Explain how this scholarship will impact your learning journey..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                    {errors.whyDeserve && <p className="text-[11px] text-red-400">{errors.whyDeserve.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white">Review Your Application</h2>
                  <p className="text-xs text-slate-400 mt-1">Please confirm your details before submitting.</p>
                </div>

                <div className="space-y-4 bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex justify-between border-b border-slate-800/80 pb-3">
                    <span className="text-slate-400">Programme:</span>
                    <span className="font-bold text-white">{selectedProg.title}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/80 pb-3">
                    <span className="text-slate-400">Scholarship Breakdown:</span>
                    <span className="font-bold text-emerald-400">90% Covered (-{formatNaira(scholarshipAmount)})</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/80 pb-3">
                    <span className="text-slate-400">Your Fee (Payable ONLY after approval):</span>
                    <span className="font-bold text-orange-400 font-mono text-sm">{formatNaira(studentPays)}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800/80 pb-3">
                    <span className="text-slate-400">Applicant Email:</span>
                    <span className="font-mono text-white">{watch("email")}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-orange-400 mt-0.5" />
                  <p>
                    Applying is 100% free. You will never be asked to pay before your application is officially approved by our admissions team.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CONTROLS BAR */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-800">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={() => setCurrentStep((p) => p - 1)} className="border-slate-800 text-slate-300">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            ) : <div />}

            {currentStep < 4 ? (
              <Button type="button" onClick={validateAndNext} className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold px-6">
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application <Sparkles className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}