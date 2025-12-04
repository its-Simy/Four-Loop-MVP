import { NextResponse } from "next/server";
import { meiliClient, MEILI_INDEXES } from "@/lib/search/meilisearch-client";
import { createClient } from "@/lib/supabase/server";

const EMPTY_RESPONSE = {
  leads: [] as unknown[],
  projects: [] as unknown[],
  insights: [] as unknown[],
  counts: { leads: 0, projects: 0, insights: 0 },
};

const escapeFilterValue = (value: string) => value.replace(/"/g, '\\"');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(EMPTY_RESPONSE);
  }

  // Optional personalization based on the signed-in user's industry.
  let industry: string | undefined;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("industry")
        .eq("id", user.id)
        .single();
      industry = profile?.industry ?? undefined;
    }
  } catch (error) {
    console.error("Supabase profile lookup failed; continuing without personalization", error);
  }

  try {
    const { results } = await meiliClient.multiSearch({
      queries: [
        {
          indexUid: MEILI_INDEXES.leads,
          q,
          limit: 20,
          filter: industry ? [`industry = "${escapeFilterValue(industry)}"`] : undefined,
        },
        {
          indexUid: MEILI_INDEXES.projects,
          q,
          limit: 20,
          filter: industry ? [`category = "${escapeFilterValue(industry)}"`] : undefined,
        },
        {
          indexUid: MEILI_INDEXES.insights,
          q,
          limit: 20,
        },
      ],
    });

    const [leadsRes, projectsRes, insightsRes] = results;

    return NextResponse.json({
      leads: leadsRes.hits,
      projects: projectsRes.hits,
      insights: insightsRes.hits,
      counts: {
        leads: leadsRes.estimatedTotalHits ?? leadsRes.hits.length,
        projects: projectsRes.estimatedTotalHits ?? projectsRes.hits.length,
        insights: insightsRes.estimatedTotalHits ?? insightsRes.hits.length,
      },
    });
  } catch (error) {
    console.error("Meilisearch query failed", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
