"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  description?: string | null;
};

type Lead = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  notes?: string | null;
  project_id?: string | null;
  projects?: { name?: string | null };
};

type Interview = {
  id: string;
  title?: string | null;
  summary?: string | null;
  scheduled_at?: string | null;
  leads?: { name?: string | null; company?: string | null };
  projects?: { name?: string | null };
};

type Insight = {
  id: string;
  insight_title?: string | null;
  summary?: string | null;
  category?: string | null;
  project_id?: string | null;
};

type WorkspaceSearchProps = {
  projects: Project[];
  leads: Lead[];
  interviews: Interview[];
  insights: Insight[];
};

type SearchItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
  meta?: string;
};

const suggestionPresets = [
  "Find upcoming interviews",
  "Show top leads for battery tech",
  "Summaries about enterprise AI pain points",
  "Notes from last customer meeting",
];

export function WorkspaceSearch({
  projects,
  leads,
  interviews,
  insights,
}: WorkspaceSearchProps) {
  const [query, setQuery] = useState("");

  const allItems = useMemo<SearchItem[]>(() => {
    const projectItems =
      projects?.map((project) => ({
        id: `project-${project.id}`,
        type: "Project",
        title: project.name,
        description: project.description || "Discovery project",
        href: `/dashboard/projects/${project.id}`,
      })) ?? [];

    const leadItems =
      leads?.map((lead) => ({
        id: `lead-${lead.id}`,
        type: "Lead",
        title: lead.name || "Unknown contact",
        description:
          lead.company || lead.email || lead.notes || "Lead captured in pipeline",
        href: `/dashboard/leads?focus=${lead.id}`,
        meta: lead.projects?.name ?? undefined,
      })) ?? [];

    const interviewItems =
      interviews?.map((interview) => ({
        id: `interview-${interview.id}`,
        type: "Interview",
        title:
          interview.title ||
          interview.leads?.name ||
          "Customer discovery interview",
        description:
          interview.summary ||
          interview.leads?.company ||
          interview.projects?.name ||
          "Recorded interview",
        href: `/dashboard/interviews/${interview.id}`,
      })) ?? [];

    const insightItems =
      insights?.map((insight) => ({
        id: `insight-${insight.id}`,
        type: "Insight",
        title: insight.insight_title || "Insight",
        description:
          insight.summary ||
          insight.category ||
          "Auto-generated insight from interviews",
        href: `/dashboard/reports`,
      })) ?? [];

    return [...projectItems, ...leadItems, ...interviewItems, ...insightItems];
  }, [projects, leads, interviews, insights]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return allItems.slice(0, 6);
    }

    const q = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.meta?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [allItems, query]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-600/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-purple-600/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            Four Loop Intelligence Layer
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Ask anything about your discovery work
          </h1>
          <p className="text-base text-slate-300">
            Search across projects, leads, interviews, and insights with a single
            prompt. Think of it as your team&apos;s internal search engine.
          </p>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask a question like “Who should we interview next about EV batteries?”"
                className="h-12 border-white/30 bg-white/10 pl-10 text-base text-white placeholder:text-slate-400"
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
            >
              Search workspace
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {suggestionPresets.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-white/30 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3 rounded-2xl border border-white/15 bg-slate-900/50 p-4 backdrop-blur">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Live results
          </p>
          <div className="space-y-2">
            {filteredItems.length === 0 && (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-300">
                No matches yet. Try searching for a project name, a lead, or an
                interview topic.
              </div>
            )}
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "group flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-blue-400/60 hover:bg-slate-900/80",
                )}
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {item.type}
                  </p>
                  <p className="mt-1 font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                  {item.meta && (
                    <p className="mt-0.5 text-xs text-slate-400">{item.meta}</p>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-500 transition group-hover:text-blue-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
