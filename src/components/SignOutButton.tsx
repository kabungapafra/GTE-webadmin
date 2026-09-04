"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="text-[11px] text-[#8FA88B] hover:text-[#EFE7D2] text-left"
    >
      Sign out
    </button>
  );
}
