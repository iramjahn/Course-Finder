import { createClient } from "@/lib/supabase/server";
import type { PathRow, ResourceRow } from "@/lib/placement";
import type { Level } from "@/lib/types";

export type SkillRow = { id: string; slug: string; name: string };
export type ProfileRow = { user_id: string; hours_per_week: number; deadline: string | null };
export type EnrollmentRow = {
  id: string;
  user_id: string;
  path_id: string;
  resource_ids: string[];
  current_index: number;
  created_at: string;
};
export type ResourceStats = { id: string; started: number; completed: number; abandoned: number };

const RESOURCE_COLUMNS = "id, skill_id, title, url, platform, hours, level, completion_rate";

function toResource(row: Record<string, unknown>): ResourceRow {
  return {
    id: String(row.id),
    skill_id: String(row.skill_id),
    title: String(row.title),
    url: String(row.url),
    platform: String(row.platform),
    hours: Number(row.hours),
    level: row.level as Level,
    completion_rate: Number(row.completion_rate),
  };
}

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? "unknown error"}`);
}

export async function getSkill(slug: string): Promise<SkillRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("skills").select("id, slug, name").eq("slug", slug).maybeSingle();
  if (error) fail("getSkill", error);
  return (data as SkillRow | null) ?? null;
}

export async function getSkillById(id: string): Promise<SkillRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("skills").select("id, slug, name").eq("id", id).maybeSingle();
  if (error) fail("getSkillById", error);
  return (data as SkillRow | null) ?? null;
}

export async function getSkills(): Promise<SkillRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("skills").select("id, slug, name").order("name");
  if (error) fail("getSkills", error);
  return (data as SkillRow[]) ?? [];
}

export async function getPaths(skillId: string): Promise<PathRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("paths").select("id, skill_id, level, title, resource_ids").eq("skill_id", skillId);
  if (error) fail("getPaths", error);
  return (data as PathRow[]) ?? [];
}

export async function getPathById(id: string): Promise<PathRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("paths").select("id, skill_id, level, title, resource_ids").eq("id", id).maybeSingle();
  if (error) fail("getPathById", error);
  return (data as PathRow | null) ?? null;
}

export async function getResources(skillId: string, level: Level): Promise<ResourceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(RESOURCE_COLUMNS)
    .eq("skill_id", skillId)
    .eq("level", level)
    .order("created_at");
  if (error) fail("getResources", error);
  return (data ?? []).map((r) => toResource(r as Record<string, unknown>));
}

/** Returns resources in the order of `ids`; missing ids are dropped. */
export async function getResourcesByIds(ids: readonly string[]): Promise<ResourceRow[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("resources").select(RESOURCE_COLUMNS).in("id", ids);
  if (error) fail("getResourcesByIds", error);
  const byId = new Map((data ?? []).map((r) => [String((r as { id: string }).id), toResource(r as Record<string, unknown>)]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [row] : [];
  });
}

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learner_profiles")
    .select("user_id, hours_per_week, deadline")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) fail("getProfile", error);
  return (data as ProfileRow | null) ?? null;
}

export async function getLatestEnrollment(userId: string): Promise<EnrollmentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, user_id, path_id, resource_ids, current_index, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("getLatestEnrollment", error);
  return (data as EnrollmentRow | null) ?? null;
}

export async function getStats(ids: readonly string[]): Promise<Map<string, ResourceStats>> {
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase.from("resource_stats").select("id, started, completed, abandoned").in("id", ids);
  if (error) fail("getStats", error);
  return new Map(
    (data ?? []).map((r) => {
      const row = r as Record<string, unknown>;
      return [
        String(row.id),
        { id: String(row.id), started: Number(row.started), completed: Number(row.completed), abandoned: Number(row.abandoned) },
      ];
    }),
  );
}
