import Link from "next/link";
import { sendMagicLink } from "./actions";

type Props = { searchParams: Promise<{ sent?: string; error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { sent, error, next } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        We email you a link. No password.
      </p>

      {sent ? (
        <div className="mt-8 rounded-lg border border-line bg-white p-5">
          <p className="font-medium">Check your inbox</p>
          <p className="mt-1 text-sm text-muted">
            We sent a sign-in link to <span className="font-medium text-ink">{sent}</span>. Open it on this device.
          </p>
          <Link href="/login" className="mt-4 inline-block text-sm text-accent underline">
            Use a different email
          </Link>
        </div>
      ) : (
        <form action={sendMagicLink} className="mt-8 flex flex-col gap-3">
          <input type="hidden" name="next" value={next ?? "/today"} />
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-lg border border-line bg-white px-3 py-2 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="btn-primary mt-2">
            Email me a sign-in link
          </button>
        </form>
      )}
    </main>
  );
}
