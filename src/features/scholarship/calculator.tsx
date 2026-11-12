"use client";

import { useState } from "react";
import { calculateStudentContribution, formatNaira } from "@/lib/utils";

export function ScholarshipCalculator() {
  const [fee, setFee] = useState<number>(50000);
  const { originalFee, scholarshipAmount, studentPays } = calculateStudentContribution(fee);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-10 backdrop-blur-xl shadow-2xl space-y-8">
      <div className="space-y-2 text-center sm:text-left">
        <h3 className="text-xl font-bold text-white">Interactive Fee Calculator</h3>
        <p className="text-xs text-slate-400">
          Adjust the slider to see how the 90% scholarship and ₦10,000 cap apply to any programme fee.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm font-semibold">
          <label htmlFor="programme-fee-slider" className="text-slate-300">Selected Programme Fee:</label>
          <span className="text-orange-400 font-mono text-lg font-bold">{formatNaira(fee)}</span>
        </div>
        <input
          id="programme-fee-slider"
          type="range"
          min="20000"
          max="150000"
          step="10000"
          value={fee}
          onChange={(e) => setFee(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>₦20,000</span>
          <span>₦70,000</span>
          <span>₦150,000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
          <span className="block text-[10px] text-slate-400 uppercase font-mono tracking-wider">Original Fee</span>
          <span className="text-lg font-bold text-slate-300">{formatNaira(originalFee)}</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
          <span className="block text-[10px] text-emerald-400 uppercase font-mono tracking-wider">90% Scholarship</span>
          <span className="text-lg font-bold text-emerald-400">-{formatNaira(scholarshipAmount)}</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-red-500/15 border border-orange-500/30 text-center space-y-1">
          <span className="block text-[10px] text-orange-400 uppercase font-mono tracking-wider">You Pay (Capped)</span>
          <span className="text-2xl font-black text-white">{formatNaira(studentPays)}</span>
        </div>
      </div>
    </div>
  );
}