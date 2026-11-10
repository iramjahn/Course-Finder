import type { Week } from "@/lib/grouping";
import { formatHours } from "@/lib/format";
import type { ResourceRow } from "@/lib/placement";

type Props = { weeks: Week[]; resources: ResourceRow[]; currentId?: string };

export function WeekList({ weeks, resources, currentId }: Props) {
  const byId = new Map(resources.map((r) => [r.id, r]));
  return (
    <ol className="mt-10 flex flex-col gap-6">
      {weeks.map((week) => (
        <li key={week.week} className="card">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-semibold">Week {week.week}</h2>
            <span className="text-sm text-muted">{formatHours(week.hours)}</span>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {week.items.map((item, i) => {
              const r = byId.get(item.id);
              if (!r) return null;
              const isCurrent = r.id === currentId;
              return (
                <li key={`${item.id}-${i}`} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {r.title}
                    </a>
                    <p className="text-sm text-muted">
                      {r.platform}
                      {item.partial ? " · continues" : ""}
                      {isCurrent ? " · you are here" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-muted">{formatHours(item.hours)}</span>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}
