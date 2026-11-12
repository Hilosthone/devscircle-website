"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Button } from "@/components/ui/button";
import { loginSchema, LoginFormData } from "@/features/auth/schemas";
import { authApi } from "@/lib/api";
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto-dismiss modal notifications after 3.5 seconds
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const authResult = await authApi.login(data);

      const userRole = (
        authResult?.user?.type ||
        (authResult?.user as any)?.role ||
        (authResult as any)?.role ||
        "STUDENT"
      ).toUpperCase();

      setSuccessMsg("Welcome back! Taking you to your dashboard...");

      // Hard redirect to flush auth state into headers & storage
      setTimeout(() => {
        if (userRole === "ADMIN") {
          window.location.href = "/admin/overview";
        } else if (userRole === "TUTOR") {
          window.location.href = "/tutor/overview";
        } else {
          window.location.href = "/student/overview";
        }
      }, 1000);
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        "Invalid email or password. Please check your details and try again.";
      setErrorMsg(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white relative overflow-hidden">
      <Navbar />

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
              {/* Progress bar timer background */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
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
                  {successMsg ? "Signed In" : "Sign In Failed"}
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

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
        {/* Brand Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-r from-orange-500/20 via-red-600/20 to-transparent blur-[160px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 relative"
        >
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
              Academy Portal
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your email and password to continue learning.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* EMAIL FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* PASSWORD FIELD WITH EYE TOGGLE */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-orange-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* SIGN IN BUTTON */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl border-0 shadow-lg shadow-orange-500/20 transition-all mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/apply" className="text-orange-400 font-semibold hover:underline">
              Apply for Scholarship
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}