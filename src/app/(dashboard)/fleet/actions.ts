"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateVehicleStatus(vehicleId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update({ status }).eq("id", vehicleId);
  if (error) throw new Error(error.message);
  revalidatePath("/fleet");
}

export async function toggleKitItem(vehicleId: string, kit: Record<string, boolean>, item: string) {
  const supabase = await createClient();
  const updated = { ...kit, [item]: !kit[item] };
  const { error } = await supabase.from("vehicles").update({ kit: updated }).eq("id", vehicleId);
  if (error) throw new Error(error.message);
  revalidatePath("/fleet");
}

export async function updateVehicleField(vehicleId: string, field: string, value: string | number) {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update({ [field]: value }).eq("id", vehicleId);
  if (error) throw new Error(error.message);
  revalidatePath("/fleet");
}

export async function addWorkshopRecord(vehicleId: string, note: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicle_workshop_records").insert({ vehicle_id: vehicleId, note });
  if (error) throw new Error(error.message);
  revalidatePath("/fleet");
}
