/** Only same-site paths: starts with a single "/", no backslashes, no whitespace (a leading "/\" resolves off-site). */
const SAFE_PATH = /^\/(?!\/)[^\s\\]*$/;

export function safeNext(value: unknown, fallback = "/today"): string {
  return typeof value === "string" && SAFE_PATH.test(value) ? value : fallback;
}
