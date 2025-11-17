import { InterviewsHeader } from "@/components/interviews/interviews-header";
import { InterviewsCalendar } from "@/components/interviews/interviews-calendar";
import { InterviewsList } from "@/components/interviews/interviews-list";
import { getDashboardSession } from "@/lib/dashboard/session";

export default async function InterviewsPage() {
  const { supabase, projects } = await getDashboardSession();

  // Fetch all interviews
  const { data: interviews } = await supabase
    .from("interviews")
    .select(`
      *,
      leads(id, name, email, company),
      projects(name)
    `)
    .order("scheduled_at", { ascending: true });

  // Fetch leads for scheduling
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <InterviewsHeader projects={projects} leads={leads || []} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InterviewsList interviews={interviews || []} />
        </div>
        <div>
          <InterviewsCalendar interviews={interviews || []} />
        </div>
      </div>
    </div>
  );
}
