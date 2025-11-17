"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  full_name: string;
  company: string;
  bio: string;
}) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      company: data.company,
      bio: data.bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw error;
  }

  revalidatePath("/dashboard/settings");
}
