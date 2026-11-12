// src/lib/types/api.ts

export type RoleType = "ADMIN" | "TUTOR" | "STUDENT";

// ==========================================
// 1. AUTHENTICATION & IAM
// ==========================================
export interface UserSummary {
  id: string;
  email: string;
  type: RoleType;
  role?: RoleType;
  permissionsVersion: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

export interface RoleSummary {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  key: string;
  description: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  type: RoleType;
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  totpEnabled: boolean;
  createdAt: string;
  roles: RoleSummary[];
  permissions: string[];
  enrolments: any[];
  tutorAssignments: any[];
}

export interface SessionItem {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

// ==========================================
// 2. AUDIT LOGS
// ==========================================
export interface AuditLogItem {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  diffJson?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ==========================================
// 3. ADMISSIONS & PAYMENTS
// ==========================================
export interface SubmitApplicationPayload {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  programmeSlug: string;
  formData: {
    country: string;
    state: string;
    gender?: string;
    educationalBackground: string;
    occupation: string;
    previousExperience: string;
    motivation: string;
    whyDeserve: string;
    additionalInfo?: string;
  };
}

export interface ApplicationItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  programmeSlug: string;
  status: "PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  formData?: Record<string, any>;
  createdAt: string;
}

// ==========================================
// 4. PROGRAMMES, COHORTS & CLASSES
// ==========================================
export interface ProgrammeModuleItem {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface ProgrammeItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  isPublished?: boolean;
  modules?: ProgrammeModuleItem[];
  pricing?: {
    feeKobo: number;
    studentPercent: number;
    capKobo: number;
  };
}

export interface CohortItem {
  id: string;
  programmeId: string;
  name: string;
  startDate: string;
  endDate: string;
  programme?: ProgrammeItem;
}

export interface TimetableSlotItem {
  id: string;
  cohortId: string;
  moduleId: string;
  tutorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  venue?: string;
}

export interface ClassSessionItem {
  id: string;
  cohortId: string;
  moduleId: string;
  tutorId: string;
  timetableSlotId?: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  joinUrl?: string;
  recordingUrl?: string;
}

// ==========================================
// 5. ATTENDANCE, GRADING & CERTIFICATES
// ==========================================
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceSummaryResponse {
  studentId: string;
  cohortId: string;
  totalSessions: number;
  attendedSessions: number;
  percentage: number;
}

export interface GradeSummaryResponse {
  attendanceScore: number;
  biweeklyTestScore: number;
  assignmentScore: number;
  finalExamScore: number;
  capstoneScore: number;
  finalScore: number;
  gradeBand: string;
  isPassed: boolean;
}

export interface LeaderboardItem {
  rank: number;
  studentId: string;
  studentName: string;
  finalScore: number;
  gradeBand: string;
  isPassed: boolean;
}

export interface CertificateItem {
  id: string;
  code: string;
  studentId: string;
  programmeId: string;
  pdfUrl: string;
  pdfHash: string;
  status: "VALID" | "REVOKED";
  revocationReason: string | null;
  issuedAt: string;
}

export interface VerifyCertificateResponse {
  code: string;
  recipientName: string;
  programmeName: string;
  pdfUrl: string;
  pdfHash: string;
  issuedAt: string;
  isValid: boolean;
  revocationReason: string | null;
}

// ==========================================
// 6. ASSESSMENTS, TESTS & CAPSTONE
// ==========================================
export interface AssignmentItem {
  id: string;
  cohortId: string;
  moduleId: string;
  title: string;
  instructions: string;
  maxScore: number;
  weightage: number;
  dueDate: string;
}

export interface TestItem {
  id: string;
  cohortId: string;
  title: string;
  kind: "BIWEEKLY_TEST" | "FINAL_EXAM";
  durationMinutes: number;
  windowStartsAt: string;
  windowClosesAt: string;
  weightPercentage: number;
  isPublished?: boolean;
}

export interface CapstoneProjectItem {
  id: string;
  cohortId: string;
  title: string;
  description: string;
  rubricJson: Record<string, number>;
  dueDate: string;
}

export interface CapstoneSubmissionItem {
  id: string;
  projectId: string;
  studentId: string;
  repoUrl: string;
  liveUrl?: string;
  score?: number;
  feedbackJson?: Record<string, any>;
  submittedAt: string;
}

// ==========================================
// 7. NOTIFICATIONS & ANNOUNCEMENTS
// ==========================================
export interface AnnouncementItem {
  id: string;
  cohortId?: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface UserNotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}