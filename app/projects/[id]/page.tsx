import { redirect } from "next/navigation"
import Link from "next/link"
import sampleData from "@/scripts/meili-sample-data.json"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Link as LinkIcon, Sparkles, User as UserIcon } from "lucide-react"
import { AddToProjectButton } from "@/components/projects/add-to-project-button"

type SampleProject = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  target_market?: string | null
  status?: string | null
  author?: {
    id: string
    name: string
    role?: string | null
    company?: string | null
    email?: string | null
  }
}

type ProjectView = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  target_market?: string | null
  status?: string | null
  research_url?: string | null
  author?: {
    id: string
    name: string
    title?: string | null
    company?: string | null
    email?: string | null
    linkedin_url?: string | null
  } | null
}

type Leader = {
  id: string
  name: string
  title?: string | null
  company?: string | null
  email?: string | null
  linkedin_url?: string | null
}

const getSampleProject = (id: string): ProjectView | null => {
  const project = (sampleData.projects as SampleProject[] | undefined)?.find((p) => p.id === id)
  if (!project) return null
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    category: project.category,
    target_market: project.target_market,
    status: project.status ?? "active",
    author: project.author
      ? {
          id: project.author.id,
          name: project.author.name,
          title: project.author.role,
          company: project.author.company,
          email: project.author.email,
          linkedin_url: `https://www.linkedin.com/in/${project.author.id}`,
        }
      : null,
    research_url: `https://docs.fourloop.ai/projects/${project.id}`,
  }
}

const buildLeadersFromSamples = (projectId: string): Leader[] => {
  const leads = (sampleData.leads as any[] | undefined) || []
  return leads
    .filter((lead) => lead.project_id === projectId)
    .slice(0, 4)
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      title: lead.title,
      company: lead.company,
      email: lead.email,
      linkedin_url: lead.linkedin_url || `https://www.linkedin.com/in/${lead.id}`,
    }))
}

const buildLinkedIn = (leader: Leader) => {
  if (leader.linkedin_url) return leader.linkedin_url
  const slug = leader.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return `https://www.linkedin.com/in/${slug || leader.id}`
}

export default async function ProjectProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let project: ProjectView | null = getSampleProject(params.id)
  let leaders: Leader[] = buildLeadersFromSamples(params.id)
  const { data: userProjects } = user
    ? await supabase.from("projects").select("id, name").eq("user_id", user.id).order("created_at", { ascending: false })
    : { data: [] }

  // Try to hydrate from Supabase projects/leads if available
  try {
    const { data: dbProject } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .single()

    if (dbProject) {
      project = {
        id: dbProject.id,
        name: dbProject.name,
        description: dbProject.description,
        category: dbProject.category,
        target_market: dbProject.target_market,
        status: dbProject.status,
        research_url: dbProject.research_url ?? `https://docs.fourloop.ai/projects/${dbProject.id}`,
      }
    }

    const { data: dbLeads } = await supabase
      .from("leads")
      .select("id, name, email, company, title, linkedin_url")
      .eq("project_id", params.id)
      .limit(6)

    if (dbLeads && dbLeads.length > 0) {
      leaders = dbLeads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        title: lead.title,
        company: lead.company,
        email: lead.email,
        linkedin_url: lead.linkedin_url || `https://www.linkedin.com/in/${lead.id}`,
      }))
    }
  } catch (error) {
    console.error("[project-profile] supabase fetch failed; using sample data", error)
  }

  if (!project) {
    redirect("/")
  }

  const uniqueLeaders = new Map<string, Leader>()
  leaders.forEach((leader) => uniqueLeaders.set(leader.id, leader))
  if (project.author) {
    uniqueLeaders.set(project.author.id, {
      id: project.author.id,
      name: project.author.name,
      title: project.author.title,
      company: project.author.company,
      email: project.author.email,
      linkedin_url: project.author.linkedin_url || `https://www.linkedin.com/in/${project.author.id}`,
    })
  }

  const orderedLeaders = Array.from(uniqueLeaders.values()).slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              {project.status && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                  {project.status}
                </Badge>
              )}
            </div>
            <p className="text-white">
              {project.category || "Project"} {project.target_market ? `• Target: ${project.target_market}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user && userProjects && userProjects.length > 0 && (
              <AddToProjectButton
                mode="project"
                contactId={project.id}
                contactName={project.name}
                projectNote={project.description || undefined}
                projects={userProjects.map((p) => ({ id: p.id, name: p.name }))}
                buttonClassName="border border-green-500 bg-transparent text-white hover:bg-green-700/30 hover:border-green-400"
              />
            )}
            <Button variant="outline" asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to workspace
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
              <CardDescription className="text-white/80">
                Overview and positioning for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white leading-relaxed">
                {project.description || "No summary available yet."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/80">Category</p>
                  <p className="text-sm text-white">{project.category || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/80">Target market</p>
                  <p className="text-sm text-white">{project.target_market || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Research</CardTitle>
              <CardDescription className="text-white/80">
                Link to the project research deck or paper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                  <LinkIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">Research paper</p>
                  <p className="text-xs text-white/80">Insights and validation for this project</p>
                </div>
              </div>
              <Button asChild className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20">
                <Link href={project.research_url || `https://docs.fourloop.ai/projects/${project.id}`} target="_blank">
                  Open research paper
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Owner</CardTitle>
              <CardDescription className="text-white/80">Primary contact for this project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.author ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                      <UserIcon className="h-5 w-5 text-blue-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{project.author.name}</p>
                      <p className="text-xs text-white/80">
                        {project.author.title || "Project lead"} {project.author.company ? `• ${project.author.company}` : ""}
                      </p>
                    </div>
                  </div>
                  {project.author.email && (
                    <p className="text-xs text-white/80">{project.author.email}</p>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Link href={project.author.linkedin_url || `https://www.linkedin.com/in/${project.author.id}`} target="_blank">
                      View LinkedIn
                    </Link>
                  </Button>
                </>
              ) : (
              <p className="text-sm text-white">No owner recorded yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Leaders involved</CardTitle>
              <CardDescription className="text-white/80">
                Core stakeholders and their LinkedIn profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {orderedLeaders.length > 0 ? (
                orderedLeaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{leader.name}</p>
                        <p className="text-xs text-white/80">
                          {leader.title || "Contributor"} {leader.company ? `• ${leader.company}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="min-w-[110px] border-white/20 bg-white/10 text-white hover:bg-white/20"
                    >
                      <Link href={buildLinkedIn(leader)} target="_blank">
                        LinkedIn
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white">No leaders recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
