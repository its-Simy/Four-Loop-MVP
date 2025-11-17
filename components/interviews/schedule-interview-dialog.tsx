"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ScheduleInterviewDialog({ 
  open, 
  onOpenChange, 
  projects,
  leads 
}: ScheduleInterviewDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: "",
    lead_id: "",
    title: "",
    scheduled_at: "",
    duration_minutes: "30",
    location: "",
    interview_type: "discovery",
    notes: "",
  });

  const availableLeads = formData.project_id 
    ? leads.filter(lead => lead.project_id === formData.project_id)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("interviews")
        .insert([{
          ...formData,
          duration_minutes: parseInt(formData.duration_minutes),
          status: 'scheduled',
        }])
        .select()
        .single();

      if (error) throw error;

      // Update lead status
      if (formData.lead_id) {
        await supabase
          .from("leads")
          .update({ status: "scheduled" })
          .eq("id", formData.lead_id);
      }

      // Create activity
      await supabase.from("activities").insert([
        {
          project_id: formData.project_id,
          user_id: user.id,
          activity_type: "interview_scheduled",
          title: "Interview scheduled",
          description: `Scheduled interview: ${formData.title}`,
        },
      ]);

      setFormData({
        project_id: "",
        lead_id: "",
        title: "",
        scheduled_at: "",
        duration_minutes: "30",
        location: "",
        interview_type: "discovery",
        notes: "",
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error scheduling interview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Schedule a customer discovery interview with a lead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) =>
                setFormData({ ...formData, project_id: value, lead_id: "" })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_id">Lead</Label>
            <Select
              value={formData.lead_id}
              onValueChange={(value) =>
                setFormData({ ...formData, lead_id: value })
              }
              disabled={!formData.project_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a lead (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableLeads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} {lead.company ? `- ${lead.company}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Interview Title *</Label>
            <Input
              id="title"
              required
              placeholder="e.g., Discovery Call - Pain Points"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date & Time *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                required
                value={formData.scheduled_at}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_at: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Select
                value={formData.duration_minutes}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration_minutes: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interview_type">Interview Type</Label>
              <Select
                value={formData.interview_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, interview_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovery">Discovery</SelectItem>
                  <SelectItem value="problem_validation">Problem Validation</SelectItem>
                  <SelectItem value="solution_validation">Solution Validation</SelectItem>
                  <SelectItem value="usability">Usability Testing</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Zoom, Phone, In-person..."
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any prep notes or objectives for this interview..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
