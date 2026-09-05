import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Signs out a signed-in-but-unapproved user before sending them to /login — redirecting there
 *  directly would just bounce back here via middleware, since it treats any authenticated user
 *  hitting /login as already-signed-in. */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login?denied=1", request.url));
}
