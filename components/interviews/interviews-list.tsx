"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, MoreHorizontal, Video } from 'lucide-react';
import { format } from "date-fns";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Interview {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  status: string;
  interview_type: string;
  leads: { name: string; email: string | null; company: string | null } | null;
  projects: { name: string } | null;
}

interface InterviewsListProps {
  interviews: Interview[];
}

export function InterviewsList({ interviews }: InterviewsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "discovery":
        return "bg-purple-100 text-purple-800";
      case "problem_validation":
        return "bg-orange-100 text-orange-800";
      case "solution_validation":
        return "bg-teal-100 text-teal-800";
      case "usability":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-gray-800/50 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">All Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        {interviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No interviews scheduled yet. Create your first interview!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <div
                key={interview.id}
                className="p-4 rounded-lg bg-gray-700/30 border border-white/10 hover:border-blue-400/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">{interview.title}</h3>
                      <Badge className={getStatusColor(interview.status)} variant="secondary">
                        {interview.status}
                      </Badge>
                      <Badge className={getTypeColor(interview.interview_type)} variant="secondary">
                        {interview.interview_type.replace('_', ' ')}
                      </Badge>
                    </div>

                    {interview.leads && (
                      <div className="flex items-center gap-1 text-sm text-gray-300 mb-2">
                        <User className="h-4 w-4" />
                        <span>
                          {interview.leads.name}
                          {interview.leads.company && ` - ${interview.leads.company}`}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(interview.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {interview.duration_minutes} min
                      </div>
                      {interview.location && (
                        <div className="flex items-center gap-1">
                          {interview.location.toLowerCase().includes('zoom') || 
                           interview.location.toLowerCase().includes('video') ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          {interview.location}
                        </div>
                      )}
                    </div>

                    {interview.projects && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-400">
                          Project: {interview.projects.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/interviews/${interview.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Reschedule</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
