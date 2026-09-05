"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteLineItems, bookings, bookingActivity } from "@/db/schema";

export async function addLineItem(bookingId: string, label: string, rate: number, qty: string) {
  const amount = rate * (parseFloat(qty) || 1);
  db.insert(quoteLineItems).values({ bookingId, label, rate, qty, amount }).run();
  revalidatePath("/enquiries");
}

export async function removeLineItem(id: string) {
  db.delete(quoteLineItems).where(eq(quoteLineItems.id, id)).run();
  revalidatePath("/enquiries");
}

export async function sendQuote(bookingId: string, partyName: string, total: number) {
  db.update(bookings).set({ stage: "quoted", value: total }).where(eq(bookings.id, bookingId)).run();
  db.insert(bookingActivity).values({ bookingId, note: `Quote sent to ${partyName} — $${total.toLocaleString()}` }).run();

  revalidatePath("/enquiries");
  revalidatePath("/pipeline");
}

export async function addActivityNote(bookingId: string, note: string) {
  db.insert(bookingActivity).values({ bookingId, note }).run();
  revalidatePath("/enquiries");
}
