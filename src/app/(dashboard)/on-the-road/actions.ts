"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { roadSupportLog } from "@/db/schema";

export async function addSupportLogEntry(bookingId: string | null, note: string) {
  db.insert(roadSupportLog).values({ bookingId, note }).run();
  revalidatePath("/on-the-road");
}
