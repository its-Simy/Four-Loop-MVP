import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SettingsForm } from "@/components/settings/settings-form";
import { AccountSettings } from "@/components/settings/account-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch user's projects for the layout
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardLayout projects={projects || []}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account and preferences</p>
        </div>

        <SettingsForm profile={profile} user={user} />
        <AccountSettings user={user} />
        <NotificationSettings profile={profile} />
      </div>
    </DashboardLayout>
  );
}
