# FinePrint

Next.js frontend with Supabase backend (auth, database, edge functions).

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **Package Manager:** npm

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages & layouts
│   ├── lib/supabase/     # Supabase client helpers
│   │   ├── client.ts     # Browser client (Client Components)
│   │   ├── server.ts     # Server client (Server Components / Route Handlers)
│   │   └── middleware.ts  # Session refresh middleware
│   └── middleware.ts      # Next.js middleware (auth session)
├── supabase/
│   ├── config.toml       # Supabase local dev config
│   ├── functions/        # Supabase Edge Functions (Deno)
│   │   └── hello/        # Example function
│   └── migrations/       # SQL migrations
│       └── *_init.sql    # Profiles table + RLS + trigger
```

## Getting Started

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- Docker (for local Supabase)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key (from the [Supabase dashboard](https://supabase.com/dashboard)), or use the local dev values below.

### 3. Start local Supabase

```bash
npx supabase start
```

This starts a local Supabase stack (Postgres, Auth, Storage, etc.) via Docker. Copy the `API URL` and `anon key` from the output into `.env.local`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Edge Functions

Serve locally:

```bash
npx supabase functions serve
```

Invoke the example function:

```bash
curl -i --request POST http://127.0.0.1:54321/functions/v1/hello \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"name":"World"}'
```

### Database Migrations

Create a new migration:

```bash
npx supabase migration new <name>
```

Apply migrations locally:

```bash
npx supabase db reset
```

Push migrations to a remote project:

```bash
npx supabase db push
```

## Deployment

- **Frontend:** Deploy to [Vercel](https://vercel.com) — connect the repo and set the Supabase env vars.
- **Edge Functions:** `npx supabase functions deploy`
- **Database:** `npx supabase db push` to apply migrations to your hosted Supabase project.
