import Link from "next/link";
import { WeekList } from "@/components/week-list";
import { getPaths, getResources, getSkill } from "@/lib/data";
import { groupIntoWeeks, totalHours, WEEK_CAP_FACTOR } from "@/lib/grouping";
import { formatHours } from "@/lib/format";
import { assemblePath, pickPath } from "@/lib/placement";
import { joinWaitlist } from "./actions";

const SAMPLE_HOURS = 3;

const STEPS = [
  { title: "Place yourself", body: "Pick the skill, your level and the hours you have each week. Three answers, no test." },
  { title: "Get a path", body: "A short ordered list of existing videos, courses and docs, grouped into weeks that fit your budget." },
  { title: "Track what you finish", body: "One resource at a time. Started, Done, or not for me. Nothing to install." },
  { title: "Swap what is not for you", body: "Drop a resource and a shorter one of the same level takes its place." },
];

const FAQ = [
  {
    q: "How are resources chosen?",
    a: "People finish them. Every resource carries a completion rate computed from what learners mark Done or abandon. Paths are re-ranked from that number, nothing else. A person opens every link before it goes in. No model writes or ranks anything.",
  },
  {
    q: "Which skills come next?",
    a: "Excel is first. The next ones are decided by the waitlist: tell us what you want to learn when you sign up.",
  },
  {
    q: "Is anything hosted here?",
    a: "No. Every resource stays where it lives: YouTube, the publisher's site, Microsoft's docs, Coursera. SkillPath only keeps the order and your progress.",
  },
];

type Props = { searchParams: Promise<{ waitlist?: string }> };

export default async function LandingPage({ searchParams }: Props) {
  const { waitlist } = await searchParams;
  const sample = await loadSample();

  return (
    <main>
      <section className="mx-auto w-full max-w-3xl px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">One skill, one level, one weekly time budget.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Not a catalog of ten thousand courses. A short ordered path of the best free and paid resources, matched to your level
          and your week.
        </p>
        <a href="#waitlist" className="btn-primary mt-8 px-6 py-3 text-base">
          Join the waitlist
        </a>
      </section>

      {sample ? (
        <section className="mx-auto w-full max-w-3xl px-4 py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-accent">Sample path · Excel · beginner</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{sample.title}</h2>
          <p className="mt-2 text-muted">
            {sample.resources.length} resources, {formatHours(totalHours(sample.resources))} in total, grouped for someone with{" "}
            {SAMPLE_HOURS} hours a week. No week is longer than {formatHours(SAMPLE_HOURS * WEEK_CAP_FACTOR)}.
          </p>
          <WeekList weeks={sample.weeks} resources={sample.resources} />
          <p className="mt-4 text-sm text-muted">
            Already convinced?{" "}
            <Link href="/quiz" className="underline">
              Take the quiz
            </Link>
            .
          </p>
        </section>
      ) : null}

      <section className="border-y border-line bg-surface">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-mono text-sm text-accent">0{i + 1}</span>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
        <dl className="mt-6 divide-y divide-line">
          {FAQ.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-2 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="waitlist" className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-xl px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Join the waitlist</h2>
          <p className="mt-2 text-muted">We write once when your skill is ready. Nothing else.</p>
          {waitlist === "joined" ? (
            <p className="mt-6 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">You are on the list.</p>
          ) : (
            <form action={joinWaitlist} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-label="Email"
                className="flex-1 rounded-lg border border-line bg-paper px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <button type="submit" className="btn-primary">
                Join the waitlist
              </button>
            </form>
          )}
          {waitlist === "invalid" ? <p className="mt-3 text-sm text-red-700">Enter a valid email address.</p> : null}
          {waitlist === "error" ? <p className="mt-3 text-sm text-red-700">Something went wrong. Try again.</p> : null}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl px-4 py-10 text-sm text-muted">SkillPath hosts nothing. Links go to the people who made them.</footer>
    </main>
  );
}

async function loadSample() {
  try {
    const skill = await getSkill("excel");
    if (!skill) return null;
    const path = pickPath(await getPaths(skill.id), "beginner");
    if (!path) return null;
    const resources = assemblePath(path, await getResources(skill.id, "beginner"));
    return { title: path.title, resources, weeks: groupIntoWeeks(resources, SAMPLE_HOURS) };
  } catch {
    // Landing must render even when the database is unreachable.
    return null;
  }
}
