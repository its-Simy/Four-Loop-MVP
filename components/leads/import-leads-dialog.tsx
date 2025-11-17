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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export function ImportLeadsDialog({ open, onOpenChange, projects }: ImportLeadsDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const leads = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const lead: any = { project_id: projectId };
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        if (header === 'name' || header === 'full name') lead.name = value;
        else if (header === 'email') lead.email = value;
        else if (header === 'phone') lead.phone = value;
        else if (header === 'company') lead.company = value;
        else if (header === 'title' || header === 'job title') lead.title = value;
        else if (header === 'linkedin' || header === 'linkedin_url') lead.linkedin_url = value;
        else if (header === 'source') lead.source = value;
        else if (header === 'notes') lead.notes = value;
      });
      
      if (lead.name) {
        leads.push(lead);
      }
    }
    
    return leads;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !projectId) return;

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const text = await file.text();
      const leads = parseCSV(text);

      if (leads.length === 0) {
        throw new Error("No valid leads found in CSV");
      }

      const { error } = await supabase
        .from("leads")
        .insert(leads);

      if (error) throw error;

      // Create activity
      await supabase.from("activities").insert([
        {
          project_id: projectId,
          user_id: user.id,
          activity_type: "lead_added",
          title: "Leads imported",
          description: `Imported ${leads.length} leads from CSV`,
        },
      ]);

      setFile(null);
      setProjectId("");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error importing leads:", error);
      alert(error instanceof Error ? error.message : "Failed to import leads");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your leads. Expected columns: name, email, phone, company, title, linkedin_url, source, notes
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import_project_id">Project *</Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
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
            <Label htmlFor="csv_file">CSV File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="csv_file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="csv_file" className="cursor-pointer">
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-10 w-10 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click to upload CSV</p>
                    <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>CSV Format:</strong> Include headers in the first row. Minimum required column is &apos;name&apos;.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !file || !projectId}>
              {isLoading ? "Importing..." : "Import Leads"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
