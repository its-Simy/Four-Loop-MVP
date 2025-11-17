import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InterviewsHeader } from "@/components/interviews/interviews-header";
import { InterviewsCalendar } from "@/components/interviews/interviews-calendar";
import { InterviewsList } from "@/components/interviews/interviews-list";

export default async function InterviewsPage() {
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
    <DashboardLayout projects={projects || []}>
      <div className="space-y-6">
        <InterviewsHeader projects={projects || []} leads={leads || []} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InterviewsList interviews={interviews || []} />
          </div>
          <div>
            <InterviewsCalendar interviews={interviews || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
