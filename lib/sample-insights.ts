import sampleData from "@/scripts/meili-sample-data.json"

type SampleInsight = {
  id: string
  insight_title?: string | null
  summary?: string | null
  category?: string | null
  project_id?: string | null
  author?: {
    id: string
    name: string
    role?: string | null
    company?: string | null
  }
}

const normalizeText = (value?: string | null) => value?.trim() || null

export const getSampleInsightById = (id: string) => {
  const insight = (sampleData.insights as SampleInsight[] | undefined)?.find((insight) => insight.id === id)
  if (!insight) return null
  return {
    id: insight.id,
    insight_title: normalizeText(insight.insight_title) || "Insight",
    summary: normalizeText(insight.summary),
    category: normalizeText(insight.category),
    project_id: insight.project_id || null,
    author: insight.author
      ? {
          id: insight.author.id,
          name: insight.author.name,
          title: normalizeText(insight.author.role),
          company: normalizeText(insight.author.company),
        }
      : null,
  }
}

export const searchSampleInsights = (query: string) => {
  const normalized = query.trim().toLowerCase()
  const insights = (sampleData.insights as SampleInsight[] | undefined) || []
  if (!normalized) return insights.slice(0, 20)

  return insights
    .filter((insight) => {
      const haystack = `${insight.insight_title ?? ""} ${insight.summary ?? ""} ${insight.category ?? ""}`
      return haystack.toLowerCase().includes(normalized)
    })
    .slice(0, 20)
}
