"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Target } from 'lucide-react';

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Total Leads</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Interviews</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Key Insights</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Validation %</p>
              <p className="text-3xl font-bold text-white mt-2">0%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
