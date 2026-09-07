"use client";

import { useState, useTransition } from "react";
import { updateCompanyInfo } from "@/app/(dashboard)/company-info/actions";

type Info = {
  id: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  xUrl: string | null;
  youtubeUrl: string | null;
  founderName: string | null;
};

const FIELDS: { key: keyof Omit<Info, "id">; label: string; sendAs: string; hint?: string }[] = [
  { key: "phone", label: "Phone (display format)", sendAs: "phone", hint: "e.g. +256 700 000 000" },
  { key: "whatsapp", label: "WhatsApp number (digits only)", sendAs: "whatsapp", hint: "e.g. 256700000000, no + or spaces" },
  { key: "email", label: "Email", sendAs: "email" },
  { key: "instagramUrl", label: "Instagram URL", sendAs: "instagram_url" },
  { key: "facebookUrl", label: "Facebook URL", sendAs: "facebook_url" },
  { key: "xUrl", label: "X (Twitter) URL", sendAs: "x_url" },
  { key: "youtubeUrl", label: "YouTube URL", sendAs: "youtube_url" },
  { key: "founderName", label: "Founder name", sendAs: "founder_name" },
];

export default function CompanyInfoForm({ info }: { info: Info }) {
  const [, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, info[f.key] ?? ""]))
  );

  function saveField(sendAs: string, value: string) {
    startTransition(() => updateCompanyInfo(info.id, sendAs, value));
  }

  return (
    <div className="grid gap-4 max-w-xl">
      {FIELDS.map((f) => (
        <div key={f.key} className="bg-white rounded border border-black/10 px-3 py-2.5">
          <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">{f.label}</span>
          <input
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            onBlur={(e) => saveField(f.sendAs, e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
          />
          {f.hint && <span className="block text-[11px] text-[#9C9575] mt-1">{f.hint}</span>}
        </div>
      ))}
    </div>
  );
}
