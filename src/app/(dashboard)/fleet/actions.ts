"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles, vehicleWorkshopRecords } from "@/db/schema";

export async function updateVehicleStatus(vehicleId: string, status: string) {
  db.update(vehicles).set({ status }).where(eq(vehicles.id, vehicleId)).run();
  revalidatePath("/fleet");
}

export async function toggleKitItem(vehicleId: string, kit: Record<string, boolean>, item: string) {
  const updated = { ...kit, [item]: !kit[item] };
  db.update(vehicles).set({ kit: updated }).where(eq(vehicles.id, vehicleId)).run();
  revalidatePath("/fleet");
}

// The public site field names (snake_case, matching what the client component sends) mapped
// to this schema's camelCase columns.
const FIELD_MAP = {
  daily_rate: "dailyRate",
  seats: "seats",
  gearbox: "gearbox",
  year: "year",
  odometer: "odometer",
  next_service: "nextService",
} as const;

export async function updateVehicleField(vehicleId: string, field: string, value: string | number) {
  const column = FIELD_MAP[field as keyof typeof FIELD_MAP];
  if (!column) throw new Error(`Unknown vehicle field: ${field}`);
  db.update(vehicles).set({ [column]: value }).where(eq(vehicles.id, vehicleId)).run();
  revalidatePath("/fleet");
}

export async function addWorkshopRecord(vehicleId: string, note: string) {
  db.insert(vehicleWorkshopRecords).values({ vehicleId, note, occurredOn: new Date().toISOString().slice(0, 10) }).run();
  revalidatePath("/fleet");
}
