import Link from "next/link";
import { notFound } from "next/navigation";
import { WeekList } from "@/components/week-list";
import { getLatestEnrollment, getPaths, getProfile, getResources, getResourcesByIds, getSkill } from "@/lib/data";
import { groupIntoWeeks, totalHours } from "@/lib/grouping";
import { formatHours } from "@/lib/format";
import { assemblePath, pickPath } from "@/lib/placement";
import { getUser } from "@/lib/supabase/server";
import { isLevel } from "@/lib/types";

const DEFAULT_HOURS = 3;

type Props = { params: Promise<{ skill: string; level: string }> };

export default async function LearnPage({ params }: Props) {
  const { skill: slug, level } = await params;
  if (!isLevel(level)) notFound();
  const skill = await getSkill(slug);
  if (!skill) notFound();
  const path = pickPath(await getPaths(skill.id), level);
  if (!path) notFound();

  const user = await getUser();
  const [profile, latest] = await Promise.all([
    user ? getProfile(user.id) : null,
    user ? getLatestEnrollment(user.id) : null,
  ]);
  const enrollment = latest && latest.path_id === path.id ? latest : null;

  // Your own snapshot if you are on this path; otherwise what a new learner would get today.
  const resources = enrollment
    ? await getResourcesByIds(enrollment.resource_ids)
    : assemblePath(path, await getResources(skill.id, level));

  const hoursPerWeek = profile?.hours_per_week ?? DEFAULT_HOURS;
  const weeks = groupIntoWeeks(resources, hoursPerWeek);
  const currentId = enrollment?.resource_ids[enrollment.current_index];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        {skill.name} · {level}
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{path.title}</h1>
      <p className="mt-2 text-muted">
        {resources.length} resources, {formatHours(totalHours(resources))} in total. At {hoursPerWeek} h a week that is{" "}
        {weeks.length} {weeks.length === 1 ? "week" : "weeks"}.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {enrollment ? (
          <Link href="/today" className="btn-primary">
            Continue today
          </Link>
        ) : (
          <Link href="/quiz" className="btn-primary">
            Start this path
          </Link>
        )}
        <Link href="/quiz" className="btn-secondary">
          Change level or hours
        </Link>
      </div>

      <WeekList weeks={weeks} resources={resources} currentId={currentId} />
    </main>
  );
}
