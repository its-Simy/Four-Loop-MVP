import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";
import { WorkspaceSearch } from "@/components/dashboard/workspace-search";
import { WorkspaceDirectory } from "@/components/dashboard/workspace-directory";
import { NotesBoard } from "@/components/dashboard/notes-board";
import { EmailQueue } from "@/components/dashboard/email-queue";
import { getDashboardSession } from "@/lib/dashboard/session";

type ScheduledInterview = {
  scheduled_at: string | null;
};

type InsightRecord = {
  id: string;
  insight_title?: string | null;
  summary?: string | null;
  category?: string | null;
};

type LeadRecord = {
  id: string;
  name: string | null;
  company?: string | null;
  email?: string | null;
  projects?: { name?: string | null } | null;
};

export default async function DashboardPage() {
  const { supabase, projects } = await getDashboardSession();

  const nowIso = new Date().toISOString();

  const [
    { data: activities },
    { data: interviews },
    { data: leads },
    { data: insights },
  ] = await Promise.all([
    supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(25),
    supabase
      .from("interviews")
      .select("*, leads(name, company), projects(name)")
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("leads")
      .select("*, projects(name)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("insights").select("*").order("created_at", { ascending: false }).limit(50),
  ]);

  console.log("[dashboard] data snapshot", {
    activities: activities?.length ?? 0,
    interviews: interviews?.length ?? 0,
    leads: leads?.length ?? 0,
    insights: insights?.length ?? 0,
  });

  const upcomingInterviews =
    (interviews ?? [])
      .filter((interview: ScheduledInterview) => {
        if (!interview?.scheduled_at) {
          return false;
        }
        return interview.scheduled_at >= nowIso;
      })
      .slice(0, 5) ?? [];

  const noteSeed =
    (insights as InsightRecord[] | undefined)?.slice(0, 4).map((insight, index) => ({
      id: insight.id ?? `insight-${index}`,
      title: insight.insight_title || `Insight ${index + 1}`,
      body: insight.summary || "No summary available yet.",
      category: insight.category || "Insight",
      pinned: index === 0,
    })) ?? [];

  if (noteSeed.length === 0) {
    noteSeed.push({
      id: "placeholder-note",
      title: "Add your first note",
      body: "Capture customer quotes, meeting outcomes, or technology updates here.",
      category: "System",
      pinned: true,
    });
  }

  const emailSeed =
    (leads as LeadRecord[] | undefined)?.map((lead, index) => ({
      id: lead.id ?? `lead-${index}`,
      leadName: lead.name || "Prospect",
      company: lead.company,
      subject: `Intro request: ${projects[0]?.name ?? "Discovery project"}`,
      preview: `Hi ${lead.name || "there"},\nWe're exploring ${projects[0]?.name || "our solution"} and would love to learn about your experience with ${
        lead.company || "your team"
      }. Are you available for a quick conversation this week?`,
      priority: index + 1,
    })) ?? [];

  if (emailSeed.length === 0) {
    emailSeed.push(
      {
        id: "sample-email-1",
        leadName: "Sample Lead",
        company: "Acme Corp",
        subject: "Intro request: Customer discovery chat",
        preview:
          "Hi Sample, we're mapping the current workflow for AI-enabled research. Would you be open to a 20-minute chat about how your team approaches this today?",
        priority: 1,
      },
      {
        id: "sample-email-2",
        leadName: "Research Advisor",
        company: "Innovation Hub",
        subject: "Follow-up on last week's demo",
        preview:
          "Great speaking last week! I've attached the note summary and would love to walk through the interview guide before we speak with your SMEs.",
        priority: 2,
      },
    );
  }

  return (
    <div className="space-y-10">
      <WorkspaceSearch
        projects={projects}
        leads={leads || []}
        interviews={interviews || []}
        insights={insights || []}
      />

      <WorkspaceDirectory
        projects={projects}
        leads={leads || []}
        insights={insights || []}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <NotesBoard initialNotes={noteSeed} />
        <EmailQueue initialQueue={emailSeed.slice(0, 8)} />
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities || []} />
        </div>
        <div>
          <UpcomingInterviews interviews={upcomingInterviews} />
        </div>
      </div>
    </div>
  );
}
