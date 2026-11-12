// src/app/(public)/programmes/[slug]/page.tsx
"use client";

import { use } from "react";

export default function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = "then" in params ? use(params) : params;
  const { slug } = resolvedParams;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-2xl font-bold">Programme Detail: {slug}</h1>
    </div>
  );
}