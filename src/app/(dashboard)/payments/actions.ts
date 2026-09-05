"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, bookingActivity } from "@/db/schema";

export async function recordPayment(invoiceId: string, paid: number, total: number) {
  const state = paid >= total ? "settled" : paid > 0 ? "deposit_paid" : "awaiting_deposit";
  db.update(invoices).set({ paid, state }).where(eq(invoices.id, invoiceId)).run();
  revalidatePath("/payments");
}

export async function sendReminder(bookingId: string, partyName: string) {
  db.insert(bookingActivity).values({ bookingId, note: `Payment reminder sent to ${partyName}` }).run();
  revalidatePath("/payments");
}
