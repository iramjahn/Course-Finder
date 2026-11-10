import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** completion_rate = (completed + 1) / (completed + abandoned + 2), for every resource. Arithmetic only. */
export async function recomputeCompletionRates(): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("recompute_completion_rates");
  if (error) throw new Error(`Recompute failed: ${error.message}`);
  return Number(data ?? 0);
}
