"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type PanelKey = "current-trends" | "current-inventors" | "current-products";

type PersonaRecord = {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  note: string;
  score: number;
};

type PersonaRecordInput = Omit<PersonaRecord, "score">;

const withScores = (records: PersonaRecordInput[]): PersonaRecord[] =>
  records.map((record, index) => ({
    ...record,
    score: Math.max(70, 95 - index * 2),
  }));

const suggestionPresets = [
  "Head of Operations in utilities",
  "Ops leaders evaluating AI",
  "Who struggles with onboarding?",
  "Follow-up targets from Dublin",
];

export function WorkspaceSearch({
  projects,
  leads,
  interviews,
  insights,
}: WorkspaceSearchProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedPanel, setSelectedPanel] = useState<PanelKey | null>(null);
  const [activePerson, setActivePerson] = useState<PersonaRecord | null>(null);
  const leadCount = leads?.length ?? 0;
  const projectCount = projects?.length ?? 0;
  const personaLabel = submittedQuery || "operations leaders";

  const curatedPeopleByPanel = useMemo<
    Record<PanelKey, Array<PersonaRecord>>
  >(
    () => ({
      "current-trends": withScores([
        {
          id: "trend-aoife",
          name: "Aoife Kelleher",
          role: "Director of Ops Transformation",
          company: "VoltGrid Energy",
          location: "Limerick",
          note: "Launched AI-driven forecasting squad; measuring cycle time per install.",
        },
      {
        id: "trend-brandon",
        name: "Brandon Hughes",
        role: "Head of Ops Analytics",
        company: "Northbound Mobility",
        location: "Galway",
        note: "Prioritized downtime telemetry; evaluating dispatch copilots.",
      },
      {
        id: "trend-maeve",
        name: "Maeve Ryan",
        role: "VP Field Operations",
        company: "Harbor Labs",
        location: "Cork",
        note: "Piloting AI agents to summarize plant safety across 12 sites.",
      },
      {
        id: "trend-ronan",
        name: "Ronan Blake",
        role: "Head of Service Ops",
        company: "MetroLabs",
        location: "Dublin",
        note: "Tracking first-response time reductions after automating triage.",
      },
      {
        id: "trend-ciara",
        name: "Ciara Dempsey",
        role: "Ops Strategy Lead",
        company: "BlueMarble Freight",
        location: "Belfast",
        note: "Rolling out AI copilots for port logistics visibility.",
      },
      {
        id: "trend-padma",
        name: "Padma Verma",
        role: "Director of Central Ops",
        company: "ArcPalm Renewables",
        location: "Galway",
        note: "Measuring predictive maintenance wins across turbine clusters.",
      },
      {
        id: "trend-lorcan",
        name: "Lorcan Byrne",
        role: "Ops Enablement Manager",
        company: "Harbor Labs",
        location: "Cork",
        note: "Codifying best practices for human-in-the-loop dispatch.",
      },
      {
        id: "trend-nadia",
        name: "Nadia Khan",
        role: "Process Excellence Lead",
        company: "VoltGrid Energy",
        location: "Limerick",
        note: "Scaling digital twins for energy storage deployments.",
      },
      {
        id: "trend-ethan",
        name: "Ethan Downey",
        role: "Analytics Ops Partner",
        company: "PilotWorks",
        location: "Remote",
        note: "Standardizing KPI dashboards for global franchisees.",
      },
      {
        id: "trend-leah",
        name: "Leah O'Leary",
        role: "Field Ops Director",
        company: "Northbound Mobility",
        location: "Galway",
        note: "Instrumenting real-time handoffs between sales and install crews.",
      },
      {
        id: "trend-yasmin",
        name: "Yasmin Duarte",
        role: "Customer Ops Lead",
        company: "VectorRail",
        location: "Dublin",
        note: "Automating ticket intelligence to inform capital planning.",
      },
      {
        id: "trend-rhea",
        name: "Rhea Collins",
        role: "Ops Modernization PM",
        company: "VoltGrid Energy",
        location: "Limerick",
        note: "Rolling out new onboarding playbooks for site technicians.",
      },
      {
        id: "trend-kieran",
        name: "Kieran Talbot",
        role: "Continuous Improvement Lead",
        company: "MetroLabs",
        location: "Dublin",
        note: "Benchmarking AI copilots versus traditional SOP updates.",
      },
      {
        id: "trend-sloane",
        name: "Sloane Merritt",
        role: "Regional Ops Head",
        company: "BlueMarble Freight",
        location: "Belfast",
        note: "Using AI summaries to synchronize maritime and road ops.",
      },
        {
          id: "trend-devin",
          name: "Devin Walsh",
          role: "Director of Ops Research",
          company: "Arran Diagnostics",
          location: "Waterford",
          note: "Mapping lab throughput improvements after workflow automation.",
        },
      ]),
      "current-inventors": withScores([
        {
          id: "invent-jude",
          name: "Jude Bishop",
        role: "Ops Systems Architect",
        company: "VectorRail",
        location: "Dublin",
        note: "Building open-source orchestration pods for transit operators.",
      },
      {
        id: "invent-lina",
        name: "Lina Chen",
        role: "Automation Program Lead",
        company: "Arran Diagnostics",
        location: "Waterford",
        note: "Experimenting with workflow agents for sample logistics.",
      },
      {
        id: "invent-cillian",
        name: "Cillian Monroe",
        role: "Product Ops Fellow",
        company: "PilotWorks",
        location: "Remote",
        note: "Publishing playbooks on human-in-the-loop audit bots.",
      },
      {
        id: "invent-roisin",
        name: "Roisín Frazier",
        role: "Ops Systems Engineer",
        company: "MetroLabs",
        location: "Dublin",
        note: "Designed self-healing workflows for cold-chain monitoring.",
      },
      {
        id: "invent-leo",
        name: "Leo Fitzgerald",
        role: "Automation Architect",
        company: "VoltGrid Energy",
        location: "Limerick",
        note: "Built modular AI agents for compliance reporting.",
      },
      {
        id: "invent-gemma",
        name: "Gemma Nolan",
        role: "Ops Platform Lead",
        company: "Harbor Labs",
        location: "Cork",
        note: "Open-sourced pipeline for multi-site sensor analytics.",
      },
      {
        id: "invent-tariq",
        name: "Tariq Malik",
        role: "Innovation Principal",
        company: "ArcPalm Renewables",
        location: "Galway",
        note: "Prototyping AR-assisted procedures for field crews.",
      },
      {
        id: "invent-ines",
        name: "Ines Barros",
        role: "Senior Ops Developer",
        company: "VectorRail",
        location: "Dublin",
        note: "Leading experimentation with LLM copilots for network control.",
      },
      {
        id: "invent-owen",
        name: "Owen Rees",
        role: "Ops ML Engineer",
        company: "Northbound Mobility",
        location: "Galway",
        note: "Created demand forecasting kernels for shared fleets.",
      },
      {
        id: "invent-dara",
        name: "Dara McNeil",
        role: "Ops Intelligence Lead",
        company: "BlueMarble Freight",
        location: "Belfast",
        note: "Deploying digital workers for customs paperwork.",
      },
      {
        id: "invent-vivian",
        name: "Vivian Stone",
        role: "Ops AI R&D",
        company: "PilotWorks",
        location: "Remote",
        note: "Building persona-specific copilots for franchise owners.",
      },
      {
        id: "invent-soren",
        name: "Soren Becker",
        role: "Lead Automation Designer",
        company: "Arran Diagnostics",
        location: "Waterford",
        note: "Architected no-code tooling for lab operators.",
      },
      {
        id: "invent-alana",
        name: "Alana Kirby",
        role: "Ops Prototype Lead",
        company: "MetroLabs",
        location: "Dublin",
        note: "Testing multi-agent workflows for maintenance scheduling.",
      },
        {
          id: "invent-ty",
          name: "Ty Brennan",
          role: "Staff Systems Engineer",
          company: "VoltGrid Energy",
          location: "Limerick",
          note: "Driving standard for sensor-to-copilot messaging.",
        },
      ]),
      "current-products": withScores([
        {
          id: "product-ella",
          name: "Ella Donnelly",
        role: "Ops Innovation Manager",
        company: "MetroLabs",
        location: "Dublin",
        note: "Deploying onboarding copilots for new lab openings.",
      },
      {
        id: "product-rio",
        name: "Rio Karlsen",
        role: "Senior Ops Strategist",
        company: "BlueMarble Freight",
        location: "Belfast",
        note: "Leads pilot user group for predictive network control rooms.",
      },
      {
        id: "product-sahana",
        name: "Sahana Patel",
        role: "Director of Business Ops",
        company: "ArcPalm Renewables",
        location: "Galway",
        note: "Testing Four Loop's workflow agents inside CRM.",
      },
      {
        id: "product-ena",
        name: "Ena O'Grady",
        role: "Ops Excellence Manager",
        company: "Harbor Labs",
        location: "Cork",
        note: "Evaluating onboarding copilots for supplier enablement.",
      },
      {
        id: "product-malik",
        name: "Malik Cannon",
        role: "Operations Program Lead",
        company: "MetroLabs",
        location: "Dublin",
        note: "Trialing predictive scheduling inside ERP to cut idle capacity.",
      },
      {
        id: "product-noelle",
        name: "Noelle Fraser",
        role: "Customer Ops Director",
        company: "Northbound Mobility",
        location: "Galway",
        note: "Benchmarking AI helpdesk copilots against BPO teams.",
      },
      {
        id: "product-joel",
        name: "Joel Murphy",
        role: "VP Global Operations",
        company: "PilotWorks",
        location: "Remote",
        note: "Rolling out Four Loop event streams for franchise managers.",
      },
      {
        id: "product-lisa",
        name: "Lisa Farrell",
        role: "Solutions Ops Lead",
        company: "VoltGrid Energy",
        location: "Limerick",
        note: "Integrating knowledge copilots into asset dashboard.",
      },
      {
        id: "product-harvey",
        name: "Harvey Quinn",
        role: "Strategic Ops Manager",
        company: "BlueMarble Freight",
        location: "Belfast",
        note: "Running pilot for multi-modal ETA prediction.",
      },
      {
        id: "product-tessa",
        name: "Tessa Ng",
        role: "Head of Implementation",
        company: "Arran Diagnostics",
        location: "Waterford",
        note: "Using AI QA bots to monitor sample processing SLAs.",
      },
      {
        id: "product-padraig",
        name: "Padraig Wynne",
        role: "Operations Launch Lead",
        company: "Harbor Labs",
        location: "Cork",
        note: "Deploying agentic workflows for new site openings.",
      },
      {
        id: "product-serena",
        name: "Serena Walsh",
        role: "Ops Value Manager",
        company: "ArcPalm Renewables",
        location: "Galway",
        note: "Comparing Four Loop copilots against internal automation stack.",
      },
        {
          id: "product-eli",
          name: "Eli Carson",
          role: "Senior Ops Advisor",
          company: "VectorRail",
          location: "Dublin",
          note: "Bundling AI-generated reports into investor updates.",
        },
      ]),
    }),
    [],
  );

  const panelData = useMemo(() => {
    if (!submittedQuery) {
      return [];
    }

    return [
      {
        key: "current-trends",
        title: "Current Trends",
        highlight: `Signals among ${personaLabel}`,
        points: [
          `${personaLabel} report automation budgets increasing 28% to reduce manual approvals.`,
          `Customer onboarding throughput is still the primary KPI for ${personaLabel}.`,
          `AI copilots that summarize plant health in under 60 seconds now appear on quarterly OKRs.`,
        ],
        cta: "Explore trends",
      },
      {
        key: "current-inventors",
        title: "Current Inventors",
        highlight: `Builders ${personaLabel} follow`,
        points: [
          "Niamh Porter · VectorRail Ops — deploying autonomous audit bots for compliance-heavy orgs.",
          "Jamal Idris · Northwind Mobility — scaling AI dispatch for regional fleets.",
          "Elena Walsh · Harbor Labs — pioneering workflow agents for shared manufacturing lines.",
        ],
        cta: "Meet the inventors",
      },
      {
        key: "current-products",
        title: "Current Products",
        highlight: `Pilots ${personaLabel} are buying`,
        points: [
          "Orchestration pods that co-pilot onboarding and field operations from a single console.",
          "Knowledge copilots tuned to shift notes, safety logs, and compliance evidence.",
          "Hands-free reporting tools that auto-generate investor or board-ready updates.",
        ],
        cta: "Review products",
      },
    ];
  }, [personaLabel, submittedQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  };

  return (
    <>
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
        </div>

        {submittedQuery && panelData.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Pick the slice of the market you care about right now. We&apos;ll tune results for{" "}
              <span className="font-semibold text-white">{personaLabel}</span> based on the subset you choose.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {panelData.map((panel) => {
                const isSelected = panel.key === selectedPanel;
                return (
                  <button
                    type="button"
                    key={panel.key}
                    onClick={() => setSelectedPanel(panel.key as PanelKey)}
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
                    <ul className="flex-1 space-y-2 text-sm text-slate-200">
                      {panel.points.map((point, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-blue-300">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>{panel.cta}</span>
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
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white shadow-lg">
                  <p className="text-sm text-slate-300 mb-3">
                    {curatedPeopleByPanel[selectedPanel]?.length ?? 0} operators surfaced for this slice:
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {(curatedPeopleByPanel[selectedPanel] ?? []).map((person) => (
                      <div
                        key={person.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200"
                      >
                        <p className="text-base font-semibold text-white">{person.name}</p>
                        <p>{person.role}</p>
                        <p className="text-slate-300">{person.company}</p>
                        <p className="text-xs text-slate-400">{person.location}</p>
                        <p className="mt-2 text-xs text-slate-200">{person.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>

    <Dialog open={!!activePerson} onOpenChange={(open) => !open && setActivePerson(null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{activePerson?.name}</DialogTitle>
          <DialogDescription>
            {activePerson?.role} · {activePerson?.company}
          </DialogDescription>
        </DialogHeader>
        {activePerson && (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex justify-between text-slate-900">
              <span className="font-semibold">{activePerson.location}</span>
              <div className="flex items-center gap-1 text-blue-500">
                <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
                <span className="text-xs font-semibold">{activePerson.score} match score</span>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Recent note</p>
              <p className="mt-1 text-slate-900">{activePerson.note}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Recommended outreach</p>
              <p className="mt-1 text-slate-900">
                Reference the query “{submittedQuery || "operations automation"}” and ask how{" "}
                {activePerson.name.split(" ")[0]}'s team measures efficiency today. Offer to share the Four Loop playbook
                for {personaLabel}.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">Save to Leads</Button>
              <Button variant="outline" className="flex-1" onClick={() => setActivePerson(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
