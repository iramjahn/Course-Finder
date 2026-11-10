"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UNIQUE_VIOLATION = "23505";

/** Stores the email in the waitlist table. Nothing else: no mail, no third party. */
export async function joinWaitlist(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) redirect("/?waitlist=invalid#waitlist");

  const admin = createAdminClient();
  const { error } = await admin.from("waitlist").insert({ email });
  if (error && error.code !== UNIQUE_VIOLATION) redirect("/?waitlist=error#waitlist");
  redirect("/?waitlist=joined#waitlist");
}
