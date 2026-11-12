export type Programme = {
  id: string;
  slug: string;
  title: string;
  stack?: string;
  description: string;
  whatYouWillLearn: string[];
  tools: string[];
  youWillBuild: string;
  greatFor: string;
  originalFee: number;
  isAvailableNow: boolean;
};

export type UserRole = "ADMIN" | "TUTOR" | "STUDENT";

export type StudentApplication = {
  id: string;
  programmeId: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  motivation: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};