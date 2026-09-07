"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoute } from "@/app/(dashboard)/routes/actions";

export default function NewRouteButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const id = await createRoute();
          router.push(`/routes?r=${id}`);
        })
      }
      className="px-4 py-2 rounded bg-[#1E3A2B] text-[#F7F1E3] text-sm font-medium shrink-0"
    >
      + New route
    </button>
  );
}
