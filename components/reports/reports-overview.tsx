"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, Lightbulb, TrendingUp } from 'lucide-react';

interface ReportsOverviewProps {
  leadsCount: number;
  interviewsCount: number;
  insightsCount: number;
}

export function ReportsOverview({ leadsCount, interviewsCount, insightsCount }: ReportsOverviewProps) {
  const completedInterviews = 0; // You can calculate from interviews data
  const conversionRate = leadsCount > 0 ? Math.round((interviewsCount / leadsCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Leads</p>
              <p className="text-3xl font-bold text-white mt-2">{leadsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Potential interviews</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Interviews</p>
              <p className="text-3xl font-bold text-white mt-2">{interviewsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled & completed</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Key Insights</p>
              <p className="text-3xl font-bold text-white mt-2">{insightsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Captured learnings</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
              <p className="text-3xl font-bold text-white mt-2">{conversionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Leads to interviews</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
