"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

type EditableProject = {
  id: string;
  name: string;
  description?: string | null;
  target_market?: string | null;
  problem_statement?: string | null;
  solution_hypothesis?: string | null;
};

type EditProjectButtonProps = {
  project: EditableProject;
};

export function EditProjectButton({ project }: EditProjectButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name || "",
    description: project.description || "",
    target_market: project.target_market || "",
    problem_statement: project.problem_statement || "",
    solution_hypothesis: project.solution_hypothesis || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("projects")
        .update({
          name: formData.name,
          description: formData.description,
          target_market: formData.target_market,
          problem_statement: formData.problem_statement,
          solution_hypothesis: formData.solution_hypothesis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);
      if (error) throw error;
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Could not update project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        Edit project
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Project</DialogTitle>
            <DialogDescription className="text-white">
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Project Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-white/40 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border-white/40 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_market" className="text-white">Target Market</Label>
              <Input
                id="target_market"
                value={formData.target_market}
                onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                className="border-white/40 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problem_statement" className="text-white">Problem Statement</Label>
              <Textarea
                id="problem_statement"
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                className="border-white/40 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution_hypothesis" className="text-white">Solution Hypothesis</Label>
              <Textarea
                id="solution_hypothesis"
                value={formData.solution_hypothesis}
                onChange={(e) => setFormData({ ...formData, solution_hypothesis: e.target.value })}
                className="border-white/40 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
