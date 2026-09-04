"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordPayment(invoiceId: string, paid: number, total: number) {
  const supabase = await createClient();
  const state = paid >= total ? "settled" : paid > 0 ? "deposit_paid" : "awaiting_deposit";
  const { error } = await supabase.from("invoices").update({ paid, state }).eq("id", invoiceId);
  if (error) throw new Error(error.message);
  revalidatePath("/payments");
}

export async function sendReminder(bookingId: string, partyName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("booking_activity")
    .insert({ booking_id: bookingId, note: `Payment reminder sent to ${partyName}` });
  if (error) throw new Error(error.message);
  revalidatePath("/payments");
}
