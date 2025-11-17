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
import { createClient } from "@/lib/supabase/client";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_market: "",
    problem_statement: "",
    solution_hypothesis: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            ...formData,
            user_id: user.id,
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Create initial activity
      await supabase.from("activities").insert([
        {
          project_id: data.id,
          user_id: user.id,
          activity_type: "project_created",
          title: "Project created",
          description: `Created new project: ${formData.name}`,
        },
      ]);

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Start a new customer discovery project to organize your research and interviews.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              required
              placeholder="e.g., AI Fitness App"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your project"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_market">Target Market</Label>
            <Input
              id="target_market"
              placeholder="e.g., Busy professionals aged 25-40"
              value={formData.target_market}
              onChange={(e) =>
                setFormData({ ...formData, target_market: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_statement">Problem Statement</Label>
            <Textarea
              id="problem_statement"
              placeholder="What problem are you trying to solve?"
              value={formData.problem_statement}
              onChange={(e) =>
                setFormData({ ...formData, problem_statement: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution_hypothesis">Solution Hypothesis</Label>
            <Textarea
              id="solution_hypothesis"
              placeholder="What solution are you proposing?"
              value={formData.solution_hypothesis}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  solution_hypothesis: e.target.value,
                })
              }
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
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
