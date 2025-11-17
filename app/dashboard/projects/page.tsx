import { ProjectsGrid } from "@/components/projects/projects-grid";
import { getDashboardSession } from "@/lib/dashboard/session";

type ProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  target_market: string | null;
  created_at: string;
};

type EnhancedProject = ProjectRecord & {
  leadsCount: number;
  interviewsCount: number;
  insightsCount: number;
};

export default async function ProjectsPage() {
  const { supabase, projects } = await getDashboardSession();
  const typedProjects = projects as ProjectRecord[];

  const projectsWithCounts: EnhancedProject[] = await Promise.all(
    typedProjects.map(async (project) => {
      const [{ count: leadsCount }, { count: interviewsCount }, { count: insightsCount }] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("project_id", project.id),
        supabase.from("interviews").select("*", { count: "exact", head: true }).eq("project_id", project.id),
        supabase.from("insights").select("*", { count: "exact", head: true }).eq("project_id", project.id),
      ]);

      return {
        ...project,
        leadsCount: leadsCount || 0,
        interviewsCount: interviewsCount || 0,
        insightsCount: insightsCount || 0,
      };
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Manage your customer discovery projects</p>
        </div>
      </div>

      <ProjectsGrid projects={projectsWithCounts} />
    </div>
  );
}
