import { getLatestEnrollment, getPathById, getProfile, getSkills } from "@/lib/data";
import { getUser } from "@/lib/supabase/server";
import { HOURS_OPTIONS, LEVELS, type Level } from "@/lib/types";
import { submitQuiz } from "./actions";

const LEVEL_HELP: Record<Level, string> = {
  beginner: "You open Excel and are not sure where to start.",
  intermediate: "You use formulas and want lookups, pivots and clean data.",
  advanced: "You want Power Query, data models, DAX and automation.",
};

const DEFAULT_HOURS = 3;

type Props = { searchParams: Promise<{ error?: string }> };

export default async function QuizPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const user = await getUser();
  const [skills, profile, enrollment] = await Promise.all([
    getSkills(),
    user ? getProfile(user.id) : null,
    user ? getLatestEnrollment(user.id) : null,
  ]);
  const currentPath = enrollment ? await getPathById(enrollment.path_id) : null;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Place yourself</h1>
      <p className="mt-2 text-muted">Three answers. You get an ordered path that fits your week.</p>

      {currentPath ? (
        <p className="mt-6 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
          You are on <span className="font-medium text-ink">{currentPath.title}</span>. Submitting again starts a new path.
        </p>
      ) : null}

      <form action={submitQuiz} className="mt-8 flex flex-col gap-8">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Skill</legend>
          <select
            name="skill"
            defaultValue={skills[0]?.slug}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-base"
          >
            {skills.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">More skills come later. Excel first.</p>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Level</legend>
          {LEVELS.map((level) => (
            <label
              key={level}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 has-checked:border-accent has-checked:ring-2 has-checked:ring-accent/20"
            >
              <input
                type="radio"
                name="level"
                value={level}
                required
                defaultChecked={level === currentPath?.level}
                className="mt-1 accent-accent"
              />
              <span>
                <span className="block font-medium capitalize">{level}</span>
                <span className="block text-sm text-muted">{LEVEL_HELP[level]}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Hours you have each week</legend>
          <div className="grid grid-cols-4 gap-2">
            {HOURS_OPTIONS.map((h) => (
              <label
                key={h}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-line bg-surface px-3 py-3 text-center font-medium has-checked:border-accent has-checked:bg-accent has-checked:text-accent-ink"
              >
                <input
                  type="radio"
                  name="hours"
                  value={h}
                  required
                  defaultChecked={h === (profile?.hours_per_week ?? DEFAULT_HOURS)}
                  className="sr-only"
                />
                {h} h
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <label htmlFor="deadline" className="text-sm font-medium">
            Deadline <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={profile?.deadline ?? ""}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-base"
          />
        </fieldset>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="btn-primary">
          Get my path
        </button>
      </form>
    </main>
  );
}
