"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addLineItem(bookingId: string, label: string, rate: number, qty: string) {
  const supabase = await createClient();
  const amount = rate * (parseFloat(qty) || 1);
  const { error } = await supabase.from("quote_line_items").insert({ booking_id: bookingId, label, rate, qty, amount });
  if (error) throw new Error(error.message);
  revalidatePath("/enquiries");
}

export async function removeLineItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quote_line_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/enquiries");
}

export async function sendQuote(bookingId: string, partyName: string, total: number) {
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ stage: "quoted", value: total })
    .eq("id", bookingId);
  if (updateError) throw new Error(updateError.message);

  const { error: activityError } = await supabase
    .from("booking_activity")
    .insert({ booking_id: bookingId, note: `Quote sent to ${partyName} — $${total.toLocaleString()}` });
  if (activityError) throw new Error(activityError.message);

  revalidatePath("/enquiries");
  revalidatePath("/pipeline");
}

export async function addActivityNote(bookingId: string, note: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("booking_activity").insert({ booking_id: bookingId, note });
  if (error) throw new Error(error.message);
  revalidatePath("/enquiries");
}
