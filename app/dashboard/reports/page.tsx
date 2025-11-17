import { ReportsOverview } from "@/components/reports/reports-overview";
import { InterviewMetrics } from "@/components/reports/interview-metrics";
import { LeadSourceChart } from "@/components/reports/lead-source-chart";
import { InsightsBreakdown } from "@/components/reports/insights-breakdown";
import { ValidationScorecard } from "@/components/reports/validation-scorecard";
import { getDashboardSession } from "@/lib/dashboard/session";

export default async function ReportsPage() {
  const { supabase, user } = await getDashboardSession();

  // Fetch aggregate data for reports
  const { data: leads } = await supabase
    .from("leads")
    .select("*, projects!inner(user_id)")
    .eq("projects.user_id", user.id);

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, projects!inner(user_id)")
    .eq("projects.user_id", user.id);

  const { data: insights } = await supabase
    .from("insights")
    .select("*, projects!inner(user_id)")
    .eq("projects.user_id", user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-gray-400 mt-1">Analyze your customer discovery progress and insights</p>
      </div>

      <ReportsOverview 
        leadsCount={leads?.length || 0}
        interviewsCount={interviews?.length || 0}
        insightsCount={insights?.length || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InterviewMetrics interviews={interviews || []} />
        <LeadSourceChart leads={leads || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsBreakdown insights={insights || []} />
        <ValidationScorecard insights={insights || []} interviews={interviews || []} />
      </div>
    </div>
  );
}
