import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSampleUserById } from "@/lib/sample-users"
import { AddToProjectButton } from "@/components/projects/add-to-project-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Linkedin, ArrowLeft, Building2, Briefcase, Target, User as UserIcon } from "lucide-react"

type ProfileView = {
  id: string
  name: string
  email?: string | null
  company?: string | null
  title?: string | null
  focuses?: string[]
  bio?: string | null
  linkedin_url?: string | null
  source?: string | null
}

const buildInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"

const buildFocuses = (profile: ProfileView) => {
  const fromData = (profile.focuses ?? []).filter(Boolean)
  const fallback: string[] = []
  if (profile.title) fallback.push(profile.title)
  if (profile.company) fallback.push(profile.company)
  if (profile.source) fallback.push(profile.source.replace("_", " "))
  if (fallback.length === 0) fallback.push("Product discovery", "Go-to-market", "Workflow optimization")
  return Array.from(new Set([...fromData, ...fallback])).slice(0, 4)
}

const buildDescription = (profile: ProfileView, focuses: string[]) => {
  if (profile.bio?.trim()) {
    const sentences = profile.bio.trim().match(/[^.!?]+[.!?]*/g) ?? []
    return sentences.slice(0, 3).join(" ").trim()
  }

  const role = profile.title ? `${profile.title}` : "operator"
  const company = profile.company ? ` at ${profile.company}` : ""
  const focus = focuses[0] ? `They focus on ${focuses[0].toLowerCase()}.` : ""
  return `${profile.name} is a ${role}${company}. ${focus}`.trim()
}

const buildLinkedIn = (profile: ProfileView) => {
  if (profile.linkedin_url) return profile.linkedin_url
  const slug = profile.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return `https://www.linkedin.com/in/${slug || profile.id}`
}

const persistProfile = async (profile: ProfileView, supabaseUserId?: string) => {
  const payload = {
    id: profile.id,
    email: profile.email ?? null,
    full_name: profile.name,
    company: profile.company ?? null,
    role: profile.title ?? null,
    updated_at: new Date().toISOString(),
  }

  try {
    const admin = createAdminClient()
    if (admin) {
      await admin.from("profiles").upsert(payload, { onConflict: "id" })
      return
    }

    if (supabaseUserId && supabaseUserId === profile.id) {
      const supabase = await createClient()
      await supabase.from("profiles").upsert(payload, { onConflict: "id" })
    }
  } catch (error) {
    console.error("[profile-persist] unable to save profile", error)
  }
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()

  // Primary: sample users from bundled JSON
  let profile: ProfileView | null = getSampleUserById(params.id)

  // If the ID matches the signed-in user, hydrate from Supabase profile
  if (!profile && supabaseUser && params.id === supabaseUser.id) {
    const { data: dbProfile } = await supabase
      .from("profiles")
      .select("id, email, full_name, company, role, bio")
      .eq("id", params.id)
      .single()

    if (dbProfile) {
      profile = {
        id: dbProfile.id,
        name: dbProfile.full_name || "User",
        email: dbProfile.email,
        company: dbProfile.company,
        title: dbProfile.role,
        bio: dbProfile.bio,
      }
    }
  }

  // Fallback: if a lead ID was clicked, show a basic profile so the link still works
  if (!profile && supabaseUser) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id, name, email, company, title, source, projects(name)")
      .eq("id", params.id)
      .single()

    if (lead) {
      profile = {
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company,
        title: lead.title,
        source: lead.source,
        focuses: [lead.projects?.name].filter(Boolean) as string[],
      }
    }
  }

  if (!profile) {
    redirect("/")
  }

  const focuses = buildFocuses(profile)
  const description = buildDescription(profile, focuses)
  const initials = buildInitials(profile.name)
  const linkedinUrl = buildLinkedIn(profile)
  await persistProfile(profile, supabaseUser?.id)

  // Load projects for add-to-project button
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-lg font-semibold text-white border border-blue-400/30">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                User profile
              </Badge>
            </div>
            <p className="text-white/80">
              {profile.title || "Team member"} {profile.company ? `• ${profile.company}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {projects && projects.length > 0 && (
            <AddToProjectButton
              contactId={profile.id}
              contactName={profile.name}
              contactEmail={profile.email}
              contactCompany={profile.company || undefined}
              contactTitle={profile.title || undefined}
              contactLinkedIn={profile.linkedin_url || undefined}
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
            <CardTitle className="text-white">Profile</CardTitle>
            <CardDescription className="text-slate-300">
              Overview and focus for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90 leading-relaxed">{description}</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">Key focuses</p>
              <div className="flex flex-wrap gap-2">
                {focuses.map((focus) => (
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
            <CardDescription className="text-slate-300">How to reach {profile.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.email && (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <Mail className="h-4 w-4 text-blue-200" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-sm text-white hover:underline">
                    {profile.email}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-400/30">
                <Linkedin className="h-4 w-4 text-sky-100" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/60">LinkedIn</p>
                <a
                  href={linkedinUrl}
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Work</CardTitle>
            <CardDescription className="text-slate-300">Where they work and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60">Company</p>
                <p className="text-sm text-white">{profile.company || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/60">Position</p>
                <p className="text-sm text-white">{profile.title || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-white">Recent activity</CardTitle>
            <CardDescription className="text-slate-300">
              Sample signal on what this user cares about
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {focuses.length > 0 ? (
              focuses.map((focus) => (
                <div
                  key={focus}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30">
                      <UserIcon className="h-4 w-4 text-blue-100" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{focus}</p>
                      <p className="text-xs text-white/60">Focus area</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-white/15 bg-white/5 text-white">
                    Active
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/70">No recent signals yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {projects && projects.length > 0 && (
        <div className="flex justify-end">
          <AddToProjectButton
            contactId={profile.id}
            contactName={profile.name}
            projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          />
        </div>
      )}
    </div>
  )
}
