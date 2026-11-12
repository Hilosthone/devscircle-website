import { apiClient } from "./api-client";
import {
  AuthResponse,
  SubmitApplicationPayload,
  ApplicationItem,
  VerifyCertificateResponse,
  GradeSummaryResponse,
  LeaderboardItem,
  RoleType,
} from "./types/api";
import { ApplicationFormData } from "@/features/applications/schemas";
import { LoginFormData } from "@/features/auth/schemas";

const unwrap = <T = any>(res: any): T => res?.data?.data ?? res?.data;

const persistSession = (payload: any): AuthResponse => {
  if (!payload || !payload.accessToken) {
    throw new Error("Invalid response structure from authentication server.");
  }

  const rawRole =
    payload.user?.type ||
    payload.user?.role ||
    payload.role ||
    "STUDENT";

  const extractedRole = rawRole.toUpperCase() as RoleType;

  const normalizedUser = {
    ...payload.user,
    type: extractedRole,
    role: extractedRole,
  };

  const normalizedAuthResponse: AuthResponse = {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: normalizedUser,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    localStorage.setItem("dc_access_token", payload.accessToken);
    localStorage.setItem("dc_refresh_token", payload.refreshToken);
    localStorage.setItem("dc_user", JSON.stringify(normalizedUser));
  }

  return normalizedAuthResponse;
};

// ==========================================
// 1. SYSTEM HEALTH & AUDIT LOGS
// ==========================================
export const systemApi = {
  getInfo: async () => unwrap(await apiClient.get("/")),
  checkLive: async () => unwrap(await apiClient.get("/health/live")),
  checkReady: async () => unwrap(await apiClient.get("/health/ready")),
};

export const auditLogsApi = {
  list: async (params?: {
    entity?: string;
    entityId?: string;
    action?: string;
    actorId?: string;
    page?: number;
    limit?: number;
  }) => unwrap(await apiClient.get("/audit-logs", { params })),

  getById: async (id: string) => unwrap(await apiClient.get(`/audit-logs/${id}`)),
};

// ==========================================
// 2. IDENTITY & ACCESS MANAGEMENT (IAM)
// ==========================================
export const iamApi = {
  listPermissions: async () => unwrap(await apiClient.get("/iam/permissions")),

  listRoles: async () => unwrap(await apiClient.get("/iam/roles")),

  createRole: async (payload: {
    name: string;
    description?: string;
    permissionIds: string[];
  }) => unwrap(await apiClient.post("/iam/roles", payload)),

  updateRolePermissions: async (roleId: string, permissionIds: string[]) =>
    unwrap(await apiClient.put(`/iam/roles/${roleId}/permissions`, { permissionIds })),

  provisionUser: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    type: RoleType;
    roleIds?: string[];
  }) => unwrap(await apiClient.post("/iam/users", payload)),

  assignRoleToUser: async (userId: string, roleId: string) =>
    unwrap(await apiClient.post(`/iam/users/${userId}/roles`, { roleId })),

  removeRoleFromUser: async (userId: string, roleId: string) =>
    unwrap(await apiClient.delete(`/iam/users/${userId}/roles/${roleId}`)),
};

// ==========================================
// 3. AUTHENTICATION & SECURITY
// ==========================================
export const authApi = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/login", credentials);
    return persistSession(unwrap(res));
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/refresh", { refreshToken });
    return persistSession(unwrap(res));
  },

  logout: async (): Promise<void> => {
    if (typeof window !== "undefined") {
      const refreshToken =
        localStorage.getItem("refreshToken") ||
        localStorage.getItem("dc_refresh_token");

      if (refreshToken) {
        try {
          await apiClient.post("/auth/logout", { refreshToken });
        } catch (err) {
          console.error("Logout notification failed:", err);
        }
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      localStorage.removeItem("dc_access_token");
      localStorage.removeItem("dc_refresh_token");
      localStorage.removeItem("dc_user");

      window.location.href = "/login";
    }
  },

  getMe: async () => unwrap(await apiClient.get("/auth/me")),

  forgotPassword: async (email: string) =>
    unwrap(await apiClient.post("/auth/forgot-password", { email })),

  resetPassword: async (payload: { token: string; newPassword: string }) =>
    unwrap(await apiClient.post("/auth/reset-password", payload)),

  setup2FA: async () => unwrap(await apiClient.post("/auth/2fa/setup")),

  enable2FA: async (code: string) =>
    unwrap(await apiClient.post("/auth/2fa/enable", { code })),

  listSessions: async () => unwrap(await apiClient.get("/auth/sessions")),

  revokeOtherSessions: async () => unwrap(await apiClient.delete("/auth/sessions")),

  revokeSessionById: async (sessionId: string) =>
    unwrap(await apiClient.delete(`/auth/sessions/${sessionId}`)),
};

// ==========================================
// 4. ADMISSIONS PIPELINE
// ==========================================
export const applicationsApi = {
  submit: async (formValues: ApplicationFormData, programmeSlug: string) => {
    const nameParts = formValues.fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || nameParts[0];

    const payload: SubmitApplicationPayload = {
      email: formValues.email,
      firstName,
      lastName,
      phoneNumber: formValues.phone,
      programmeSlug,
      formData: {
        country: formValues.country,
        state: formValues.state,
        gender: formValues.gender,
        educationalBackground: formValues.educationalBackground,
        occupation: formValues.occupation,
        previousExperience: formValues.previousExperience,
        motivation: formValues.motivation,
        whyDeserve: formValues.whyDeserve,
        additionalInfo: formValues.additionalInfo,
      },
    };

    return unwrap(await apiClient.post("/applications", payload));
  },

  list: async (status?: string): Promise<ApplicationItem[]> =>
    unwrap(await apiClient.get("/applications", { params: { status } })),

  getById: async (id: string): Promise<ApplicationItem> =>
    unwrap(await apiClient.get(`/applications/${id}`)),

  review: async (id: string) =>
    unwrap(await apiClient.post(`/applications/${id}/review`)),

  decision: async (id: string, status: "APPROVED" | "REJECTED", reason: string) =>
    unwrap(
      await apiClient.post(`/applications/${id}/decision`, {
        status,
        reason,
      })
    ),
};

// ==========================================
// 5. PAYMENTS & WEBHOOKS
// ==========================================
export const paymentsApi = {
  initialize: async (applicationId: string) =>
    unwrap(await apiClient.post("/payments/initialize", { applicationId })),

  getStatus: async (reference: string) =>
    unwrap(await apiClient.get(`/payments/${reference}`)),

  manualReconcile: async (id: string, evidenceNote: string, approverId: string) =>
    unwrap(
      await apiClient.post(`/payments/${id}/manual-reconcile`, {
        evidenceNote,
        approverId,
      })
    ),
};

// ==========================================
// 6. PROGRAMMES & CURRICULUM
// ==========================================
export const programmesApi = {
  getPublicList: async () => unwrap(await apiClient.get("/programmes/public")),

  getPublicBySlug: async (slug: string) =>
    unwrap(await apiClient.get(`/programmes/public/${slug}`)),

  create: async (payload: { slug: string; name: string; description: string }) =>
    unwrap(await apiClient.post("/programmes", payload)),

  addModule: async (
    programmeId: string,
    payload: { title: string; description: string; orderIndex: number }
  ) => unwrap(await apiClient.post(`/programmes/${programmeId}/modules`, payload)),

  configurePricing: async (
    programmeId: string,
    payload: { feeKobo: number; studentPercent: number; capKobo: number }
  ) => unwrap(await apiClient.post(`/programmes/${programmeId}/pricing`, payload)),

  togglePublish: async (programmeId: string) =>
    unwrap(await apiClient.patch(`/programmes/${programmeId}/publish`)),
};

// ==========================================
// 7. COHORTS & TUTOR ASSIGNMENTS
// ==========================================
export const cohortsApi = {
  create: async (payload: {
    programmeId: string;
    name: string;
    startDate: string;
    endDate: string;
  }) => unwrap(await apiClient.post("/cohorts", payload)),

  list: async () => unwrap(await apiClient.get("/cohorts")),

  getById: async (id: string) => unwrap(await apiClient.get(`/cohorts/${id}`)),

  getEnrolments: async (id: string) =>
    unwrap(await apiClient.get(`/cohorts/${id}/enrolments`)),

  getTutors: async (id: string) =>
    unwrap(await apiClient.get(`/cohorts/${id}/tutors`)),

  assignTutor: async (payload: {
    tutorId: string;
    programmeId: string;
    cohortId: string;
    moduleId?: string;
  }) => unwrap(await apiClient.post("/cohorts/tutor-assignments", payload)),
};

// ==========================================
// 8. CLASSES & TIMETABLE
// ==========================================
export const classesApi = {
  createTimetableSlot: async (payload: {
    cohortId: string;
    moduleId: string;
    tutorId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    venue?: string;
  }) => unwrap(await apiClient.post("/classes/timetable/slots", payload)),

  getTimetableGrid: async (cohortId: string) =>
    unwrap(await apiClient.get("/classes/timetable/grid", { params: { cohortId } })),

  deleteTimetableSlot: async (slotId: string) =>
    unwrap(await apiClient.delete(`/classes/timetable/slots/${slotId}`)),

  scheduleClass: async (payload: {
    cohortId: string;
    moduleId: string;
    tutorId: string;
    timetableSlotId?: string;
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    joinUrl?: string;
  }) => unwrap(await apiClient.post("/classes", payload)),

  getTimetableFeed: async (cohortId: string) =>
    unwrap(await apiClient.get("/classes/timetable", { params: { cohortId } })),

  getTutorSchedule: async () =>
    unwrap(await apiClient.get("/classes/tutor/my-schedule")),

  getById: async (id: string) => unwrap(await apiClient.get(`/classes/${id}`)),

  updateClass: async (
    id: string,
    payload: {
      cohortId?: string;
      moduleId?: string;
      tutorId?: string;
      timetableSlotId?: string;
      title?: string;
      description?: string;
      startsAt?: string;
      endsAt?: string;
      joinUrl?: string;
    }
  ) => unwrap(await apiClient.put(`/classes/${id}`, payload)),

  deleteClass: async (id: string) => unwrap(await apiClient.delete(`/classes/${id}`)),

  attachRecording: async (
    classId: string,
    payload: { videoUrl: string; duration: number }
  ) => unwrap(await apiClient.post(`/classes/${classId}/recordings`, payload)),
};

// ==========================================
// 9. ATTENDANCE TRACKING
// ==========================================
export const attendanceApi = {
  bulkMark: async (
    classId: string,
    records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" }>
  ) => unwrap(await apiClient.put(`/classes/${classId}/attendance`, { records })),

  correctRecord: async (
    recordId: string,
    payload: { newStatus: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; reason: string }
  ) => unwrap(await apiClient.patch(`/attendance/${recordId}`, payload)),

  getSummary: async (studentId: string, cohortId: string) =>
    unwrap(
      await apiClient.get("/attendance/summary", {
        params: { studentId, cohortId },
      })
    ),
};

// ==========================================
// 10. GRADING & LEADERBOARD
// ==========================================
export const gradingApi = {
  computeStudentGrade: async (studentId: string, cohortId: string) =>
    unwrap(
      await apiClient.post(`/grading/students/${studentId}/compute`, null, {
        params: { cohortId },
      })
    ),

  batchComputeCohortGrades: async (cohortId: string) =>
    unwrap(await apiClient.post(`/grading/cohorts/${cohortId}/compute-all`)),

  getMyResults: async (cohortId?: string): Promise<GradeSummaryResponse> =>
    unwrap(
      await apiClient.get("/grading/my-results", {
        params: { cohortId },
      })
    ),

  getLeaderboard: async (cohortId: string): Promise<LeaderboardItem[]> =>
    unwrap(
      await apiClient.get("/grading/leaderboard", {
        params: { cohortId },
      })
    ),

  adjustLeaderboard: async (payload: {
    studentId: string;
    points: number;
    reason: string;
  }) => unwrap(await apiClient.post("/grading/leaderboard/adjust", payload)),
};

// ==========================================
// 11. CERTIFICATES & VERIFICATION
// ==========================================
export const certificatesApi = {
  issue: async (studentId: string, cohortId: string) =>
    unwrap(await apiClient.post("/certificates/issue", { studentId, cohortId })),

  getMyCertificates: async () =>
    unwrap(await apiClient.get("/certificates/my-certificates")),

  revoke: async (certificateId: string, reason: string) =>
    unwrap(await apiClient.patch(`/certificates/${certificateId}/revoke`, { reason })),

  verify: async (code: string): Promise<VerifyCertificateResponse> =>
    unwrap(await apiClient.get(`/certificates/verify/${code}`)),
};

// ==========================================
// 12. ASSESSMENTS & ASSIGNMENTS
// ==========================================
export const assessmentsApi = {
  createAssignment: async (payload: {
    cohortId: string;
    moduleId: string;
    title: string;
    instructions: string;
    maxScore: number;
    weightage: number;
    dueDate: string;
  }) => unwrap(await apiClient.post("/assessments/assignments", payload)),

  listAssignments: async (cohortId: string) =>
    unwrap(await apiClient.get("/assessments/assignments", { params: { cohortId } })),

  submitAssignment: async (
    assignmentId: string,
    payload: { submissionUrl: string; notes?: string }
  ) =>
    unwrap(
      await apiClient.post(`/assessments/assignments/${assignmentId}/submit`, payload)
    ),

  gradeSubmission: async (
    submissionId: string,
    payload: { score: number; feedback: string }
  ) =>
    unwrap(
      await apiClient.put(`/assessments/submissions/${submissionId}/grade`, payload)
    ),

  listSubmissions: async (studentId: string, cohortId: string) =>
    unwrap(
      await apiClient.get("/assessments/submissions", {
        params: { studentId, cohortId },
      })
    ),
};

// ==========================================
// 13. TESTS & ONLINE EXAMINATIONS
// ==========================================
export const testsApi = {
  list: async (params?: {
    cohortId?: string;
    kind?: "BIWEEKLY_TEST" | "FINAL_EXAM";
    status?: "ALL" | "UPCOMING" | "ACTIVE" | "COMPLETED";
    page?: number;
    limit?: number;
  }) => unwrap(await apiClient.get("/tests", { params })),

  create: async (payload: {
    cohortId: string;
    title: string;
    kind: "BIWEEKLY_TEST" | "FINAL_EXAM";
    durationMinutes: number;
    windowStartsAt: string;
    windowClosesAt: string;
    weightPercentage: number;
  }) => unwrap(await apiClient.post("/tests", payload)),

  publish: async (testId: string) =>
    unwrap(await apiClient.patch(`/tests/${testId}/publish`)),

  addQuestion: async (
    testId: string,
    payload: {
      text: string;
      type: string;
      points: number;
      orderIndex: number;
      explanation?: string;
      options?: Array<{ text: string; isCorrect: boolean }>;
    }
  ) => unwrap(await apiClient.post(`/tests/${testId}/questions`, payload)),

  startAttempt: async (testId: string) =>
    unwrap(await apiClient.post(`/tests/${testId}/start`)),

  getAttempt: async (attemptId: string) =>
    unwrap(await apiClient.get(`/tests/attempts/${attemptId}`)),

  submitAttempt: async (
    attemptId: string,
    responses: Array<{
      questionId: string;
      selectedOptionId?: string;
      responseText?: string;
    }>
  ) =>
    unwrap(
      await apiClient.post(`/tests/attempts/${attemptId}/submit`, { responses })
    ),

  getById: async (testId: string) => unwrap(await apiClient.get(`/tests/${testId}`)),
};

// ==========================================
// 14. CAPSTONE PROJECTS & EVALUATIONS
// ==========================================
export const capstoneApi = {
  createProject: async (payload: {
    cohortId: string;
    title: string;
    description: string;
    rubricJson: Record<string, any>;
    dueDate: string;
  }) => unwrap(await apiClient.post("/capstone/projects", payload)),

  listProjects: async (cohortId: string) =>
    unwrap(await apiClient.get("/capstone/projects", { params: { cohortId } })),

  submitProject: async (
    projectId: string,
    payload: { repoUrl: string; liveUrl?: string }
  ) =>
    unwrap(await apiClient.post(`/capstone/projects/${projectId}/submit`, payload)),

  evaluateSubmission: async (
    submissionId: string,
    payload: { score: number; feedbackJson: Record<string, any> }
  ) =>
    unwrap(
      await apiClient.post(`/capstone/submissions/${submissionId}/evaluate`, payload)
    ),

  listProjectSubmissions: async (projectId: string) =>
    unwrap(await apiClient.get(`/capstone/projects/${projectId}/submissions`)),
};

// ==========================================
// 15. NOTIFICATIONS & ANNOUNCEMENTS
// ==========================================
export const notificationsApi = {
  createAnnouncement: async (payload: {
    cohortId?: string;
    title: string;
    content: string;
    sendEmail?: boolean;
  }) => unwrap(await apiClient.post("/notifications/announcements", payload)),

  listAnnouncements: async (cohortId?: string) =>
    unwrap(
      await apiClient.get("/notifications/announcements", {
        params: { cohortId },
      })
    ),

  getUserNotifications: async (userId: string) =>
    unwrap(await apiClient.get(`/notifications/user/${userId}`)),

  markAsRead: async (notificationId: string) =>
    unwrap(await apiClient.patch(`/notifications/${notificationId}/read`)),
};