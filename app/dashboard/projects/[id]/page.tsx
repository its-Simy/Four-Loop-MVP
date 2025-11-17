import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Lightbulb } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyzeInsightsButton } from "@/components/ai/analyze-insights-button";
import { AIAssistantPanel } from "@/components/ai/ai-assistant-panel";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    redirect("/dashboard/projects");
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
    <DashboardLayout projects={projects || []}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <Badge variant="secondary">{project.status}</Badge>
            </div>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
          <AnalyzeInsightsButton projectId={id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{leadsCount || 0}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <Button asChild variant="link" className="mt-4 p-0">
                <Link href={`/dashboard/leads?project=${id}`}>View Leads →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{interviewsCount || 0}</p>
                </div>
                <MessageSquare className="h-10 w-10 text-green-600" />
              </div>
              <Button asChild variant="link" className="mt-4 p-0">
                <Link href={`/dashboard/interviews?project=${id}`}>View Interviews →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Insights</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{insightsCount || 0}</p>
                </div>
                <Lightbulb className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {project.target_market && (
            <Card>
              <CardHeader>
                <CardTitle>Target Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.target_market}</p>
              </CardContent>
            </Card>
          )}

          {project.problem_statement && (
            <Card>
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.problem_statement}</p>
              </CardContent>
            </Card>
          )}

          {project.solution_hypothesis && (
            <Card>
              <CardHeader>
                <CardTitle>Solution Hypothesis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{project.solution_hypothesis}</p>
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
    </DashboardLayout>
  );
}
