// src/app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ApiErrorListener } from "@/components/common/api-error-listener";
import { Loader2 } from "lucide-react";
import { RoleType } from "@/lib/types/api";

const PATH_PERMISSION_MAP: Array<{ prefix: string; permission: string }> = [
  // Admin Routes
  { prefix: "/admin/applications", permission: "applications.view" },
  { prefix: "/admin/programmes", permission: "programmes.manage" },
  { prefix: "/admin/cohorts", permission: "cohorts.manage" },
  { prefix: "/admin/students", permission: "students.view" },
  { prefix: "/admin/tutors", permission: "tutors.manage" },
  { prefix: "/admin/classes", permission: "classes.manage" },
  { prefix: "/admin/grading", permission: "assessments.grade" },
  { prefix: "/admin/assessments", permission: "assessments.grade" },
  { prefix: "/admin/announcements", permission: "notifications.send" },
  { prefix: "/admin/payments", permission: "payments.reconcile" },
  { prefix: "/admin/certificates", permission: "certificates.issue" },
  { prefix: "/admin/iam", permission: "iam.manage" },
  { prefix: "/admin/audit-logs", permission: "audit.view" },

  // Tutor Routes
  { prefix: "/tutor/overview", permission: "attendance.mark" },
  { prefix: "/tutor/classes", permission: "attendance.mark" },
  { prefix: "/tutor/attendance", permission: "attendance.mark" },
  { prefix: "/tutor/evaluations", permission: "assessments.grade" },
  { prefix: "/tutor/assessments", permission: "assessments.grade" },
  { prefix: "/tutor/students", permission: "students.view" },
  { prefix: "/tutor/grading", permission: "assessments.grade" },
  { prefix: "/tutor/schedule", permission: "attendance.mark" },
];

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginRoute = pathname === "/admin/login" || pathname === "/login";

  // 1. Infer base required role from URL prefix
  let requiredRole: RoleType | undefined = undefined;
  if (!isLoginRoute) {
    if (pathname.startsWith("/admin")) requiredRole = "ADMIN";
    else if (pathname.startsWith("/tutor")) requiredRole = "TUTOR";
    else requiredRole = "STUDENT";
  }

  // 2. Match delegated IAM permission if route supports custom role access
  const matchedPermission = PATH_PERMISSION_MAP.find((entry) =>
    pathname.startsWith(entry.prefix)
  )?.permission;

  const { user, isLoading } = useAuth(requiredRole, matchedPermission);

  if (isLoginRoute) {
    return (
      <>
        {children}
        <ApiErrorListener />
      </>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const resolvedRole = (
    user.type ||
    user.role ||
    requiredRole ||
    "STUDENT"
  ).toUpperCase() as RoleType;

  return (
    <>
      <DashboardLayout role={resolvedRole} userEmail={user.email}>
        {children}
      </DashboardLayout>
      <ApiErrorListener />
    </>
  );
}