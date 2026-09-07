"use client";

import { useState, useTransition } from "react";
import {
  updateJournalField,
  deleteJournalPost,
  publishJournalPost,
  unpublishJournalPost,
} from "@/app/(dashboard)/journal/actions";
import { useRouter } from "next/navigation";

// Matches the public site's TOPIC_IDS (src/components/pages/JournalPage.tsx), minus "all".
const CATEGORIES = ["road-reports", "planning", "driving", "where-to-stay", "routes", "kit", "traveller-stories"];

type Post = {
  id: string;
  slug: string;
  title: string;
  category: string;
  blurb: string | null;
  body: string | null;
  coverImageUrl: string | null;
  minRead: number;
  publishedAt: string | null;
};

export default function JournalDetail({ post }: { post: Post }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [fields, setFields] = useState({
    title: post.title,
    slug: post.slug,
    category: post.category,
    blurb: post.blurb ?? "",
    body: post.body ?? "",
    min_read: post.minRead,
  });

  function save(field: string, value: string | number) {
    startTransition(() => updateJournalField(post.id, field, value));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      startTransition(() => updateJournalField(post.id, "cover_image_url", url));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <input
          value={fields.title}
          onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
          onBlur={(e) => save("title", e.target.value)}
          className="font-display font-semibold text-2xl bg-transparent outline-none border-b border-transparent focus:border-black/20 flex-1 min-w-0"
        />
        <div className="flex items-center gap-3 shrink-0">
          {post.publishedAt ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => unpublishJournalPost(post.id))}
              className="text-[12px] font-medium text-[#8A8368] hover:underline"
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => publishJournalPost(post.id))}
              className="text-[12px] font-medium text-[#1E3A2B] hover:underline"
            >
              Publish
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete "${post.title}"?`)) {
                startTransition(async () => {
                  await deleteJournalPost(post.id);
                  router.push("/journal");
                });
              }
            }}
            className="text-[12px] text-[#B23B2E] hover:underline"
          >
            Delete
          </button>
        </div>
      </div>

      <span className="text-[12px]" style={{ color: post.publishedAt ? "#6B7A6F" : "#D2541B" }}>
        {post.publishedAt ? `Published ${new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "Draft — not shown on the public site"}
      </span>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
        <Field label="Slug">
          <input
            value={fields.slug}
            onChange={(e) => setFields((f) => ({ ...f, slug: e.target.value }))}
            onBlur={(e) => save("slug", e.target.value)}
            className="w-full bg-transparent outline-none font-mono text-[13px]"
          />
        </Field>
        <Field label="Category">
          <select
            value={fields.category}
            onChange={(e) => {
              setFields((f) => ({ ...f, category: e.target.value }));
              save("category", e.target.value);
            }}
            className="w-full bg-transparent outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Min read">
          <input
            type="number"
            value={fields.min_read}
            onChange={(e) => setFields((f) => ({ ...f, min_read: Number(e.target.value) }))}
            onBlur={(e) => save("min_read", Number(e.target.value))}
            className="w-full bg-transparent outline-none font-mono"
          />
        </Field>
      </div>

      <div className="bg-white rounded border border-black/10 p-4 flex flex-col gap-3">
        <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono">Cover image</span>
        <div className="flex items-center gap-4">
          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt="" className="w-32 h-20 object-cover rounded border border-black/10" />
          )}
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
              className="text-[13px]"
            />
            {uploading && <span className="text-[12px] text-[#6B7A6F]">Uploading…</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded border border-black/10 px-3 py-2.5">
        <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">Blurb (shown on the listing card)</span>
        <textarea
          value={fields.blurb}
          onChange={(e) => setFields((f) => ({ ...f, blurb: e.target.value }))}
          onBlur={(e) => save("blurb", e.target.value)}
          rows={3}
          className="w-full bg-transparent outline-none text-sm resize-y"
        />
      </div>

      <div className="bg-white rounded border border-black/10 px-3 py-2.5">
        <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">Body (full article — falls back to the blurb if left empty)</span>
        <textarea
          value={fields.body}
          onChange={(e) => setFields((f) => ({ ...f, body: e.target.value }))}
          onBlur={(e) => save("body", e.target.value)}
          rows={10}
          className="w-full bg-transparent outline-none text-sm resize-y"
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded border border-black/10 px-3 py-2.5">
      <span className="block text-[9px] tracking-[0.16em] uppercase text-[#8A8368] font-mono mb-1">{label}</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}
