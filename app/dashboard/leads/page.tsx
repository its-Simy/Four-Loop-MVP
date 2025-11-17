import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsHeader } from "@/components/leads/leads-header";

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all leads across projects
  const { data: leads } = await supabase
    .from("leads")
    .select(`
      *,
      projects(name)
    `)
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout projects={projects || []}>
      <div className="space-y-6">
        <LeadsHeader projects={projects || []} />
        <LeadsTable leads={leads || []} />
      </div>
    </DashboardLayout>
  );
}
