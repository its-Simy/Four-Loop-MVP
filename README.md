# Four Loop website navigation

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/simons-projects-bca8013f/v0-four-loop-website-navigation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/Mh64O9dPtB8)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/simons-projects-bca8013f/v0-four-loop-website-navigation](https://vercel.com/simons-projects-bca8013f/v0-four-loop-website-navigation)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/Mh64O9dPtB8](https://v0.app/chat/Mh64O9dPtB8)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Meilisearch setup (search integration)

1. Provision Meilisearch (self-host or managed) and note the host URL.
2. Create keys: keep the master key server-side; create a search-only key for client or API queries.
3. Add env vars (`MEILI_HOST`, `MEILI_MASTER_KEY`, `MEILI_SEARCH_KEY`) to `.env.local` and your hosting provider.
4. Use `lib/search/meilisearch-client.ts` from server routes/actions to query or index `projects`, `leads`, and `insights`.
5. If you’re self-hosting and want a quick local UI to inspect data, open `http://localhost:7700` in your browser. The built-in preview supports plain searches only and no customization.
