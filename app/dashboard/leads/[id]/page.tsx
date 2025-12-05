import { redirect } from "next/navigation"
import Link from "next/link"
import { getDashboardSession } from "@/lib/dashboard/session"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Linkedin, ArrowLeft, Building2, Briefcase, Sparkles, Target, User } from "lucide-react"

type LeadProfile = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  title: string | null
  linkedin_url: string | null
  source: string | null
  status: string | null
  notes: string | null
  projects?: {
    name: string | null
    target_market: string | null
  } | null
}

const buildInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const buildFocusAreas = (lead: LeadProfile) => {
  const segments =
    lead.notes
      ?.split(/[\n•\-]+/g)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 3) || []

  const fallback: string[] = []

  if (lead.projects?.target_market) {
    fallback.push(lead.projects.target_market)
  }

  if (lead.title) {
    fallback.push(lead.title)
  }

  if (lead.source) {
    fallback.push(`Source: ${lead.source.replace("_", " ")}`)
  }

  const defaults = ["Discovery interviews", "Workflow pain points", "Adoption risks"]

  return (segments.length ? segments : [...fallback, ...defaults]).slice(0, 3)
}

const formatTimestamp = (value: string | null) => {
  if (!value) return "TBD"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const buildDescription = (lead: LeadProfile, focusAreas: string[]) => {
  if (lead.notes?.trim()) {
    const sentences = lead.notes.trim().match(/[^.!?]+[.!?]*/g) ?? []
    return sentences.slice(0, 3).join(" ").trim()
  }

  const whereTheyWork = lead.company ? ` at ${lead.company}` : ""
  const role = lead.title ? `serves as ${lead.title}` : "is a key contact"
  const project = lead.projects?.name ? `They are involved with ${lead.projects.name}. ` : ""
  const focus = focusAreas[0] ? `They focus on ${focusAreas[0].toLowerCase()}.` : ""

  return `${lead.name} ${role}${whereTheyWork}. ${project}${focus}`.trim()
}

export default async function LeadProfilePage({ params }: { params: { id: string } }) {
  const { supabase } = await getDashboardSession()

  const { data: lead } = await supabase
    .from("leads")
    .select(
      `
        *,
        projects(name, target_market)
      `,
    )
    .eq("id", params.id)
    .single()

  if (!lead) {
    redirect("/dashboard/leads")
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select("id, title, scheduled_at, status")
    .eq("lead_id", params.id)
    .order("scheduled_at", { ascending: true })

  const leadProfile = lead as LeadProfile
  const focusAreas = buildFocusAreas(leadProfile)
  const description = buildDescription(leadProfile, focusAreas)
  const initials = buildInitials(leadProfile.name)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-lg font-semibold text-white border border-blue-400/30">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{leadProfile.name}</h1>
              {leadProfile.status && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                  {leadProfile.status}
                </Badge>
              )}
            </div>
            <p className="text-white/80">
              {leadProfile.title || "Contact"} {leadProfile.company ? `• ${leadProfile.company}` : ""}
            </p>
            {leadProfile.projects?.name && (
              <p className="text-xs text-white/60">Project: {leadProfile.projects.name}</p>
            )}
          </div>
        </div>

        <Button variant="outline" asChild className="border-white/20 bg-white/5 text-white hover:bg-white/10">
          <Link href="/dashboard/leads">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to leads
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription className="text-slate-300">
                Overview and focus for this contact
              </CardDescription>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30" variant="secondary">
              {leadProfile.projects?.name ? "In discovery" : "Workspace contact"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90 leading-relaxed">{description}</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">Key focuses</p>
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((focus) => (
                  <Badge key={focus} variant="outline" className="border-white/20 text-white bg-white/5">
                    <Target className="h-3 w-3" />
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Contact</CardTitle>
            <CardDescription className="text-slate-300">How to reach {leadProfile.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadProfile.email && (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <Mail className="h-4 w-4 text-blue-200" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60">Email</p>
                  <a href={`mailto:${leadProfile.email}`} className="text-sm text-white hover:underline">
                    {leadProfile.email}
                  </a>
                </div>
              </div>
            )}

            {leadProfile.linkedin_url && (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-400/30">
                  <Linkedin className="h-4 w-4 text-sky-100" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60">LinkedIn</p>
                  <a
                    href={leadProfile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white hover:underline"
                  >
                    View profile
                  </a>
                </div>
                <Badge variant="outline" className="border-white/10 bg-white/5 text-white">
                  Open
                </Badge>
              </div>
            )}

            {leadProfile.phone && (
              <p className="text-sm text-white/80">Phone: {leadProfile.phone}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Work</CardTitle>
            <CardDescription className="text-slate-300">Where they sit today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60">Company</p>
                <p className="text-sm text-white">{leadProfile.company || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60">Position</p>
                <p className="text-sm text-white">{leadProfile.title || "Not provided"}</p>
              </div>
            </div>
            {leadProfile.projects?.name && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Project</p>
                  <p className="text-sm text-white">{leadProfile.projects.name}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Interview timeline</CardTitle>
            <CardDescription className="text-slate-300">
              Recently scheduled conversations for this contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {interviews && interviews.length > 0 ? (
              <div className="space-y-2">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                        <User className="h-4 w-4 text-blue-100" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{interview.title}</p>
                        <p className="text-xs text-white/60">{formatTimestamp(interview.scheduled_at)}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                      {interview.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/70">No interviews scheduled for this contact yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
