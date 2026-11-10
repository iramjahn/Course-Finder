import Link from "next/link";
import { redirect } from "next/navigation";
import { getLatestEnrollment, getPathById, getResourcesByIds, getSkillById, getStats } from "@/lib/data";
import { formatFinishCount, minutesOf } from "@/lib/format";
import { getUser } from "@/lib/supabase/server";
import { abandonResource, completeResource, skipResource, startResource } from "./actions";

type Props = { searchParams: Promise<{ swapped?: string; none?: string; started?: string }> };

export default async function TodayPage({ searchParams }: Props) {
  const flags = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login?next=/today");

  // Empty state: no enrollment means the quiz.
  const enrollment = await getLatestEnrollment(user.id);
  if (!enrollment) redirect("/quiz");

  const path = await getPathById(enrollment.path_id);
  const skill = path ? await getSkillById(path.skill_id) : null;
  const total = enrollment.resource_ids.length;
  const index = enrollment.current_index;

  if (index >= total) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">You finished {path?.title ?? "your path"}.</h1>
        <p className="mt-3 text-muted">Pick the next level, or another budget of hours.</p>
        <Link href="/quiz" className="btn-primary mt-8">
          Take the quiz again
        </Link>
      </main>
    );
  }

  const currentId = enrollment.resource_ids[index];
  const [current] = await getResourcesByIds([currentId]);
  const stats = current ? (await getStats([current.id])).get(current.id) : undefined;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <p className="text-sm text-muted">
        {path?.title ?? "Your path"} · {index + 1} of {total}
        {skill && path ? (
          <>
            {" · "}
            <Link href={`/learn/${skill.slug}/${path.level}`} className="underline">
              see the weeks
            </Link>
          </>
        ) : null}
      </p>

      {flags.swapped ? <Notice>Swapped in a shorter resource of the same level.</Notice> : null}
      {flags.started ? <Notice>Marked as started. Come back and press Done when you finish.</Notice> : null}

      {!current ? (
        <section className="card mt-6">
          <h1 className="text-xl font-semibold">This resource was removed.</h1>
          <p className="mt-2 text-muted">A curator took it out of the catalog. Skip to the next one.</p>
          <form action={skipResource} className="mt-6">
            <input type="hidden" name="resource_id" value={currentId} />
            <button type="submit" className="btn-primary">
              Skip to the next
            </button>
          </form>
        </section>
      ) : (
        <section className="card mt-6">
          <p className="text-sm text-muted">{current.platform}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{current.title}</h1>
          <p className="mt-2 text-muted">
            About {minutesOf(current.hours)} minutes · {formatFinishCount(stats?.completed ?? 0, stats?.abandoned ?? 0)}
          </p>
          <a href={current.url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-5">
            Open on {current.platform.split(" · ")[0]} ↗
          </a>

          {flags.none ? (
            <div className="mt-6 rounded-lg border border-line bg-paper px-4 py-3">
              <p className="font-medium">We&apos;ll add one. Skip to the next.</p>
              <p className="mt-1 text-sm text-muted">There is no shorter {current.level} resource yet.</p>
              <form action={skipResource} className="mt-3">
                <input type="hidden" name="resource_id" value={current.id} />
                <button type="submit" className="btn-primary">
                  Skip to the next
                </button>
              </form>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <form action={startResource}>
              <input type="hidden" name="resource_id" value={current.id} />
              <button type="submit" className="btn-secondary w-full">
                Started
              </button>
            </form>
            <form action={completeResource}>
              <input type="hidden" name="resource_id" value={current.id} />
              <button type="submit" className="btn-primary w-full">
                Done
              </button>
            </form>
            <form action={abandonResource}>
              <input type="hidden" name="resource_id" value={current.id} />
              <button type="submit" className="btn-secondary w-full">
                This wasn&apos;t for me
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm">{children}</p>;
}
