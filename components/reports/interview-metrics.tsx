"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Interview {
  status: string;
  interview_type: string;
  scheduled_at: string;
}

interface InterviewMetricsProps {
  interviews: Interview[];
}

export function InterviewMetrics({ interviews }: InterviewMetricsProps) {
  // Group by status
  const statusData = interviews.reduce((acc, interview) => {
    const status = interview.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    count,
  }));

  // Group by type
  const typeData = interviews.reduce((acc, interview) => {
    const type = interview.interview_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Interview Status</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            No interview data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="status" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {Object.entries(typeData).map(([type, count]) => (
            <div key={type} className="p-3 bg-gray-700/50 border border-white/10 rounded-lg">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {type.replace('_', ' ')}
              </p>
              <p className="text-2xl font-bold text-white mt-1">{count}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
