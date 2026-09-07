import { NextResponse } from "next/server";
import { db } from "@/db";
import { companyInfo } from "@/db/schema";
import { isAuthorizedPublicRequest } from "@/lib/publicApiAuth";

/**
 * Read-only, unauthenticated-by-login (bearer-token-gated) endpoint the public
 * website's build process fetches from — see src/proxy.ts, which exempts
 * /api/public/* from the session-cookie check that guards every other route.
 */
export async function GET(request: Request) {
  if (!isAuthorizedPublicRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = db.select().from(companyInfo).get();
  if (!info) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(info);
}
