"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJournalPost } from "@/app/(dashboard)/journal/actions";

export default function NewJournalPostButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const id = await createJournalPost();
          router.push(`/journal?p=${id}`);
        })
      }
      className="px-4 py-2 rounded bg-[#1E3A2B] text-[#F7F1E3] text-sm font-medium shrink-0"
    >
      + New post
    </button>
  );
}
