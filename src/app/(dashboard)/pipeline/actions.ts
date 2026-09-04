"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Stage = "enquiry" | "quoted" | "confirmed" | "driving" | "done";

export async function moveBookingStage(bookingId: string, stage: Stage) {
  const supabase = await createClient();
  const { error } = await supabase.from("bookings").update({ stage }).eq("id", bookingId);
  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
}
