"use server";

import { redirect } from "next/navigation";
import { getPaths, getResources, getSkill } from "@/lib/data";
import { assemblePath, pickPath } from "@/lib/placement";
import { createClient, getUser } from "@/lib/supabase/server";
import { isHoursPerWeek, isLevel } from "@/lib/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function back(message: string): never {
  redirect(`/quiz?error=${encodeURIComponent(message)}`);
}

/** Placement is a rule: the path whose level matches the answer. Then snapshot the ranked order. */
export async function submitQuiz(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/login?next=/quiz");

  const slug = String(formData.get("skill") ?? "");
  const level = formData.get("level");
  const hours = Number(formData.get("hours"));
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();

  if (!isLevel(level)) back("Pick a level.");
  if (!isHoursPerWeek(hours)) back("Pick how many hours you have each week.");
  if (deadlineRaw && !DATE_RE.test(deadlineRaw)) back("The deadline must be a date.");
  const deadline = deadlineRaw || null;

  const skill = await getSkill(slug);
  if (!skill) back("Pick a skill.");

  const path = pickPath(await getPaths(skill.id), level);
  if (!path) back(`There is no ${level} path for ${skill.name} yet.`);

  const ordered = assemblePath(path, await getResources(skill.id, level));
  if (ordered.length === 0) back("That path has no resources yet.");

  const supabase = await createClient();
  const profile = await supabase
    .from("learner_profiles")
    .upsert({ user_id: user.id, hours_per_week: hours, deadline, updated_at: new Date().toISOString() });
  if (profile.error) back(`Could not save your profile: ${profile.error.message}`);

  const enrollment = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, path_id: path.id, resource_ids: ordered.map((r) => r.id), current_index: 0 });
  if (enrollment.error) back(`Could not start your path: ${enrollment.error.message}`);

  redirect(`/learn/${skill.slug}/${level}`);
}
