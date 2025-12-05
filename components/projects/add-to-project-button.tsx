"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

type ProjectOption = { id: string; name: string };

type AddToProjectButtonProps = {
  contactId: string;
  contactName: string;
  contactEmail?: string | null;
  contactCompany?: string | null;
  contactTitle?: string | null;
  contactLinkedIn?: string | null;
  projects: ProjectOption[];
  buttonClassName?: string;
  mode?: "contact" | "insight" | "project";
  insightTitle?: string | null;
  insightSummary?: string | null;
  insightCategory?: string | null;
  projectNote?: string | null;
};

export function AddToProjectButton({
  contactId,
  contactName,
  contactEmail,
  contactCompany,
  contactTitle,
  contactLinkedIn,
  projects,
  buttonClassName,
  mode = "contact",
  insightTitle,
  insightSummary,
  insightCategory,
  projectNote,
}: AddToProjectButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(projects[0]?.id);
  const [loading, setLoading] = useState(false);

  const options = useMemo(() => projects ?? [], [projects]);

  const handleAdd = async () => {
    if (!selectedProject) {
      alert("Pick a project first.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();

      if (mode === "insight") {
        const { error } = await supabase.from("insights").insert({
          project_id: selectedProject,
          insight_title: insightTitle || "Insight",
          summary: insightSummary || insightTitle || "",
          insight_text: insightSummary || insightTitle || "",
          category: insightCategory || "Captured",
          importance: "medium",
        });
        if (error) throw error;
      } else if (mode === "project") {
        await supabase.from("activities").insert({
          project_id: selectedProject,
          user_id: null,
          activity_type: "project_saved",
          title: "Project saved",
          description: projectNote || `Saved item: ${contactName || "Project"}`,
          metadata: { target_project: contactId, name: contactName },
        });
      } else {
        const { data: leadInsert, error } = await supabase
          .from("leads")
          .insert({
            name: contactName || "Contact",
            email: contactEmail || null,
            company: contactCompany || null,
            title: contactTitle || null,
            linkedin_url: contactLinkedIn || null,
            project_id: selectedProject,
            status: "new",
            source: "user_profile",
            notes: `Added from profile ${contactId}`,
          })
          .select("id")
          .single();
        if (error) throw error;

        if (leadInsert?.id) {
          await supabase.from("activities").insert({
            project_id: selectedProject,
            user_id: null,
            activity_type: "contact_added",
            title: "Contact added to project",
            description: `${contactName || "Contact"} added to project`,
            metadata: { contact_id: contactId, lead_id: leadInsert.id },
          });
        }
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("[add-to-project] failed", err);
      alert("Could not add to project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={buttonClassName || "border-white/20 bg-white/10 text-white hover:bg-white/20"}
        onClick={() => setOpen(true)}
      >
        Add to project
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-white">Add {contactName || "contact"} to a project</DialogTitle>
            <DialogDescription className="text-white">Choose the project to associate with this contact.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-white">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="text-white border-white/30 bg-white/10">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={loading}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                {loading ? "Adding..." : "Add to project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
