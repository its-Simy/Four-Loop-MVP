"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Profile {
  id: string;
  full_name: string | null;
}

interface NotificationSettingsProps {
  profile: Profile | null;
}

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [insightUpdates, setInsightUpdates] = useState(true);

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Notification Preferences</CardTitle>
        <CardDescription className="text-gray-400">
          Choose how you want to be notified about updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-white/10 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-white">Email Notifications</Label>
            <p className="text-sm text-gray-400">Receive email updates about your account</p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-white/10 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="interview-reminders" className="text-white">Interview Reminders</Label>
            <p className="text-sm text-gray-400">Get reminded about upcoming interviews</p>
          </div>
          <Switch
            id="interview-reminders"
            checked={interviewReminders}
            onCheckedChange={setInterviewReminders}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-white/10 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="weekly-digest" className="text-white">Weekly Digest</Label>
            <p className="text-sm text-gray-400">Summary of your activity each week</p>
          </div>
          <Switch
            id="weekly-digest"
            checked={weeklyDigest}
            onCheckedChange={setWeeklyDigest}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-700/30 border border-white/10 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="insight-updates" className="text-white">Insight Updates</Label>
            <p className="text-sm text-gray-400">Notifications when new insights are added</p>
          </div>
          <Switch
            id="insight-updates"
            checked={insightUpdates}
            onCheckedChange={setInsightUpdates}
          />
        </div>
      </CardContent>
    </Card>
  );
}
