import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch recent activities
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch upcoming interviews
  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, leads(name)")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  return (
    <DashboardLayout projects={projects || []}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-300 mt-1">Welcome back! Here&apos;s what&apos;s happening with your research.</p>
          </div>
        </div>

        <QuickStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed activities={activities || []} />
          </div>
          <div>
            <UpcomingInterviews interviews={interviews || []} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
