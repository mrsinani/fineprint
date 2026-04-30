# FinePrint

FinePrint is an AI-assisted contract review app for small business owners. Users can upload legal documents or paste text, optionally review an anonymized version before analysis, and receive structured risk summaries, clause-level explanations, and action items.

The repository contains the Next.js web app, Supabase-backed persistence, and supporting browser-extension code.

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Next.js Route Handlers, Supabase Auth, Postgres, Storage
- AI: OpenAI API, optional Perplexity API for public reputation references
- Auth: Clerk
- Package manager: npm

## What It Does

- Upload `.pdf`, `.docx`, or `.txt` files for analysis
- Paste contract text directly into the app
- Exclude PDF pages before analysis
- Review anonymized text before it is sent to OpenAI
- Save document analyses to Supabase
- Reopen prior analyses from the dashboard
- Surface optional public counterparty reputation signals from social/public sources
- Follow up with questions through a chatbot

## Project Structure

```text
src/
  app/                  Next.js routes, pages, and API handlers
  components/           UI and analysis components
  lib/                  Shared clients, helpers, extractors, scoring, taxonomy
  app/utils/            Document anonymization and related utilities
supabase/
  migrations/           Database schema and migration files
extension/
  ...                   Browser extension code
```

## Prerequisites

- Node.js 20+
- npm
- A Supabase project
- A Clerk application
- An OpenAI API key
- Optional: a Perplexity API key for public counterparty reputation lookups

Optional for local Supabase development:

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)

## Environment Variables

There is currently no checked-in `.env.local.example` file, so create `.env.local` manually in the project root.

Required for the web app:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
PERPLEXITY_API_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_EXTENSION_ID=
```

You may also need the standard Clerk public variables depending on your local auth setup:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are required by the app server and Supabase helpers.
- `OPENAI_API_KEY` is required for document analysis and chat.
- `PERPLEXITY_API_KEY` is optional. When present, the app uses Perplexity server-side to find public counterparty references from sources such as Reddit, ToS;DR, BBB, FTC, CFPB, and housing/public-record sources depending on document type.
- `CLERK_SECRET_KEY` is required for authenticated server routes.
- `CLERK_WEBHOOK_SECRET` is required if you are testing Clerk webhooks locally.
- `NEXT_PUBLIC_EXTENSION_ID` is only needed for extension auth flows.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Create a `.env.local` file in the repo root and fill in the environment variables listed above.

### 3. Run the app

```bash
npm run dev
```

The app runs on [http://localhost:3001](http://localhost:3001).

## Running With Hosted Supabase

If you are using a hosted Supabase project instead of local containers:

1. Create a Supabase project.
2. Add the project URL, anon key, and service role key to `.env.local`.
3. Apply the SQL in `supabase/migrations/` to your project.
4. Start the Next.js app with `npm run dev`.

## Running With Local Supabase

If you want the full local stack:

### 1. Start Supabase

```bash
npx supabase start
```

### 2. Copy local credentials

Use the `API URL`, `anon key`, and service role key from the CLI output and place them in `.env.local`.

### 3. Apply migrations when needed

```bash
npx supabase db reset
```

### 4. Start the app

```bash
npm run dev
```

## Useful Commands

Run lint:

```bash
npm run lint
```

Create a new Supabase migration:

```bash
npx supabase migration new <name>
```

Push migrations to a remote Supabase project:

```bash
npx supabase db push
```

Serve Supabase Edge Functions locally:

```bash
npx supabase functions serve
```

## Known Setup Notes

- The README previously referenced `.env.local.example`, but that file is not in the repository.
- The Next.js dev server is configured for port `3001`.
- Running the app usually requires configuring Supabase, Clerk, and OpenAI before the UI is fully functional. Public reputation cards require `PERPLEXITY_API_KEY` or the legacy Google Custom Search variables.
- Browser-extension flows may require additional extension-specific setup beyond the web app.

## Deployment

- Frontend: Vercel
- Database and storage: Supabase
- Auth: Clerk
- AI: OpenAI API, optional Perplexity API

Before deploying, make sure the same environment variables from local development are configured in your hosting provider.
