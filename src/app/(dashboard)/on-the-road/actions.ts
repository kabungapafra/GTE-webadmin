"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addSupportLogEntry(bookingId: string | null, note: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("road_support_log").insert({ booking_id: bookingId, note });
  if (error) throw new Error(error.message);
  revalidatePath("/on-the-road");
}
