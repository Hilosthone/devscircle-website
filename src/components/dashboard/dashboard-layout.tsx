// src/components/dashboard/dashboard-layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SITE_CONFIG } from "@/lib/constants";
import { authApi } from "@/lib/api";
import { RoleType } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X,
  Trophy,
  FileCheck2,
  CalendarCheck,
  Award,
  Calendar,
  UserCheck,
  ShieldCheck,
  FileText,
  Video,
  User,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  baseRoles: RoleType[];
  requiredPermission?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  // ==========================
  // STUDENT PORTAL
  // ==========================
  { label: "Overview", href: "/student/overview", icon: LayoutDashboard, baseRoles: ["STUDENT"] },
  { label: "Live Classes", href: "/student/classes", icon: Video, baseRoles: ["STUDENT"] },
  { label: "Assignments", href: "/student/assessments/assignments", icon: FileText, baseRoles: ["STUDENT"] },
  { label: "Bi-Weekly Tests", href: "/student/assessments/tests", icon: BookOpen, baseRoles: ["STUDENT"] },
  { label: "Final Exam & Capstone", href: "/student/assessments/final-exam", icon: GraduationCap, baseRoles: ["STUDENT"] },
  { label: "Grades & Leaderboard", href: "/student/grades", icon: Trophy, baseRoles: ["STUDENT"] },
  { label: "Certificates", href: "/student/certificates", icon: Award, baseRoles: ["STUDENT"] },
  { label: "My Profile", href: "/student/profile", icon: User, baseRoles: ["STUDENT"] },

  // ==========================
  // TUTOR PORTAL
  // ==========================
  { label: "Overview", href: "/tutor/overview", icon: LayoutDashboard, baseRoles: ["TUTOR"] },
  { label: "Live Classes", href: "/tutor/classes", icon: Video, baseRoles: ["TUTOR"] },
  {
    label: "Attendance Register",
    href: "/tutor/attendance",
    icon: CalendarCheck,
    baseRoles: ["TUTOR"],
    requiredPermission: "attendance.mark",
  },
  {
    label: "Evaluations & Grading",
    href: "/tutor/evaluations",
    icon: FileCheck2,
    baseRoles: ["TUTOR"],
    requiredPermission: "assessments.grade",
  },
  {
    label: "Coursework Builder",
    href: "/tutor/assessments",
    icon: FileText,
    baseRoles: ["TUTOR"],
    requiredPermission: "assessments.grade",
  },
  {
    label: "Student Directory",
    href: "/tutor/students",
    icon: Users,
    baseRoles: ["TUTOR"],
    requiredPermission: "students.view",
  },
  {
    label: "Grading Leaderboard",
    href: "/tutor/grading",
    icon: Trophy,
    baseRoles: ["TUTOR"],
    requiredPermission: "assessments.grade",
  },
  {
    label: "Timetable Grid",
    href: "/tutor/schedule",
    icon: Calendar,
    baseRoles: ["TUTOR"],
  },
  { label: "Faculty Profile", href: "/tutor/profile", icon: User, baseRoles: ["TUTOR"] },

  // ==========================
  // ADMIN PORTAL
  // ==========================
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard, baseRoles: ["ADMIN"] },
  {
    label: "Admissions Queue",
    href: "/admin/applications",
    icon: GraduationCap,
    baseRoles: ["ADMIN"],
    requiredPermission: "applications.view",
  },
  {
    label: "Programmes",
    href: "/admin/programmes",
    icon: BookOpen,
    baseRoles: ["ADMIN"],
    requiredPermission: "programmes.manage",
  },
  {
    label: "Cohort Batches",
    href: "/admin/cohorts",
    icon: Calendar,
    baseRoles: ["ADMIN"],
    requiredPermission: "cohorts.manage",
  },
  {
    label: "Enrolled Students",
    href: "/admin/students",
    icon: Users,
    baseRoles: ["ADMIN"],
    requiredPermission: "students.view",
  },
  {
    label: "Tutor Assignments",
    href: "/admin/tutors",
    icon: UserCheck,
    baseRoles: ["ADMIN"],
    requiredPermission: "cohorts.manage",
  },
  {
    label: "Live Classes",
    href: "/admin/classes",
    icon: Video,
    baseRoles: ["ADMIN"],
    requiredPermission: "cohorts.manage",
  },
  {
    label: "Assessments Hub",
    href: "/admin/assessments",
    icon: FileText,
    baseRoles: ["ADMIN"],
    requiredPermission: "assessments.grade",
  },
  {
    label: "Cohort Grading",
    href: "/admin/grading",
    icon: Trophy,
    baseRoles: ["ADMIN"],
    requiredPermission: "assessments.grade",
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: FileCheck2,
    baseRoles: ["ADMIN"],
    requiredPermission: "notifications.send",
  },
  {
    label: "Manual Payments",
    href: "/admin/payments",
    icon: CreditCard,
    baseRoles: ["ADMIN"],
    requiredPermission: "payments.reconcile",
  },
  {
    label: "Issue Certificates",
    href: "/admin/certificates",
    icon: Award,
    baseRoles: ["ADMIN"],
    requiredPermission: "certificates.issue",
  },
  {
    label: "Roles & IAM",
    href: "/admin/iam",
    icon: ShieldCheck,
    baseRoles: ["ADMIN"],
    requiredPermission: "iam.manage",
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
    baseRoles: ["ADMIN"],
    requiredPermission: "audit.view",
  },
  { label: "Admin Profile", href: "/admin/profile", icon: User, baseRoles: ["ADMIN"] },
];

export function DashboardLayout({
  children,
  role,
  userEmail,
}: {
  children: React.ReactNode;
  role: RoleType | string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);

  const normalizedRole = (
    typeof role === "string" ? role.toUpperCase() : "STUDENT"
  ) as RoleType;

  useEffect(() => {
    authApi
      .getMe()
      .then((profile) => {
        if (Array.isArray(profile?.permissions)) {
          setPermissions(profile.permissions);
        }
      })
      .catch(() => {
        // Keeps base role links if offline
      });
  }, []);

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (normalizedRole === "ADMIN") {
      return item.baseRoles.includes("ADMIN");
    }
    const isBaseTab = item.baseRoles.includes(normalizedRole);
    const hasPermission =
      Boolean(item.requiredPermission) &&
      permissions.includes(item.requiredPermission!);

    return isBaseTab || hasPermission;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={SITE_CONFIG.logoPath}
              alt={SITE_CONFIG.name}
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs tracking-tight">
                {SITE_CONFIG.name}
              </span>
              <span className="text-[10px] text-orange-400 font-mono font-bold uppercase">
                {normalizedRole} Portal
              </span>
            </div>
          </Link>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (!item.href.endsWith("/overview") && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/20 via-red-500/10 to-transparent text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/5"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-orange-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          {userEmail && (
            <div className="px-1 text-[11px] text-slate-400 font-mono truncate">
              {userEmail}
            </div>
          )}
          <Button
            onClick={() => authApi.logout()}
            variant="outline"
            className="w-full border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs h-9 justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* MOBILE SIDEBAR & NAVBAR */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden h-16 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={SITE_CONFIG.logoPath}
              alt={SITE_CONFIG.name}
              width={28}
              height={28}
              className="h-7 w-auto"
            />
            <span className="font-bold text-white text-xs">{SITE_CONFIG.name}</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-slate-400"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {mobileOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive
                      ? "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                      : "text-slate-300 hover:text-orange-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Button
              onClick={() => authApi.logout()}
              variant="ghost"
              className="w-full justify-start text-xs text-red-400 hover:bg-red-500/10 mt-2"
            >
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        )}

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}