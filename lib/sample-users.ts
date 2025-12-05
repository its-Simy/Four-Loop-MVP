import sampleData from "@/scripts/meili-sample-data.json"

type SampleUser = {
  id: string
  name: string
  email?: string | null
  company?: string | null
  title?: string | null
  focuses?: string[]
  linkedin_url?: string | null
  bio?: string | null
}

const normalizeFocus = (value?: string | null) => value?.trim() || null

const upsertUser = (map: Map<string, SampleUser>, user: SampleUser, newFocuses: (string | null | undefined)[]) => {
  if (!user.id || !user.name) return
  const existing = map.get(user.id)
  const mergedFocuses = [
    ...(existing?.focuses ?? []),
    ...newFocuses.map(normalizeFocus).filter(Boolean) as string[],
  ]

  map.set(user.id, {
    id: user.id,
    name: user.name,
    email: user.email ?? existing?.email ?? null,
    company: user.company ?? existing?.company ?? null,
    title: user.title ?? existing?.title ?? null,
    linkedin_url:
      user.linkedin_url ??
      existing?.linkedin_url ??
      `https://www.linkedin.com/in/${user.id}`.toLowerCase(),
    bio: user.bio ?? existing?.bio ?? null,
    focuses: Array.from(new Set(mergedFocuses)).slice(0, 5),
  })
}

export const getSampleUsers = () => {
  const map = new Map<string, SampleUser>()

  // Project authors
  sampleData.projects?.forEach((project) => {
    const author = (project as any).author
    if (!author?.id) return
    upsertUser(
      map,
      {
        id: author.id,
        name: author.name,
        email: author.email,
        company: author.company,
        title: author.role,
        bio: (project as any).description,
      },
      [(project as any).name, (project as any).target_market, (project as any).category],
    )
  })

  // Leads treated as users for demo purposes
  sampleData.leads?.forEach((lead) => {
    upsertUser(
      map,
      {
        id: (lead as any).id,
        name: (lead as any).name,
        email: (lead as any).email,
        company: (lead as any).company,
        title: (lead as any).title,
      },
      [(lead as any).industry, (lead as any).project_id],
    )
  })

  // Insight authors for additional coverage
  sampleData.insights?.forEach((insight) => {
    const author = (insight as any).author
    if (!author?.id) return
    upsertUser(
      map,
      {
        id: author.id,
        name: author.name,
        title: author.role,
      },
      [(insight as any).summary, (insight as any).category],
    )
  })

  return Array.from(map.values())
}

export const searchSampleUsers = (query: string) => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return getSampleUsers()

  return getSampleUsers()
    .filter((user) => {
      const haystack = `${user.name ?? ""} ${user.company ?? ""} ${user.title ?? ""} ${user.email ?? ""} ${(
        user.focuses ?? []
      ).join(" ")}`
      return haystack.toLowerCase().includes(normalized)
    })
    .slice(0, 20)
}

export const getSampleUserById = (id: string) => getSampleUsers().find((user) => user.id === id) || null
