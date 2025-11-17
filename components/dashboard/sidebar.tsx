"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Users, MessageSquare, BarChart3, Settings, Plus, ChevronRight, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { CreateProjectDialog } from "./create-project-dialog";

interface SidebarProps {
  isOpen: boolean;
  projects: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Interviews", href: "/dashboard/interviews", icon: MessageSquare },
  { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ isOpen, projects, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProjects, setShowProjects] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    navigation.forEach((item) => {
      router.prefetch?.(item.href);
    });
  }, [router]);

  useEffect(() => {
    projects.slice(0, 5).forEach((project) => {
      router.prefetch?.(`/dashboard/projects/${project.id}`);
    });
  }, [projects, router]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {/* Projects Section */}
            <div className="pt-6">
              <div className="flex items-center justify-between px-3 mb-2">
                <button
                  onClick={() => setShowProjects(!showProjects)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-400"
                >
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showProjects && "rotate-90"
                    )}
                  />
                  Projects
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showProjects && (
                <div className="space-y-1">
                  {projects.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">No projects yet</p>
                  ) : (
                    projects.slice(0, 5).map((project) => (
                      <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white"
                      >
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    ))
                  )}
                  {projects.length > 5 && (
                    <Link
                      href="/dashboard/projects"
                      className="flex items-center px-3 py-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      View all projects
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>

      <CreateProjectDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}
