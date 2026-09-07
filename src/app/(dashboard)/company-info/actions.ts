"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companyInfo } from "@/db/schema";

// The client component's field names (snake_case) mapped to this schema's camelCase columns.
const FIELD_MAP = {
  phone: "phone",
  whatsapp: "whatsapp",
  email: "email",
  instagram_url: "instagramUrl",
  facebook_url: "facebookUrl",
  x_url: "xUrl",
  youtube_url: "youtubeUrl",
  founder_name: "founderName",
} as const;

export async function updateCompanyInfo(id: string, field: string, value: string) {
  const column = FIELD_MAP[field as keyof typeof FIELD_MAP];
  if (!column) throw new Error(`Unknown company info field: ${field}`);
  db.update(companyInfo).set({ [column]: value }).where(eq(companyInfo.id, id)).run();
  revalidatePath("/company-info");
}
