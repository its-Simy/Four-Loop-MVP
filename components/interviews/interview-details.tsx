"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Mail, Phone, Building, Briefcase } from 'lucide-react';
import { format } from "date-fns";
import Link from "next/link";

interface InterviewDetailsProps {
  interview: {
    id: string;
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    location: string | null;
    status: string;
    interview_type: string;
    notes: string | null;
    leads: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      company: string | null;
      title: string | null;
    } | null;
    projects: { name: string } | null;
  };
}

export function InterviewDetails({ interview }: InterviewDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{interview.title}</h1>
            <Badge variant="secondary">{interview.status}</Badge>
            <Badge variant="outline">{interview.interview_type.replace('_', ' ')}</Badge>
          </div>
          <Button variant="link" className="pl-0" asChild>
            <Link href="/dashboard/interviews">← Back to Interviews</Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit</Button>
          <Button>Start Interview</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm">{format(new Date(interview.scheduled_at), "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm">{interview.duration_minutes} minutes</p>
                </div>
              </div>

              {interview.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm">{interview.location}</p>
                  </div>
                </div>
              )}

              {interview.projects && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Project</p>
                    <p className="text-sm">{interview.projects.name}</p>
                  </div>
                </div>
              )}
            </div>

            {interview.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
                <p className="text-sm text-gray-600">{interview.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {interview.leads && (
          <Card>
            <CardHeader>
              <CardTitle>Interviewee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{interview.leads.name}</p>
                  {interview.leads.title && (
                    <p className="text-sm text-gray-600">{interview.leads.title}</p>
                  )}
                </div>
              </div>

              {interview.leads.company && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Building className="h-4 w-4 text-gray-400" />
                  {interview.leads.company}
                </div>
              )}

              {interview.leads.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a 
                    href={`mailto:${interview.leads.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {interview.leads.email}
                  </a>
                </div>
              )}

              {interview.leads.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a 
                    href={`tel:${interview.leads.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {interview.leads.phone}
                  </a>
                </div>
              )}

              <Button asChild variant="outline" className="w-full mt-4">
                <Link href={`/dashboard/leads?id=${interview.leads.id}`}>
                  View Full Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
