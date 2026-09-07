import { NextResponse } from "next/server";
import { db } from "@/db";
import { companyInfo } from "@/db/schema";

/**
 * Read-only, unauthenticated-by-login (bearer-token-gated) endpoint the public
 * website's build process fetches from — see src/proxy.ts, which exempts
 * /api/public/* from the session-cookie check that guards every other route.
 */
export async function GET(request: Request) {
  const expected = process.env.PUBLIC_API_TOKEN;
  const auth = request.headers.get("authorization");
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = db.select().from(companyInfo).get();
  if (!info) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(info);
}
