import { NextResponse } from "next/server";
import { meiliClient, MEILI_INDEXES } from "@/lib/search/meilisearch-client";
import { searchSampleUsers } from "@/lib/sample-users";
import { searchSampleInsights } from "@/lib/sample-insights";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EMPTY_RESPONSE = {
  leads: [] as unknown[],
  users: [] as unknown[],
  projects: [] as unknown[],
  insights: [] as unknown[],
  counts: { leads: 0, users: 0, projects: 0, insights: 0 },
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
  let dbProfiles:
    | {
        id: string;
        email: string | null;
        full_name: string | null;
        company: string | null;
        role: string | null;
      }[]
    | undefined;
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

    const admin = createAdminClient();
    if (admin) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, email, full_name, company, role")
        .or(
          [
            `full_name.ilike.%${q}%`,
            `company.ilike.%${q}%`,
            `role.ilike.%${q}%`,
            `email.ilike.%${q}%`,
          ].join(","),
        )
        .limit(50);
      dbProfiles = profiles ?? [];
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
    const sampleUsers = searchSampleUsers(q);
    const sampleInsights = searchSampleInsights(q);
    const mergedUsers = new Map<string, any>();
    const mergedInsights = new Map<string, any>();

    sampleUsers.forEach((user) => mergedUsers.set(user.id, user));
    dbProfiles?.forEach((profile) => {
      mergedUsers.set(profile.id, {
        id: profile.id,
        name: profile.full_name || "User",
        email: profile.email,
        company: profile.company,
        title: profile.role,
      });
    });

    insightsRes.hits.forEach((hit: any) => mergedInsights.set(hit.id, hit));
    sampleInsights.forEach((insight) => mergedInsights.set(insight.id, insight));

    const usersRes = Array.from(mergedUsers.values()).slice(0, 50);
    const insightsMerged = Array.from(mergedInsights.values()).slice(0, 50);

    return NextResponse.json({
      leads: leadsRes.hits,
      users: usersRes,
      projects: projectsRes.hits,
      insights: insightsMerged,
      counts: {
        leads: leadsRes.estimatedTotalHits ?? leadsRes.hits.length,
        users: usersRes.length,
        projects: projectsRes.estimatedTotalHits ?? projectsRes.hits.length,
        insights: insightsMerged.length,
      },
    });
  } catch (error) {
    console.error("Meilisearch query failed", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
