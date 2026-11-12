"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { loginSchema, LoginFormData } from "@/features/auth/schemas";
import { authApi } from "@/lib/api";
import {
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
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

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const authResult = await authApi.login(data);

      setSuccessMsg("Admin authentication verified! Redirecting to Management Console...");

      setTimeout(() => {
        router.push("/admin/overview");
      }, 1000);
    } catch (err: any) {
      const serverMessage =
        err.response?.data?.message ||
        "Invalid admin credentials or insufficient administrative privileges.";
      setErrorMsg(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative overflow-hidden px-4">
      {/* Brand Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-red-600/20 via-orange-500/20 to-transparent blur-[160px] pointer-events-none" />

      {/* ALERT MODAL */}
      <AnimatePresence>
        {(errorMsg || successMsg) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl backdrop-blur-2xl space-y-4 relative ${
                successMsg
                  ? "bg-slate-900/90 border-orange-500/40 shadow-orange-500/10"
                  : "bg-slate-900/90 border-red-500/40 shadow-red-500/10"
              }`}
            >
              <button
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    successMsg
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {successMsg ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                </div>

                <div className="space-y-1 pr-6">
                  <h3 className="font-bold text-white text-base">
                    {successMsg ? "Access Granted" : "Admin Authentication Error"}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {successMsg || errorMsg}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white pt-2">Admin Command Console</h1>
          <p className="text-xs text-slate-400">
            Restricted access portal for admissions, finance, and system operations.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                {...register("email")}
                type="email"
                placeholder="admin@devscircle.org"
                className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Secret Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying Admin...
              </>
            ) : (
              "Authenticate Admin Console"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}