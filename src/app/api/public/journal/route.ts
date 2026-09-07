import { desc, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";
import { isAuthorizedPublicRequest, absolutizeUploadUrl } from "@/lib/publicApiAuth";

export async function GET(request: Request) {
  if (!isAuthorizedPublicRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Drafts (publishedAt is null) never reach the public site.
  const posts = db
    .select()
    .from(journalPosts)
    .where(isNotNull(journalPosts.publishedAt))
    .orderBy(desc(journalPosts.publishedAt))
    .all();

  const shaped = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    blurb: post.blurb ?? "",
    body: post.body ?? "",
    coverImageUrl: absolutizeUploadUrl(post.coverImageUrl),
    minRead: post.minRead,
    publishedAt: post.publishedAt,
  }));

  return NextResponse.json(shaped);
}
