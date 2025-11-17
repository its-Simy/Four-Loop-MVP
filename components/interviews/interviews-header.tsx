"use client";

import { Button } from "@/components/ui/button";
import { Plus, Calendar } from 'lucide-react';
import { useState } from "react";
import { ScheduleInterviewDialog } from "./schedule-interview-dialog";

interface InterviewsHeaderProps {
  projects: Array<{
    id: string;
    name: string;
  }>;
  leads: Array<{
    id: string;
    name: string;
    email: string | null;
    company: string | null;
    project_id: string;
  }>;
}

export function InterviewsHeader({ projects, leads }: InterviewsHeaderProps) {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-1">Schedule and manage customer discovery interviews</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsScheduleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      <ScheduleInterviewDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        projects={projects}
        leads={leads}
      />
    </>
  );
}
