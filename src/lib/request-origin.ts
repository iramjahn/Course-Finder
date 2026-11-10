import type { NextRequest } from "next/server";

const DEV_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * The origin to redirect to after auth. Uses the request host only when it is a local dev host or
 * matches NEXT_PUBLIC_SITE_URL, so a forged Host / X-Forwarded-Host header cannot steer redirects.
 */
export function requestOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const configuredHost = configured ? safeHost(configured) : null;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");

  if (host && (DEV_HOST.test(host) || host === configuredHost)) return `${proto}://${host}`;
  return configured ?? request.nextUrl.origin;
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
