import { redirect } from "next/navigation";
import { formatFinishCount, formatHours, formatRate } from "@/lib/format";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";
import type { Level } from "@/lib/types";
import { recomputeAction, removeResource } from "./actions";

type StatsRow = {
  id: string;
  title: string;
  url: string;
  platform: string;
  hours: number;
  level: Level;
  completion_rate: number;
  started: number;
  completed: number;
  abandoned: number;
};

type Props = { searchParams: Promise<{ recomputed?: string; removed?: string }> };

export default async function AdminResourcesPage({ searchParams }: Props) {
  const flags = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login?next=/admin/resources");
  if (!isAdminEmail(user.email)) {
    return (
      <main className="mx-auto w-full max-w-xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Curators only</h1>
        <p className="mt-2 text-muted">Your email is not on the ADMIN_EMAILS list.</p>
      </main>
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("resource_stats")
    .select("id, title, url, platform, hours, level, completion_rate, started, completed, abandoned")
    .order("level")
    .order("completion_rate", { ascending: false })
    .order("title");
  if (error) throw new Error(`Could not load resources: ${error.message}`);
  const rows: StatsRow[] = (data ?? []).map((r) => {
    const row = r as StatsRow;
    return {
      ...row,
      hours: Number(row.hours),
      completion_rate: Number(row.completion_rate),
      started: Number(row.started),
      completed: Number(row.completed),
      abandoned: Number(row.abandoned),
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Resources</h1>
          <p className="mt-1 text-muted">
            completion_rate = (completed + 1) / (completed + abandoned + 2). Remove what people abandon.
          </p>
        </div>
        <form action={recomputeAction}>
          <button type="submit" className="btn-primary">
            Recompute completion rates
          </button>
        </form>
      </div>

      {flags.recomputed ? <p className="mt-4 text-sm text-accent">Recomputed {flags.recomputed} resources.</p> : null}
      {flags.removed ? <p className="mt-4 text-sm text-accent">Resource removed.</p> : null}

      <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Length</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Finish</th>
              <th className="px-4 py-3 text-right">Started</th>
              <th className="px-4 py-3 text-right">Done</th>
              <th className="px-4 py-3 text-right">Dropped</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className={r.abandoned > r.completed ? "bg-red-50/60" : undefined}>
                <td className="px-4 py-3">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                    {r.title}
                  </a>
                  <div className="text-xs text-muted">{r.platform}</div>
                </td>
                <td className="px-4 py-3 capitalize">{r.level}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatHours(r.hours)}</td>
                <td className="px-4 py-3 font-mono">{formatRate(r.completion_rate)}</td>
                <td className="px-4 py-3 text-muted">{formatFinishCount(r.completed, r.abandoned)}</td>
                <td className="px-4 py-3 text-right">{r.started}</td>
                <td className="px-4 py-3 text-right">{r.completed}</td>
                <td className="px-4 py-3 text-right">{r.abandoned}</td>
                <td className="px-4 py-3 text-right">
                  <form action={removeResource}>
                    <input type="hidden" name="resource_id" value={r.id} />
                    <button type="submit" className="text-red-700 hover:underline">
                      Remove
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
