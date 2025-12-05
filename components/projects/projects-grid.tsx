"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Lightbulb, MoreHorizontal } from 'lucide-react';
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  target_market: string | null;
  created_at: string;
  leadsCount: number;
  interviewsCount: number;
  insightsCount: number;
}

interface ProjectsGridProps {
  projects: Project[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete project "${projectName}"? This cannot be undone.`)) return;
    try {
      setDeletingId(projectId);
      const supabase = createClient();
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) {
        console.error("Failed to delete project", error);
        alert("Could not delete project. Please try again.");
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="bg-gray-800/50 border-white/20 hover:border-blue-400/50 transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg text-white">{project.name}</CardTitle>
                <Badge variant="secondary" className="mt-2 bg-blue-500/20 text-blue-300 border-blue-400/30">
                  {project.status}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Archive</DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => {
                      e.preventDefault();
                      handleDelete(project.id, project.name);
                    }}
                  >
                    {deletingId === project.id ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {project.description && (
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            {project.target_market && (
              <div className="mb-4 p-2 bg-blue-500/10 border border-blue-400/30 rounded text-sm">
                <span className="font-medium text-blue-300">Target: </span>
                <span className="text-blue-200">{project.target_market}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-700/50 border border-white/10 rounded">
                <Users className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                <p className="text-lg font-bold text-white">{project.leadsCount}</p>
                <p className="text-xs text-gray-400">Leads</p>
              </div>
              <div className="text-center p-2 bg-gray-700/50 border border-white/10 rounded">
                <MessageSquare className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                <p className="text-lg font-bold text-white">{project.interviewsCount}</p>
                <p className="text-xs text-gray-400">Interviews</p>
              </div>
              <div className="text-center p-2 bg-gray-700/50 border border-white/10 rounded">
                <Lightbulb className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                <p className="text-lg font-bold text-white">{project.insightsCount}</p>
                <p className="text-xs text-gray-400">Insights</p>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
            </Button>
          </CardContent>
        </Card>
      ))}

      {projects.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-400">No projects yet. Create your first project to get started!</p>
        </div>
      )}
    </div>
  );
}
