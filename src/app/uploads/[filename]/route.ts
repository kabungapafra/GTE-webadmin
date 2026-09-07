import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { NextResponse, type NextRequest } from "next/server";

// Public — exempted from proxy.ts's session check (see its matcher) since the
// website's visitors load these images unauthenticated. Files come from
// data/uploads (see src/app/api/uploads/route.ts).
const UPLOAD_DIR = join(dirname(process.env.DATABASE_PATH ?? "./data/app.db"), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Only the exact shape src/app/api/uploads/route.ts generates — blocks path traversal.
const SAFE_FILENAME = /^[a-f0-9-]+\.(jpg|png|webp|gif)$/;

export async function GET(request: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!SAFE_FILENAME.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const path = join(UPLOAD_DIR, filename);
  if (!existsSync(path)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = filename.split(".").pop() ?? "";
  const bytes = readFileSync(path);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
