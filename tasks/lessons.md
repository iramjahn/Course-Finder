# Lessons

- 2026-11-10: Bash heredocs that contain TSX/SQL with apostrophes or `''` can be rejected by the
  harness pre-parser ("unexpected EOF while looking for matching `''`") even when quoted. Use the
  Write tool for source files with mixed quotes; keep heredocs for small configs.
- 2026-11-10: `npx <pkg>` right after `npm install` of that package can race its bin link
  ("not recognized"). Confirm the bin exists in node_modules/.bin before running it.
- 2026-11-10: Next.js `request.nextUrl.origin` can normalize the host (127.0.0.1 → localhost) in
  route handlers. Build auth redirects from the Host header so session cookies stay on the same host.
- 2026-11-10: Never render a raw `x * 1.2` in copy; floating point leaks ("3.5999…"). Format through
  the shared hours formatter.
