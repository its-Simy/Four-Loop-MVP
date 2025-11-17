import { SettingsForm } from "@/components/settings/settings-form";
import { AccountSettings } from "@/components/settings/account-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { getDashboardSession } from "@/lib/dashboard/session";

export default async function SettingsPage() {
  const { supabase, user } = await getDashboardSession();

  // Fetch user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <SettingsForm profile={profile} user={user} />
      <AccountSettings user={user} />
      <NotificationSettings profile={profile} />
    </div>
  );
}
