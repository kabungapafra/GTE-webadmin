"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";

const FIELD_MAP = {
  title: "title",
  slug: "slug",
  category: "category",
  blurb: "blurb",
  body: "body",
  cover_image_url: "coverImageUrl",
  min_read: "minRead",
} as const;

export async function updateJournalField(postId: string, field: string, value: string | number) {
  const column = FIELD_MAP[field as keyof typeof FIELD_MAP];
  if (!column) throw new Error(`Unknown journal field: ${field}`);
  db.update(journalPosts).set({ [column]: value }).where(eq(journalPosts.id, postId)).run();
  revalidatePath("/journal");
}

export async function createJournalPost() {
  const id = randomUUID();
  const slug = `new-post-${id.slice(0, 8)}`;
  db.insert(journalPosts).values({
    id,
    slug,
    title: "New post",
    category: "road-reports",
  }).run();
  revalidatePath("/journal");
  return id;
}

export async function deleteJournalPost(postId: string) {
  db.delete(journalPosts).where(eq(journalPosts.id, postId)).run();
  revalidatePath("/journal");
}

export async function publishJournalPost(postId: string) {
  db.update(journalPosts).set({ publishedAt: new Date().toISOString() }).where(eq(journalPosts.id, postId)).run();
  revalidatePath("/journal");
}

export async function unpublishJournalPost(postId: string) {
  db.update(journalPosts).set({ publishedAt: null }).where(eq(journalPosts.id, postId)).run();
  revalidatePath("/journal");
}
