import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsHeader } from "@/components/leads/leads-header";
import { getDashboardSession } from "@/lib/dashboard/session";

export default async function LeadsPage() {
  const { supabase, projects } = await getDashboardSession();

  // Fetch all leads across projects
  const { data: leads } = await supabase
    .from("leads")
    .select(`
      *,
      projects(name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <LeadsHeader projects={projects} />
      <LeadsTable leads={leads || []} />
    </div>
  );
}
