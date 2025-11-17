"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

interface DashboardLayoutProps {
  children: ReactNode;
  projects: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export function DashboardLayout({ children, projects }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          projects={projects}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
