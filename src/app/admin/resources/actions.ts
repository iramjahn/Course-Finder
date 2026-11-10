"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recomputeCompletionRates } from "@/lib/recompute";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/today");
  return user;
}

export async function recomputeAction() {
  await requireAdmin();
  const updated = await recomputeCompletionRates();
  revalidatePath("/admin/resources");
  redirect(`/admin/resources?recomputed=${updated}`);
}

/** Removes a resource from the catalog and from every curated path. Its events go with it (cascade). */
export async function removeResource(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("resource_id") ?? "");
  if (!id) redirect("/admin/resources");

  const admin = createAdminClient();
  const { data: paths, error: pathsError } = await admin
    .from("paths")
    .select("id, resource_ids")
    .contains("resource_ids", [id]);
  if (pathsError) throw new Error(`Could not read paths: ${pathsError.message}`);

  for (const path of (paths ?? []) as { id: string; resource_ids: string[] }[]) {
    const { error } = await admin
      .from("paths")
      .update({ resource_ids: path.resource_ids.filter((rid) => rid !== id) })
      .eq("id", path.id);
    if (error) throw new Error(`Could not update path: ${error.message}`);
  }

  const { error } = await admin.from("resources").delete().eq("id", id);
  if (error) throw new Error(`Could not remove resource: ${error.message}`);

  revalidatePath("/admin/resources");
  revalidatePath("/today");
  redirect("/admin/resources?removed=1");
}
