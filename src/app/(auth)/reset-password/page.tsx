//src/app/(auth)/reset-password/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
} from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMsg("Reset token is missing or invalid. Please request a new reset link.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await authApi.resetPassword({
        token,
        newPassword: data.password,
      });
      setCompleted(true);
      setSuccessMsg("Your password has been updated. Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const normalized = extractApiError(err);
      setErrorMsg(
        normalized.message ||
          "This reset link may have expired or already been used. Please request a new one."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* AUTO-DISMISSING TOAST NOTIFICATION */}
      <AnimatePresence>
        {(errorMsg || successMsg) && (
          <div className="fixed top-6 right-6 z-50 max-w-md w-full px-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3 relative overflow-hidden ${
                successMsg
                  ? "bg-slate-900/95 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10"
                  : "bg-slate-900/95 border-red-500/40 text-red-400 shadow-red-500/10"
              }`}
            >
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 4, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${
                  successMsg ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  successMsg
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {successMsg ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 pr-6 pt-0.5">
                <h4 className="font-bold text-white text-sm">
                  {successMsg ? "Password Updated" : "Reset Failed"}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {successMsg || errorMsg}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!token ? (
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-red-500/30 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Invalid or Expired Link</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No valid reset token was found in this link. Please request a fresh password reset email.
            </p>
          </div>
          <Link href="/forgot-password" className="block">
            <Button className="w-full h-10 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs rounded-xl border-0">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      ) : completed ? (
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-emerald-500/30 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Password Reset Complete</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your new password is active. Taking you back to the sign-in screen...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* NEW PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your new password"
                className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl border-0 shadow-lg shadow-orange-500/20 transition-all mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-r from-orange-500/20 via-red-600/20 to-transparent blur-[160px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 relative"
        >
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Set New Password
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Create a New Password
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose a strong password with at least 8 characters to secure your account.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            }
          >
            <ResetPasswordContent />
          </Suspense>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}