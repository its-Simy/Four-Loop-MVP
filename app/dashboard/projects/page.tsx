import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch user's projects with counts
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Get counts for each project
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project) => {
      const [{ count: leadsCount }, { count: interviewsCount }, { count: insightsCount }] = await Promise.all([
        supabase.from("leads").select("*", { count: 'exact', head: true }).eq("project_id", project.id),
        supabase.from("interviews").select("*", { count: 'exact', head: true }).eq("project_id", project.id),
        supabase.from("insights").select("*", { count: 'exact', head: true }).eq("project_id", project.id),
      ]);

      return {
        ...project,
        leadsCount: leadsCount || 0,
        interviewsCount: interviewsCount || 0,
        insightsCount: insightsCount || 0,
      };
    })
  );

  return (
    <DashboardLayout projects={projects || []}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 mt-1">Manage your customer discovery projects</p>
          </div>
        </div>

        <ProjectsGrid projects={projectsWithCounts} />
      </div>
    </DashboardLayout>
  );
}
