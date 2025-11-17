"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb } from 'lucide-react';

interface Insight {
  category: string | null;
  importance: string;
  insight_text: string;
}

interface InsightsBreakdownProps {
  insights: Insight[];
}

export function InsightsBreakdown({ insights }: InsightsBreakdownProps) {
  // Group by category
  const categoryData = insights.reduce((acc, insight) => {
    const category = insight.category || 'uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by importance
  const importanceData = insights.reduce((acc, insight) => {
    const importance = insight.importance || 'medium';
    acc[importance] = (acc[importance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get high priority insights
  const highPriorityInsights = insights
    .filter(i => i.importance === 'high')
    .slice(0, 3);

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Insights Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">By Category</p>
          <div className="space-y-2">
            {Object.entries(categoryData).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-2 bg-gray-700/50 border border-white/10 rounded">
                <span className="text-sm text-white capitalize">
                  {category.replace('_', ' ')}
                </span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">By Priority</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(importanceData).map(([importance, count]) => {
              const colors = {
                high: 'bg-red-500/20 text-red-300 border-red-400/30',
                medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
                low: 'bg-green-500/20 text-green-300 border-green-400/30',
              };
              return (
                <div 
                  key={importance} 
                  className={`p-3 rounded-lg border ${colors[importance as keyof typeof colors] || 'bg-gray-700/50 text-gray-300 border-white/10'}`}
                >
                  <p className="text-xs font-medium uppercase">{importance}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {highPriorityInsights.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Top Priority Insights</p>
            <div className="space-y-2">
              {highPriorityInsights.map((insight, index) => (
                <div key={index} className="flex gap-2 p-2 bg-red-500/10 border border-red-400/30 rounded">
                  <Lightbulb className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-200">{insight.insight_text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
