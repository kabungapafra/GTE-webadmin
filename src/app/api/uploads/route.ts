import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { NextResponse } from "next/server";

// Behind the normal session-cookie auth (src/proxy.ts) — only logged-in,
// approved staff can reach this. Files land in data/uploads, a subdirectory
// of the already rsync-excluded data/ dir (see .github/workflows/deploy.yml
// and src/db/index.ts's identical DATABASE_PATH handling), so a deploy never
// wipes them the way it would anywhere under the repo root.
const UPLOAD_DIR = join(dirname(process.env.DATABASE_PATH ?? "./data/app.db"), "uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (8MB max)" }, { status: 400 });
  }

  mkdirSync(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
