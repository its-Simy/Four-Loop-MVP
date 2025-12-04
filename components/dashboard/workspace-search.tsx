"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Project = {
  id: string;
  name: string;
  description?: string | null;
  target_market?: string | null;
};

type Lead = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  title?: string | null;
};

type Insight = {
  id: string;
  insight_title?: string | null;
  summary?: string | null;
  category?: string | null;
};

type WorkspaceSearchProps = {
  projects: Project[];
  leads: Lead[];
  insights: Insight[];
};

type SearchResults = {
  projects: Project[];
  leads: Lead[];
  insights: Insight[];
  counts?: {
    projects?: number;
    leads?: number;
    insights?: number;
  };
};

type PanelKey = "current-trends" | "current-inventors" | "current-products";

const suggestionPresets = [
  "Head of Operations in utilities",
  "Ops leaders evaluating AI",
  "Who struggles with onboarding?",
  "Follow-up targets from Dublin",
];

export function WorkspaceSearch({
  projects,
  leads,
  insights,
}: WorkspaceSearchProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedPanel, setSelectedPanel] = useState<PanelKey | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leadCount = leads?.length ?? 0;
  const projectCount = projects?.length ?? 0;

  useEffect(() => {
    if (!submittedQuery) {
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
          `/api/search?q=${encodeURIComponent(submittedQuery)}`,
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
          counts: data.counts ?? {},
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Workspace search fetch failed", err);
        setError("Search failed. Please try again.");
        setSearchResults(null);
      } finally {
        setLoading(false);
      }
    };

    runSearch();

    return () => controller.abort();
  }, [submittedQuery]);

  const panelData = useMemo(
    () => [
      {
        key: "current-trends" as PanelKey,
        title: "Current Trends",
        highlight: "Insights surfaced from your workspace",
      },
      {
        key: "current-inventors" as PanelKey,
        title: "Current Inventors",
        highlight: "People to contact next",
      },
      {
        key: "current-products" as PanelKey,
        title: "Current Products",
        highlight: "Projects and tracks in motion",
      },
    ],
    [],
  );

  const itemsForSelectedPanel = useMemo(() => {
    if (!searchResults || !submittedQuery || !selectedPanel) return [];
    if (selectedPanel === "current-trends") return searchResults.insights ?? [];
    if (selectedPanel === "current-inventors") return searchResults.leads ?? [];
    if (selectedPanel === "current-products") return searchResults.projects ?? [];
    return [];
  }, [searchResults, submittedQuery, selectedPanel]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
    setSelectedPanel(null);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 shadow-2xl">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-600/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-purple-600/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            Four Loop Intelligence Layer
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Find operators to interview next
          </h1>
          <p className="text-base text-slate-300">
            Ask conversationally and Four Loop surfaces the people most likely to move your discovery forward.
            Filter by role, geography, buying stage, or pain point.
          </p>
          <p className="text-sm text-slate-400">
            Indexing {leadCount}+ contacts across {projectCount}+ active projects.
          </p>

          <form className="flex w-full flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
            <div className="relative flex-1 w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask a question like “Who should we interview next about EV batteries?”"
                className="h-12 w-full border-white/30 bg-white/10 pl-10 text-base text-white placeholder:text-slate-400"
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

          {submittedQuery && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span>Results for “{submittedQuery}”</span>
              {loading && <span className="text-blue-200">Searching…</span>}
              {error && <span className="text-red-300">{error}</span>}
              {!loading && !error && searchResults?.counts && (
                <span className="text-slate-400">
                  {searchResults.counts.leads ?? 0} people · {searchResults.counts.projects ?? 0} projects · {searchResults.counts.insights ?? 0} insights
                </span>
              )}
            </div>
          )}
        </div>

        {submittedQuery && (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Pick what you want to see first. Results load after you choose a panel.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {panelData.map((panel) => {
                const isSelected = panel.key === selectedPanel;
                return (
                  <button
                    type="button"
                    key={panel.key}
                    onClick={() => setSelectedPanel(panel.key)}
                    className={`flex h-full flex-col gap-3 rounded-2xl border p-4 text-left text-white shadow-lg transition ${
                      isSelected
                        ? "border-blue-400 bg-blue-500/10"
                        : "border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-300">{panel.title}</p>
                      <h3 className="text-lg font-semibold">{panel.highlight}</h3>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>
                        {panel.key === "current-trends" && `${searchResults?.counts?.insights ?? 0} insights`}
                        {panel.key === "current-inventors" && `${searchResults?.counts?.leads ?? 0} people`}
                        {panel.key === "current-products" && `${searchResults?.counts?.projects ?? 0} projects`}
                      </span>
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isSelected ? "bg-blue-400" : "border border-white/40"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedPanel && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-blue-300">
                  Selected focus: {panelData.find((panel) => panel.key === selectedPanel)?.title}
                </p>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white shadow-lg space-y-3">
                  {itemsForSelectedPanel.length === 0 && (
                    <p className="text-sm text-slate-400">No results yet for this panel.</p>
                  )}
                  {itemsForSelectedPanel.length > 0 && selectedPanel === "current-inventors" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {itemsForSelectedPanel.map((lead) => (
                        <div
                          key={(lead as Lead).id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                        >
                          <p className="text-base font-semibold text-white">
                            {(lead as Lead).name || "Unknown contact"}
                          </p>
                          <p className="text-slate-300">
                            {(lead as Lead).title || ""} {(lead as Lead).company || ""}
                          </p>
                          {(lead as Lead).email && (
                            <p className="text-xs text-slate-400 mt-1">{(lead as Lead).email}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {itemsForSelectedPanel.length > 0 && selectedPanel === "current-products" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {itemsForSelectedPanel.map((project) => (
                        <div
                          key={(project as Project).id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                        >
                          <p className="text-base font-semibold text-white">
                            {(project as Project).name || (project as any).title || "Untitled"}
                          </p>
                          {((project as Project).description || (project as any).overview) && (
                            <p className="mt-1 text-slate-300 line-clamp-2">
                              {(project as Project).description || (project as any).overview}
                            </p>
                          )}
                          {(project as Project).target_market && (
                            <p className="mt-1 text-xs text-blue-200">
                              Target: {(project as Project).target_market}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {itemsForSelectedPanel.length > 0 && selectedPanel === "current-trends" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      {itemsForSelectedPanel.map((insight) => (
                        <div
                          key={(insight as Insight).id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                        >
                          <p className="text-base font-semibold text-white">
                            {(insight as Insight).insight_title || (insight as any).title || "Untitled insight"}
                          </p>
                          {(insight as Insight).summary && (
                            <p className="mt-1 text-slate-300 line-clamp-2">{(insight as Insight).summary}</p>
                          )}
                          {(insight as Insight).category && (
                            <p className="mt-1 text-xs text-blue-200">
                              Category: {(insight as Insight).category}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
