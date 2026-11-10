import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { recomputeCompletionRates } from "@/lib/recompute";

function isAuthorized(header: string | null): boolean {
  const secret = process.env.RECOMPUTE_SECRET;
  if (!secret || !header?.startsWith("Bearer ")) return false;
  const token = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);
  return token.length === expected.length && timingSafeEqual(token, expected);
}

/** POST /api/recompute with `Authorization: Bearer $RECOMPUTE_SECRET`. For cron or a curator script. */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const updated = await recomputeCompletionRates();
    return NextResponse.json({ success: true, data: { updated }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recompute failed";
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
  }
}
