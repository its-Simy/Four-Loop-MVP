"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Lead {
  source: string | null;
}

interface LeadSourceChartProps {
  leads: Lead[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function LeadSourceChart({ leads }: LeadSourceChartProps) {
  // Group by source
  const sourceData = leads.reduce((acc, lead) => {
    const source = lead.source || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sourceData).map(([source, value]) => ({
    name: source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' '),
    value,
  }));

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Lead Sources</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No lead data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-400">{item.name}: </span>
              <span className="font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
