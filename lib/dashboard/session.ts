import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getDashboardSession() {
  const supabase = await createClient();
  console.log("[dashboard-session] Supabase client ready");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("[dashboard-session] user lookup failed", error);
    redirect("/auth/login");
  }

  console.log("[dashboard-session] user authenticated", {
    id: user.id,
    email: user.email,
  });

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  console.log("[dashboard-session] loaded project count", projects?.length ?? 0);

  return {
    supabase,
    user,
    projects: projects || [],
  };
}
