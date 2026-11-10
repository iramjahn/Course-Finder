import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requestOrigin } from "@/lib/request-origin";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/** Completes a magic-link sign-in. Handles both the PKCE `code` and the `token_hash` link formats. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = requestOrigin(request);
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { error: new Error("Missing sign-in token") };

  if (result.error) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", "That link is invalid or expired. Request a new one.");
    return NextResponse.redirect(url);
  }
  return NextResponse.redirect(new URL(next, origin));
}
