"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, MessageSquare, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  project_created: FileText,
  lead_added: Users,
  interview_scheduled: MessageSquare,
  insight_added: TrendingUp,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No activity yet. Start by creating a project!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || FileText;
              return (
                <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-700 last:border-0">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-gray-300 mt-1">
                        {activity.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
