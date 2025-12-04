"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type DirectoryProject = {
  id: string;
  name: string;
  status?: string | null;
  description?: string | null;
  target_market?: string | null;
};

type DirectoryLead = {
  id: string;
  name: string | null;
  company?: string | null;
  email?: string | null;
  projects?: { name?: string | null } | null;
  title?: string | null;
};

type DirectoryInsight = {
  id: string;
  insight_title?: string | null;
  summary?: string | null;
  category?: string | null;
};

interface WorkspaceDirectoryProps {
  projects: DirectoryProject[];
  leads: DirectoryLead[];
  insights: DirectoryInsight[];
}

export function WorkspaceDirectory({ projects, leads, insights }: WorkspaceDirectoryProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    projects: DirectoryProject[];
    leads: DirectoryLead[];
    insights: DirectoryInsight[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!normalizedQuery) {
      setSearchResults(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const runSearch = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }
        const data = await response.json();
        setSearchResults({
          projects: data.projects ?? [],
          leads: data.leads ?? [],
          insights: data.insights ?? [],
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Search request failed", err);
        setError("Search failed. Please try again.");
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    };

    runSearch();

    return () => controller.abort();
  }, [normalizedQuery]);

  const filteredProjects = useMemo(() => {
    if (!normalizedQuery) return projects;
    return projects.filter((project) => {
      const haystack = `${project.name ?? ""} ${project.description ?? ""} ${project.target_market ?? ""}`;
      return haystack.toLowerCase().includes(normalizedQuery);
    });
  }, [projects, normalizedQuery]);

  const filteredLeads = useMemo(() => {
    if (!normalizedQuery) return leads.slice(0, 8);
    return leads.filter((lead) => {
      const haystack = `${lead.name ?? ""} ${lead.company ?? ""} ${lead.email ?? ""} ${lead.title ?? ""}`;
      return haystack.toLowerCase().includes(normalizedQuery);
    });
  }, [leads, normalizedQuery]);

  const filteredInsights = useMemo(() => {
    if (!normalizedQuery) return insights.slice(0, 6);
    return insights.filter((insight) => {
      const haystack = `${insight.insight_title ?? ""} ${insight.summary ?? ""} ${insight.category ?? ""}`;
      return haystack.toLowerCase().includes(normalizedQuery);
    });
  }, [insights, normalizedQuery]);

  const projectsToDisplay = searchResults?.projects ?? filteredProjects;
  const leadsToDisplay = (searchResults?.leads ?? filteredLeads).slice(0, 8);
  const insightsToDisplay = (searchResults?.insights ?? filteredInsights).slice(0, 6);

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-lg backdrop-blur">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Workspace navigator</p>
          <h2 className="text-2xl font-semibold text-white">Search projects, contacts, and insights</h2>
        </div>
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
          Beta
        </Badge>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people, companies, hypotheses..."
          className="h-12 border-white/20 bg-white/[0.06] pl-11 text-white placeholder:text-slate-400"
        />
      </div>
      {loading && (
        <p className="text-sm text-slate-400">Searching your workspace…</p>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-300" />
              Projects
            </CardTitle>
            <p className="text-sm text-slate-300">Active discovery tracks</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="max-h-64">
              <div className="space-y-3 pr-3">
                {projectsToDisplay.length === 0 && (
                  <p className="text-sm text-slate-400">No projects match this search.</p>
                )}
                {projectsToDisplay.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {project.name || (project as any).title || "Untitled project"}
                      </h3>
                      {project.status && (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-200">
                          {project.status}
                        </span>
                      )}
                    </div>
                    {project.target_market && (
                      <p className="mt-1 text-xs text-slate-300">Target: {project.target_market}</p>
                    )}
                    {(project.description || (project as any).overview) && (
                      <p className="mt-1 text-sm text-slate-200 line-clamp-2">
                        {project.description || (project as any).overview}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-emerald-300" />
              Contacts
            </CardTitle>
            <p className="text-sm text-slate-300">Recent leads & champions</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-3 pr-3">
                {leadsToDisplay.length === 0 && (
                  <p className="text-sm text-slate-400">No contacts match this search.</p>
                )}
                {leadsToDisplay.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-base font-medium">
                      {lead.name || (lead as any).title || "Unnamed contact"}
                    </p>
                    <p className="text-sm text-slate-300">
                      {lead.title || (lead as any).job || ""}{" "}
                      {lead.company || (lead as any).studio || "Unknown org"}
                    </p>
                    {lead.email && (
                      <p className="text-xs text-slate-400 mt-1">{lead.email}</p>
                    )}
                    {lead.projects?.name && (
                      <p className="text-xs text-blue-200 mt-1">
                        Project: {lead.projects.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-purple-300" />
              Insights
            </CardTitle>
            <p className="text-sm text-slate-300">Recent learnings & hypotheses</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-64">
              <div className="space-y-3 pr-3">
                {insightsToDisplay.length === 0 && (
                  <p className="text-sm text-slate-400">No insights for this query.</p>
                )}
                {insightsToDisplay.map((insight) => (
                  <div
                    key={insight.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-sm font-medium">
                      {insight.insight_title || (insight as any).title || (insight as any).name || "Untitled insight"}
                    </p>
                    {(insight.summary || (insight as any).overview || (insight as any).description) && (
                      <p className="mt-1 text-sm text-slate-200 line-clamp-2">
                        {insight.summary || (insight as any).overview || (insight as any).description}
                      </p>
                    )}
                    {insight.category && (
                      <span className="mt-2 inline-flex rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-200">
                        {insight.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
