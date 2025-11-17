"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from 'lucide-react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Interview {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  leads: { name: string } | null;
}

interface UpcomingInterviewsProps {
  interviews: Interview[];
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">No interviews scheduled</p>
            <Button asChild size="sm">
              <Link href="/dashboard/interviews">Schedule Interview</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 rounded-lg border border-white/20 hover:border-blue-400 transition-colors bg-gray-700/30"
              >
                <h4 className="font-medium text-white">{interview.title}</h4>
                {interview.leads && (
                  <p className="text-sm text-gray-300 mt-1">
                    with {interview.leads.name}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(interview.scheduled_at), "MMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {interview.duration_minutes}min
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
