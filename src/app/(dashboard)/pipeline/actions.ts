"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, type BookingStage } from "@/db/schema";

export type Stage = BookingStage;

export async function moveBookingStage(bookingId: string, stage: Stage) {
  db.update(bookings).set({ stage }).where(eq(bookings.id, bookingId)).run();
  revalidatePath("/pipeline");
}
