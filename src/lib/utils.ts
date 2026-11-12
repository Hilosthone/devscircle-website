// // src/lib/utils.ts
// import { clsx, type ClassValue } from "clsx";
// import { twMerge } from "tailwind-merge";

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export interface ScholarshipBreakdown {
//   originalFee: number;
//   scholarshipAmount: number;
//   studentPays: number;
// }

// /**
//  * Calculates student contribution under DevsCircle's 90% scholarship rule:
//  * Student pays 10% of the programme fee, capped at ₦10,000.
//  */
// export function calculateStudentContribution(
//   fee: number,
//   studentPercent = 10,
//   capNaira = 10000
// ): ScholarshipBreakdown {
//   const originalFee = Math.max(0, Number(fee) || 0);
//   const rawContribution = (originalFee * studentPercent) / 100;
//   const studentPays = Math.min(rawContribution, capNaira);
//   const scholarshipAmount = Math.max(0, originalFee - studentPays);

//   return {
//     originalFee,
//     scholarshipAmount,
//     studentPays,
//   };
// }

// /**
//  * Formats a numeric amount in Nigerian Naira (e.g. ₦50,000)
//  */
// export function formatNaira(amount: number): string {
//   const safeAmount = Number(amount) || 0;
//   return new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     maximumFractionDigits: 0,
//   }).format(safeAmount);
// }





// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ScholarshipBreakdown {
  originalFee: number;
  scholarshipAmount: number;
  studentPays: number;
}

/**
 * Calculates student contribution under DevsCircle's scholarship rule:
 * Student pays a flat contribution of ₦10,000 (or the original fee if lower).
 */
export function calculateStudentContribution(
  fee: number,
  flatContribution = 10000
): ScholarshipBreakdown {
  const originalFee = Math.max(0, Number(fee) || 0);
  const studentPays = Math.min(originalFee, flatContribution);
  const scholarshipAmount = Math.max(0, originalFee - studentPays);

  return {
    originalFee,
    scholarshipAmount,
    studentPays,
  };
}

/**
 * Formats a numeric amount in Nigerian Naira (e.g. ₦50,000)
 */
export function formatNaira(amount: number): string {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(safeAmount);
}