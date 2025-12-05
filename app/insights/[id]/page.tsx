import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getSampleInsightById } from "@/lib/sample-insights"
import sampleData from "@/scripts/meili-sample-data.json"
import { AddToProjectButton } from "@/components/projects/add-to-project-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Lightbulb, User as UserIcon, Briefcase, Link as LinkIcon } from "lucide-react"

type InsightView = {
  id: string
  title: string
  summary?: string | null
  category?: string | null
  project_id?: string | null
  project_name?: string | null
  research_url?: string | null
  author?: {
    id: string
    name: string
    title?: string | null
    company?: string | null
  } | null
}

type SampleProject = {
  id: string
  name: string
  description?: string | null
  target_market?: string | null
  category?: string | null
}

const getSampleProject = (id: string | null | undefined): SampleProject | null => {
  if (!id) return null
  const project = (sampleData.projects as SampleProject[] | undefined)?.find((project) => project.id === id)
  return project || null
}

export default async function InsightDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let insight: InsightView | null = null

  // Try DB first
  try {
    const { data: dbInsight } = await supabase
      .from("insights")
      .select("id, insight_title, summary, insight_text, category, project_id, research_url")
      .eq("id", params.id)
      .single()

    if (dbInsight) {
      insight = {
        id: dbInsight.id,
        title: dbInsight.insight_title || "Insight",
        summary: dbInsight.summary || dbInsight.insight_text || null,
        category: dbInsight.category || null,
        project_id: dbInsight.project_id || null,
        research_url: dbInsight.research_url || null,
      }
    }
  } catch (error) {
    console.error("[insight-detail] DB fetch failed", error)
  }

  // Sample fallback
  if (!insight) {
    const sampleInsight = getSampleInsightById(params.id)
    if (sampleInsight) {
      insight = {
        id: sampleInsight.id,
        title: sampleInsight.insight_title || "Insight",
        summary: sampleInsight.summary || null,
        category: sampleInsight.category || null,
        project_id: sampleInsight.project_id || null,
        author: sampleInsight.author
          ? {
              id: sampleInsight.author.id,
              name: sampleInsight.author.name,
              title: sampleInsight.author.title || null,
              company: sampleInsight.author.company || null,
            }
          : null,
      }
    }
  }

  if (!insight) {
    redirect("/")
  }

  // Enrich project info
  let projectName: string | null = insight.project_name || null
  let researchUrl = insight.research_url || null
  if (insight.project_id) {
    try {
      const { data: project } = await supabase
        .from("projects")
        .select("id, name, description, target_market, research_url")
        .eq("id", insight.project_id)
        .single()

      if (project) {
        projectName = project.name
        researchUrl = project.research_url || researchUrl
        insight.summary = insight.summary || project.description
      }
    } catch (error) {
      console.error("[insight-detail] project fetch failed", error)
    }

    if (!projectName) {
      const sampleProject = getSampleProject(insight.project_id)
      if (sampleProject) {
        projectName = sampleProject.name
        insight.summary = insight.summary || sampleProject.description || null
      }
    }
  }

  const authorLink = insight.author ? `/users/${insight.author.id}` : undefined
  const researchLink = researchUrl || (insight.project_id ? `https://docs.fourloop.ai/projects/${insight.project_id}` : "#")
  const { data: projects } =
    user
      ? await supabase.from("projects").select("id, name").eq("user_id", user.id).order("created_at", { ascending: false })
      : { data: [] }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{insight.title}</h1>
            {insight.category && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-100 border-purple-400/30">
                {insight.category}
              </Badge>
            )}
          </div>
          <p className="text-white/80">
            {projectName ? `Linked project: ${projectName}` : "Standalone insight"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {projects && projects.length > 0 && (
            <AddToProjectButton
              mode="insight"
              contactId={insight.id}
              contactName={insight.title}
              insightTitle={insight.title}
              insightSummary={insight.summary}
              insightCategory={insight.category}
              projects={projects.map((p) => ({ id: p.id, name: p.name }))}
              buttonClassName="border border-green-500 bg-transparent text-white hover:bg-green-700/30 hover:border-green-400"
            />
          )}
          <Button variant="outline" asChild className="border-white/20 bg-white/5 text-white hover:bg-white/10">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to workspace
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Summary</CardTitle>
            <CardDescription className="text-slate-300">
              What this insight tells us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90 leading-relaxed">
              {insight.summary || "No summary available yet."}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">Category</p>
                <p className="text-sm text-white">{insight.category || "Not set"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-white/60">Project</p>
                <p className="text-sm text-white">{projectName || "Not linked"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Research</CardTitle>
            <CardDescription className="text-slate-300">See the paper or deck</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">Supporting research</p>
                <p className="text-xs text-white/60">Data backing this insight</p>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href={researchLink} target="_blank">
                Open research
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Author</CardTitle>
            <CardDescription className="text-slate-300">Who surfaced this insight</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.author ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <UserIcon className="h-5 w-5 text-blue-100" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{insight.author.name}</p>
                    <p className="text-xs text-white/70">
                      {insight.author.title || "Contributor"}{" "}
                      {insight.author.company ? `• ${insight.author.company}` : ""}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={authorLink || "#"}>{authorLink ? "View profile" : "Profile unavailable"}</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-white/70">No author recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Context</CardTitle>
            <CardDescription className="text-slate-300">
              Quick tags and links related to this insight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                  <Lightbulb className="h-4 w-4 text-yellow-100" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Signal type</p>
                  <p className="text-xs text-white/60">{insight.category || "Uncategorized"}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                Insight
              </Badge>
            </div>
            {projectName && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                    <Briefcase className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Project</p>
                    <p className="text-xs text-white/60">{projectName}</p>
                  </div>
                </div>
                {insight.project_id && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/projects/${insight.project_id}`}>Open project</Link>
                  </Button>
                )}
              </div>
            )}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                  <LinkIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Research link</p>
                  <p className="text-xs text-white/60">Open supporting doc</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={researchLink} target="_blank">
                  Open
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
