import { z } from "zod";

export const applicationSchema = z.object({
  programmeId: z.string().min(1, "Please select a programme"),
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters").max(120),
  email: z.string().email("Enter a valid email address").toLowerCase(),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number (e.g. +2349051772499)"),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State/Province is required"),
  gender: z.enum(["MALE", "FEMALE", "PREFER_NOT_TO_SAY"]).optional(),
  educationalBackground: z.string().min(2, "Please select your educational background"),
  occupation: z.string().min(2, "Occupation is required"),
  previousExperience: z.string().min(1, "Please specify your tech experience level"),
  motivation: z
    .string()
    .min(150, "Tell us a bit more (at least 150 characters)")
    .max(2000, "Motivation cannot exceed 2000 characters"),
  whyDeserve: z
    .string()
    .min(100, "Please explain in at least 100 characters why you deserve this scholarship")
    .max(2000),
  additionalInfo: z.string().max(1000).optional(),
  consent: z.literal(true, {
  message: "You must accept the privacy policy and terms",
}),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;