import { MeiliSearch } from "meilisearch";

// Server-side Meilisearch client; keep the master key on the server only.
const host = process.env.MEILI_HOST;
const defaultApiKey = process.env.MEILI_MASTER_KEY ?? process.env.MEILI_SEARCH_KEY;

if (!host) {
  throw new Error("MEILI_HOST env var is not set.");
}

if (!defaultApiKey) {
  throw new Error("Set MEILI_MASTER_KEY (preferred) or MEILI_SEARCH_KEY for Meilisearch access.");
}

export const meiliClient = new MeiliSearch({
  host,
  apiKey: defaultApiKey,
});

export function getMeiliClient(apiKey?: string) {
  return new MeiliSearch({
    host,
    apiKey: apiKey ?? defaultApiKey,
  });
}

export const MEILI_INDEXES = {
  projects: "projects",
  leads: "leads",
  insights: "insights",
} as const;
