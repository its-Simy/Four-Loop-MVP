"use client";

import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from 'lucide-react';
import { useState } from "react";
import { AddLeadDialog } from "./add-lead-dialog";
import { ImportLeadsDialog } from "./import-leads-dialog";

interface LeadsHeaderProps {
  projects: Array<{
    id: string;
    name: string;
  }>;
}

export function LeadsHeader({ projects }: LeadsHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage your potential interview candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      <AddLeadDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projects={projects}
      />

      <ImportLeadsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        projects={projects}
      />
    </>
  );
}
