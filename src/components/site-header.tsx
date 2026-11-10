import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/admin";

export async function SiteHeader() {
  const user = await getUser();
  const isAdmin = isAdminEmail(user?.email);

  return (
    <header className="border-b border-line bg-paper/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          SkillPath
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/today" className="hover:underline">
                Today
              </Link>
              <Link href="/quiz" className="hover:underline">
                Quiz
              </Link>
              {isAdmin ? (
                <Link href="/admin/resources" className="hover:underline">
                  Admin
                </Link>
              ) : null}
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-muted hover:underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
