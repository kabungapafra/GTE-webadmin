import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";
import JournalDetail from "@/components/JournalDetail";
import NewJournalPostButton from "@/components/NewJournalPostButton";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const allPosts = db.select().from(journalPosts).orderBy(desc(journalPosts.createdAt)).all();
  const selected = allPosts.find((post) => post.id === p) ?? allPosts[0];

  return (
    <div className="p-8 flex flex-col gap-6 h-full">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl">Journal</h1>
          <p className="text-sm text-[#6B7A6F]">Road reports and travel guidance shown on the public site.</p>
        </div>
        <NewJournalPostButton />
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="w-[260px] shrink-0 flex flex-col gap-1 overflow-y-auto">
          <span className="text-[10px] tracking-[0.16em] uppercase text-[#8A8368] font-mono px-1 mb-1">
            All posts
          </span>
          {allPosts.map((post) => (
            <Link
              key={post.id}
              href={`/journal?p=${post.id}`}
              className={
                "rounded border px-3 py-2.5 flex flex-col gap-0.5 " +
                (selected?.id === post.id ? "bg-white border-[#1E3A2B]" : "bg-white/60 border-black/10 hover:bg-white")
              }
            >
              <span className="text-sm font-medium">{post.title}</span>
              <span className="text-[12px]" style={{ color: post.publishedAt ? "#6B7A6F" : "#D2541B" }}>
                {post.publishedAt ? "Published" : "Draft"} · {post.category}
              </span>
            </Link>
          ))}
          {allPosts.length === 0 && <p className="text-[#9C9575] italic text-sm px-1">No posts yet.</p>}
        </div>

        {selected && <JournalDetail post={selected} />}
      </div>
    </div>
  );
}
