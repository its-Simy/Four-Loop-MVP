import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, MessageSquare, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnalyzeInsightsButton } from "@/components/ai/analyze-insights-button"
import { AIAssistantPanel } from "@/components/ai/ai-assistant-panel"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import { EditProjectButton } from "@/components/projects/edit-project-button"
import { getDashboardSession } from "@/lib/dashboard/session"

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params
  const { supabase } = await getDashboardSession()

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    redirect("/dashboard/projects")
  }

  const [
    { count: leadsCount },
    { count: interviewsCount },
    { count: insightsCount },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: 'exact', head: true }).eq("project_id", id),
    supabase.from("interviews").select("*", { count: 'exact', head: true }).eq("project_id", id),
    supabase.from("insights").select("*", { count: 'exact', head: true }).eq("project_id", id),
  ]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              {project.status && (
                <Badge variant="secondary">{project.status}</Badge>
              )}
            </div>
            {project.description && (
              <p className="text-white/80">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <EditProjectButton project={project} />
            <AnalyzeInsightsButton projectId={id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Leads</p>
                  <p className="text-3xl font-bold text-white mt-2">{leadsCount || 0}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <Button asChild variant="link" className="mt-4 p-0">
                <Link href={`/dashboard/leads?project=${id}`}>View Leads →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Interviews</p>
                  <p className="text-3xl font-bold text-white mt-2">{interviewsCount || 0}</p>
                </div>
                <MessageSquare className="h-10 w-10 text-green-600" />
              </div>
              <Button asChild variant="link" className="mt-4 p-0">
                <Link href={`/dashboard/interviews?project=${id}`}>View Interviews →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Insights</p>
                  <p className="text-3xl font-bold text-white mt-2">{insightsCount || 0}</p>
                </div>
                <Lightbulb className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {project.target_market && (
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Target Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">{project.target_market}</p>
              </CardContent>
            </Card>
          )}

          {project.problem_statement && (
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">{project.problem_statement}</p>
              </CardContent>
            </Card>
          )}

          {project.solution_hypothesis && (
            <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Solution Hypothesis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white">{project.solution_hypothesis}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AIAssistantPanel 
        projectContext={{
          projectName: project.name,
          targetMarket: project.target_market || undefined,
          problemStatement: project.problem_statement || undefined,
        }}
      />

      <div className="flex justify-end">
        <DeleteProjectButton projectId={id} projectName={project.name} />
      </div>
    </>
  )
}
