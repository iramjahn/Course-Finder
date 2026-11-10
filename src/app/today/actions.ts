"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getLatestEnrollment, getResources, getResourcesByIds } from "@/lib/data";
import { findShorterAlternative } from "@/lib/placement";
import { createClient, getUser } from "@/lib/supabase/server";
import type { EventType } from "@/lib/types";

async function requireContext(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/login?next=/today");
  const enrollment = await getLatestEnrollment(user.id);
  if (!enrollment) redirect("/quiz");
  const resourceId = String(formData.get("resource_id") ?? "");
  const currentId = enrollment.resource_ids[enrollment.current_index];
  // Stale form (another tab moved on): just reload.
  if (resourceId !== currentId) redirect("/today");
  return { user, enrollment, resourceId };
}

async function recordEvent(userId: string, resourceId: string, type: EventType) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({ user_id: userId, resource_id: resourceId, type });
  if (error) throw new Error(`Could not record ${type}: ${error.message}`);
}

async function advance(enrollmentId: string, currentIndex: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ current_index: currentIndex + 1 })
    .eq("id", enrollmentId);
  if (error) throw new Error(`Could not move on: ${error.message}`);
}

export async function startResource(formData: FormData) {
  const { user, resourceId } = await requireContext(formData);
  await recordEvent(user.id, resourceId, "started");
  revalidatePath("/today");
  redirect("/today?started=1");
}

export async function completeResource(formData: FormData) {
  const { user, enrollment, resourceId } = await requireContext(formData);
  await recordEvent(user.id, resourceId, "completed");
  await advance(enrollment.id, enrollment.current_index);
  revalidatePath("/today");
  redirect("/today");
}

/** Records abandoned, then swaps in a shorter resource of the same level if one exists. */
export async function abandonResource(formData: FormData) {
  const { user, enrollment, resourceId } = await requireContext(formData);
  await recordEvent(user.id, resourceId, "abandoned");

  const [current] = await getResourcesByIds([resourceId]);
  const candidates = current ? await getResources(current.skill_id, current.level) : [];
  const alternative = current ? findShorterAlternative(current, candidates, enrollment.resource_ids) : null;

  if (!alternative) {
    revalidatePath("/today");
    redirect("/today?none=1");
  }

  const nextIds = enrollment.resource_ids.map((id, i) => (i === enrollment.current_index ? alternative.id : id));
  const supabase = await createClient();
  const { error } = await supabase.from("enrollments").update({ resource_ids: nextIds }).eq("id", enrollment.id);
  if (error) throw new Error(`Could not swap: ${error.message}`);
  revalidatePath("/today");
  redirect("/today?swapped=1");
}

/** Used when nothing shorter exists, or the current resource was removed by a curator. */
export async function skipResource(formData: FormData) {
  const { enrollment } = await requireContext(formData);
  await advance(enrollment.id, enrollment.current_index);
  revalidatePath("/today");
  redirect("/today");
}
