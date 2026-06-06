# AGENTS.md — Little Lovely Pets

> Guide for AI coding agents (and humans) working in this repo. It maps the codebase module-by-module: what each part does, how data flows, the conventions to follow, and the sharp edges to avoid. Read the **Quick start** and **Architecture at a glance** first, then jump to the module(s) you're touching.

**What this is:** a Singapore-focused pet-care web app ("Little Lovely Pets"; internal package name `dwa-v3`). Owners track pet care, discover local services (groomers/vets), and chat with an AI assistant that gives profile-aware advice and generates pet memes. The assistant is grounded in real SG pet data via a RAG (retrieval) layer backed by Postgres + pgvector.

---

## Architecture at a glance

```
Browser ──▶ Next.js App Router (src/app)
              │  middleware.ts → Supabase session refresh + route gating
              ├─ (main) route group ── async layout: ensureAppAccess() + getPetCareContext() → <PetCareProvider>
              │     ├─ /            Dashboard (server)
              │     ├─ /assistant   AI chat + meme (client, useChat)
              │     ├─ /discovery   Local services (server, mostly mock UI today)
              │     └─ /profiles    Edit pet (server page + client form → server action)
              ├─ /login /signup /onboarding   Supabase email auth + first-pet creation
              └─ /api
                    ├─ /api/chat                 streamText via Vercel AI gateway (NOT auth-gated)
                    └─ /api/agents/[agentId]     meme agent (OpenAI Agents SDK, auth-gated)

Data:
  Prisma (Pet, CareLog) ──┐
                          ├─▶ same Postgres ◀── pgvector pipeline tables (products, service_places, knowledge_chunks)
  Supabase auth.users ────┘                       populated offline by scripts/data-pipeline
  RAG handoff: src/lib/pet-data/search.ts (searchFood / searchGroomers / searchVets)
```

**Stack:** Next.js 16 (App Router, React 19, React Compiler) · TypeScript (strict) · Prisma 7 + `@prisma/adapter-pg` · Supabase (`@supabase/ssr`) for auth + Postgres · Vercel AI SDK (`ai`, `@ai-sdk/react`) · OpenAI Agents SDK (`@openai/agents`) · Tailwind CSS v4 + shadcn/ui (Radix) · zod + react-hook-form · next-themes · Biome (lint/format) · pnpm.

**The one fact every agent must know:** Prisma manages **only** `Pet` and `CareLog`. The data-pipeline tables live in raw SQL outside `prisma/migrations/`. Running `prisma migrate dev` / `db push` / `reset` will **drop** the pipeline tables. Use `prisma migrate deploy` (additive) only. See the **Data pipeline** module.

---

## Quick start

Prereqs: Node ≥ 20, `pnpm`, and a Postgres database (local Docker `pgvector/pgvector:pg17` recommended for development) + a Supabase project for auth.

```bash
pnpm install                       # also runs `prisma generate` (postinstall)
cp .env.example .env               # fill in the values below
pnpm dev                           # = prisma generate && prisma migrate deploy && next dev  → http://localhost:3000
```

Required env (`.env` / `.env.local`):

| Var | Powers |
|---|---|
| `DATABASE_URL` | Prisma + the RAG search layer + the data pipeline (all share one Postgres) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client (browser + server) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is a fallback) |
| `OPENAI_API_KEY` | Meme agent + image generation + embeddings (`text-embedding-3-small`) used by RAG/pipeline |
| `AI_MODEL` *(optional)* | Overrides the chat model id; default `openai/gpt-4o-mini` (routed via the Vercel AI gateway) |
| `GOOGLE_PLACES_API_KEY` *(pipeline only)* | `scripts/data-pipeline/ingest-google-places.mjs` |

Also configure Supabase Auth → URL config: Site URL `http://localhost:3000`, Redirect URLs include `http://localhost:3000/auth/callback`.

Scripts: `pnpm lint` (Biome check) · `pnpm format` (Biome write) · `pnpm build` (prisma generate + migrate deploy + next build) · `pnpm db:apply:pipeline` · `pnpm db:check` · `pnpm probe:products`.

---

## Repository map

| Path | What it is |
|---|---|
| `src/app/` | Next.js App Router — pages, layouts, route groups, API routes, server actions |
| `src/components/` | React components: `assistant/` (chat), `pet-care/` (app shell), `auth/`, `ui/` (shadcn), `react-bits/` |
| `src/lib/` | Non-UI logic: `ai/`, `agents/`, `auth/`, `supabase/`, `pet-data/` (RAG), `db.ts`, `pet-queries.ts` |
| `src/hooks/`, `src/schemas/`, `src/types/` | Reusable hooks, zod schemas, shared types |
| `prisma/` | Prisma schema (`Pet`, `CareLog`) + migrations |
| `generated/prisma/` | Generated Prisma client (imported as `@generated/prisma/client`) — build output, not hand-edited |
| `scripts/data-pipeline/` | Offline Node ESM scripts: ingest SG pet data → Postgres/pgvector, embeddings, RAG schema |
| `fourcats/`, `stitch_sg_personalized_pet_ai/` | Design prototypes & references — **not** shipped app code |
| `public/` | Static assets served at the site root |
| `middleware.ts`, `next.config.ts`, `biome.json`, `components.json`, `prisma.config.ts` | Root config |

---

# Module guide

### Build, tooling & configuration

_pnpm + Next.js 16 + Biome toolchain where every build/dev run regenerates the Prisma client and applies migrations before serving._

**Paths:** `package.json`, `next.config.ts`, `tsconfig.json`, `biome.json`, `components.json`, `prisma.config.ts`, `postcss.config.mjs`, `.env.example`

How the project is wired and run. `pnpm dev`/`pnpm build` both run `prisma generate && prisma migrate deploy` *before* `next dev`/`next build`, so the generated client and DB schema are always in sync at startup (and migrations are only ever applied additively). Linting/formatting is Biome, not ESLint/Prettier. Styling is Tailwind CSS v4 wired through PostCSS (`@tailwindcss/postcss`) with no JS Tailwind config — theme tokens live in `src/app/globals.css`. The React Compiler is enabled.

**Key files**
- `package.json` — scripts (`dev`, `build`, `lint`, `format`, `db:apply:pipeline`, `db:check`, `probe:products`) and deps. `postinstall` runs `prisma generate`.
- `next.config.ts` — `reactCompiler: true`; `serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "sharp"]` so Next doesn't bundle native/Prisma packages (prevents `prisma.pet` becoming undefined).
- `tsconfig.json` — strict mode, `moduleResolution: "bundler"`, path aliases `@/* → src/*`, `@public/* → public/*`, `@generated/* → generated/*`.
- `prisma.config.ts` — points Prisma at `prisma/schema.prisma` + `prisma/migrations`, datasource url from `env("DATABASE_URL")`; loads `dotenv/config`.
- `components.json` — shadcn config: `new-york` style, RSC, base color `neutral`, CSS variables in `src/app/globals.css`, `lucide` icons, aliases (`@/components`, `@/lib/utils`, …), plus a `@react-bits` registry.
- `biome.json` — formatter (2-space) + linter with `next`/`react` domains, git-ignore aware, `noUnknownAtRules` off (for Tailwind v4 at-rules).
- `.env.example` — the canonical list of env vars (see Quick start).

**How it connects:** This module underpins everything. The `@/*`, `@public/*`, `@generated/*` aliases are used throughout `src/`. The Prisma generate/migrate prelude feeds the **Data layer**; `serverExternalPackages` keeps `@prisma/client`/`pg`/`sharp` working in the **AI backend** and **Data layer** at runtime.

**Conventions**
- Use `pnpm` (there's a `pnpm-lock.yaml` and `pnpm-workspace.yaml`); don't introduce npm/yarn lockfiles.
- Run `pnpm lint` / `pnpm format` before committing — Biome is the source of truth for style (2-space indent, organized imports).
- Reach files via the path aliases, not long relative paths.
- Tailwind is CSS-first (v4): add design tokens in `globals.css`, not a `tailwind.config.js`.

**Gotchas**
- `prisma migrate deploy` (additive) runs on every dev/build — never wire `migrate dev`/`db push` into scripts; they'd drop the pipeline tables (see **Data pipeline**).
- If `prisma.pet` is ever `undefined` at runtime, check `serverExternalPackages` in `next.config.ts` first.

**When editing:** Add new env vars to `.env.example` with a comment when you introduce them. Keep build-time DB steps additive. New path aliases go in both `tsconfig.json` and (if shadcn-related) `components.json`.

---

### Data layer (Prisma, pet queries & RAG search)

_Two cooperating data stores in one Postgres: Prisma-owned `Pet`/`CareLog` (app data) and the pgvector-backed pipeline store (read via a self-contained RAG search module)._

**Paths:** `prisma/schema.prisma`, `src/lib/db.ts`, `src/lib/pet-queries.ts`, `src/lib/pet-data.ts`, `src/lib/pet-data/search.ts`, `src/app/(main)/profiles/actions.ts`

App-level reads/writes go through Prisma; AI grounding goes through a separate raw-SQL RAG module. Prisma models only `Pet` (with `medicalConditions`/`dietaryRestrictions` string arrays, optional `Decimal` age/weight, postal-code location) and `CareLog`. `pet-queries.ts` is the canonical server-side read path; `search.ts` is the canonical retrieval path for the AI agent. Server actions (e.g. profile edits) are the write path, always scoped by the authenticated user's id.

**Key files**
- `prisma/schema.prisma` — `Pet` + `CareLog` (1-to-many, `onDelete: Cascade`). Client generated to `generated/prisma`, imported as `@generated/prisma/client`. Comment notes `Pet.userId` matches Supabase `auth.users.id`.
- `src/lib/db.ts` — `prisma` singleton built with `PrismaPg({ connectionString: DATABASE_URL })`; cached on `globalThis` in non-production to survive HMR. Loads `dotenv/config`; throws if `DATABASE_URL` is unset.
- `src/lib/pet-queries.ts` — `getPetCareContext()` wrapped in React `cache()` (one fetch per request): resolves the Supabase user, loads their first pet + last 20 care logs, and returns serializable DTOs (`PetCareContext`, `PetDTO`, `PetCareLogDTO`). **Prisma `Decimal` fields are stringified** (`ageYears`/`weightKg` are `string | null` in DTOs).
- `src/lib/pet-data/search.ts` — the RAG handoff surface. `searchFood({query, petType?, brand?, limit?})` embeds the query (`text-embedding-3-small`) and calls the `match_knowledge_chunks` RPC; `searchGroomers`/`searchVets({lat, lng, radiusKm?, limit?, withReviews?})` call `nearby_service_places` and attach top `place_reviews`; `postalToLatLng(postalCode)` maps SG postal districts → approx lat/lng (no Geocoding API). Keeps its **own** `pg` Pool + OpenAI client — no Prisma dependency.
- `src/lib/pet-data.ts` — static UI constants: `navItems`, `discoveryFilters`, and placeholder portrait image URLs (`petPlaceholderImage(species)`). Not a DB module despite the name.
- `src/app/(main)/profiles/actions.ts` — `updatePrimaryPet(prev, formData)` server action: auth-checks, finds the user's first pet, zod-validates/coerces the form (comma-split arrays, numeric coercion), `prisma.pet.update`, then `revalidatePath` for `/`, `/profiles`, `/assistant`, `/discovery`.

**How it connects:** `(main)/layout.tsx` and every `(main)` page call `getPetCareContext()`; the result is shared via `PetCareProvider` (**App shell**). The **AI assistant** grounds answers through `search.ts`, which reads the **Data pipeline**'s tables. Writes flow from forms (**Routing/pages**) → server actions here → Prisma → `revalidatePath`.

**Conventions**
- Read app data via `getPetCareContext()` (cached) rather than calling Prisma ad hoc in components.
- Always scope queries/mutations by `userId` from the Supabase server client; never trust a client-supplied id.
- Treat `Decimal` as string at the DTO boundary; `Number(...)` only at the render site.
- Keep `search.ts` self-contained (its own pool/client) — it's the agent's tool surface, intentionally decoupled from Prisma.

**Gotchas**
- **Split schema ownership:** Prisma owns only `Pet`/`CareLog`. Don't model pipeline tables in `schema.prisma`, and never run `prisma migrate dev`/`db push`/`reset` against a DB holding pipeline data — use `migrate deploy`. (Full detail in **Data pipeline**.)
- `Pet.userId` ↔ `auth.users.id` is a soft cross-DB join with **no FK**.
- The embedding model (`text-embedding-3-small`, 1536-dim) must match the `vector(1536)` column and the pipeline's embedder — change all three together.

**When editing:** Schema changes to `Pet`/`CareLog` → edit `schema.prisma`, add a migration, and update the DTO mappers in `pet-queries.ts`. New AI retrieval capabilities → extend `search.ts` (and the matching RPC in the pipeline schema). New write paths → server actions that auth-scope + `revalidatePath` like `updatePrimaryPet`.

---

### Auth & Supabase (session, login, signup, onboarding)

_Email/password auth via Supabase SSR with cookie-refreshed sessions, route gating in middleware, and a forced onboarding step that creates each user's first Pet._

**Paths:** `src/lib/supabase`, `src/lib/auth`, `src/app/login`, `src/app/signup`, `src/app/onboarding`, `src/app/auth/callback`

This module owns user identity end to end: three `@supabase/ssr` client variants (browser, server, middleware), edge-middleware session refresh and route protection, the OAuth/email-confirmation callback, the login/signup pages with zod-validated forms, and an onboarding gate that requires every authenticated user to create at least one `Pet` before reaching the app. Auth state lives entirely in Supabase cookies; the `Pet` table is the app-level signal of whether onboarding is complete.

**Key files**
- `src/lib/supabase/env.ts` — `getSupabaseUrl()` / `getSupabasePublishableKey()` resolve env vars (throw if missing); key prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, falls back to legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `src/lib/supabase/client.ts` — `createClient()` (sync) wraps `createBrowserClient`; used in Client Components (`login-form`, `signup-form`).
- `src/lib/supabase/server.ts` — `async createClient()` wraps `createServerClient` with Next `cookies()`; `setAll` is try/caught because Server Components can't write cookies.
- `src/lib/supabase/middleware.ts` — `updateSession(request)` builds a request-scoped server client, calls `auth.getUser()`, refreshes session cookies, and gates routes.
- `middleware.ts` — root middleware delegating to `updateSession`; `config.matcher` excludes static assets/images.
- `src/app/auth/callback/route.ts` — `GET` handler that calls `supabase.auth.exchangeCodeForSession(code)` for email-confirmation links, then redirects to a validated `next` (or `/login?error=session`).
- `src/lib/auth/server.ts` — `getUser()`, `getUserOrRedirect()`, `ensureAppAccess()` (signed in + ≥1 pet, else `/onboarding`), `ensureOnboardingAccess()` (signed in + 0 pets, else `/`). All `server-only`.
- `src/app/login/{page,login-form}.tsx`, `src/app/signup/{page,signup-form}.tsx` — pages redirect already-authed users; forms validate with `signInSchema`/`signUpSchema` then call Supabase (`signInWithPassword` / `signUp` with `emailRedirectTo` `/auth/callback` + `first_name`/`last_name` metadata).
- `src/app/onboarding/{page,onboarding-form,actions}.tsx/ts` — `page` calls `ensureOnboardingAccess`; form uses `useActionState(createFirstPet, null)`; `createFirstPet` validates a local zod `petSchema`, creates the Pet, redirects to `/`.
- `src/schemas/auth.schemas.ts` — `signInSchema`, `signUpSchema` (password-match + terms refinements), `forgotPasswordSchema`, inferred types.

**How it connects:** Every request hits root `middleware.ts` → `updateSession`, which refreshes Supabase cookies and redirects unauthenticated users to `/login?next=...` (public paths: `/login`, `/signup`, `/auth/*`, `/_next`, `/favicon.ico`); authed users on `/login`/`/signup` bounce to a validated `next` or `/`. Server Components/Actions read identity through `src/lib/auth/server.ts` combined with the **Data layer** (`prisma.pet.count` / `prisma.pet.create`). Auth pages render inside `src/components/auth/auth-screen.tsx` (aurora background + `ModeToggle`). Signup metadata is stored on the Supabase user, not Prisma.

**Conventions**
- Always pull Supabase config through `src/lib/supabase/env.ts`; never read `process.env` for URL/keys directly.
- Pick the client variant by context: browser `createClient` (sync) in Client Components, server `createClient` (await) in Server Components/Actions, the inline middleware client only inside `updateSession`.
- Trust `auth.getUser()` (verified) over session for gating; gate Server Components with `ensureAppAccess` / `ensureOnboardingAccess`.
- Validate every form payload with the shared zod schemas before calling Supabase.
- Sanitize redirect targets: `next` must `startsWith("/")` and not `startsWith("//")` (pattern repeated in middleware, callback, login).

**Gotchas**
- Onboarding completeness is derived from `prisma.pet.count` — deleting all of a user's pets re-triggers `/onboarding`.
- Signup only redirects to `/onboarding` when `data.session` exists (email confirmation off); with confirmation on, the user must click the emailed link → `/auth/callback`, then sign in.
- `server.ts` `setAll` silently swallows cookie-write errors from Server Components — sign-in mutations only persist via middleware or route handlers.
- `src/types/form.type.ts` holds generic `Form` types unrelated to auth; auth forms use `auth.schemas.ts`.

**When editing:** Keep the three client factories distinct; never import the browser client into server code or vice versa. New protected routes rely on `updateSession`'s default-deny + the right `ensure*` helper; new public routes go in the `isPublic` allowlist in `supabase/middleware.ts`. Keep `next` sanitization on any new redirect. Changing the "ready" definition means updating both `ensureAppAccess` and `ensureOnboardingAccess`. New email flows must point `emailRedirectTo` at `/auth/callback`.

---

### AI assistant & agents (backend)

_Two AI paths: a provider-agnostic streaming chat (`/api/chat` via the Vercel AI gateway) and an auth-gated OpenAI-Agents meme generator (`/api/agents/meme`)._

**Paths:** `src/lib/ai`, `src/lib/agents`, `src/app/api/chat`, `src/app/api/agents/[agentId]`, `src/lib/image`, `src/lib/assistant-pet-copy.ts`

The general assistant streams text through the Vercel AI SDK; the meme agent runs a tool-calling OpenAI agent that edits the uploaded photo into a meme. Agent *metadata* (`registry.ts`) is client-safe and shared with the UI; agent *implementations* (`meme-agent.ts`) are `server-only`.

**Key files**
- `src/lib/ai/providers.ts` — `getModel()` returns `gateway(AI_MODEL ?? "openai/gpt-4o-mini")` (Vercel AI gateway routing); exports `SYSTEM_PROMPT` (the SG pet-care persona).
- `src/lib/agents/registry.ts` — `ASSISTANT_AGENTS` metadata array (`general` chat, `meme`) + `AssistantAgentId`/`AssistantAgentKind` types and `getAssistantAgent(id)`. Safe to import in client components.
- `src/lib/agents/meme-agent.ts` — `server-only`. An `@openai/agents` `Agent<MemeAgentContext>` (model `gpt-4o`) with one tool `generate_pet_meme` that calls OpenAI image edit (`gpt-image-1`, `input_fidelity: "high"`). The tool writes the result to `ctx.generatedMemeDataUrl` (mutable run context) so the base64 never re-enters the model.
- `src/app/api/chat/route.ts` — `POST` that `streamText({ model: getModel(), system: SYSTEM_PROMPT, messages: convertToModelMessages(...) })` and returns `createUIMessageStreamResponse(...)`.
- `src/app/api/agents/[agentId]/route.ts` — `POST` for `agentId === "meme"` only: auth-gates via `getUser()` (401), requires `OPENAI_API_KEY` (503), parses `multipart/form-data` (`image` ≤ 20 MB, PNG/JPEG/WebP; optional `message`), builds a downscaled vision preview, `run(memeAgent, input, { context, maxTurns: 12 })`, returns JSON `{ assistantText?, memeImageDataUrl?, toolError? }`.
- `src/lib/image/downscale-for-vision.ts` — `downscaleForVisionPreview(buf)` using `sharp` (longest edge 768, JPEG q82). The original full-res buffer is what the image-edit tool actually uses.
- `src/lib/assistant-pet-copy.ts` — `buildAssistantWelcome(pet)` and `buildContextPetSubtitle(pet)` (presentation copy from a `PetDTO`).

**How it connects:** The **Assistant UI** page POSTs general chat to `/api/chat` (streamed via `useChat`) and meme requests to `/api/agents/meme` (one-shot JSON). `registry.ts` drives the agent selector. The meme route depends on the **Data layer**'s auth helper (`getUser`) and the `sharp` downscaler. `SYSTEM_PROMPT` defines the assistant's SG/HDB pet-care persona.

**Conventions**
- Keep agent metadata in `registry.ts` (client-importable); keep server-only agent logic + secrets in `*-agent.ts` files guarded by `import "server-only"`.
- Pass large binary (images) through the agent **run context**, not tool outputs/model messages — mirror the `generatedMemeDataUrl` pattern.
- The chat model is configurable via `AI_MODEL`; don't hardcode model ids in routes.

**Gotchas**
- **`/api/chat` is NOT authenticated** — any caller can stream completions. The meme route *is* gated. Add an auth check to `/api/chat` if that matters for your deployment.
- `/api/chat` uses the **Vercel AI gateway** (`gateway(...)` from `ai`), which needs gateway credentials (e.g. `AI_GATEWAY_API_KEY`) or a Vercel deployment — `.env.example` only lists `OPENAI_API_KEY`, so local chat may need the gateway key configured.
- The meme agent shows the model only a 768px preview but edits the original full-res image — keep both in sync when changing the flow.

**When editing:** New chat behavior → tweak `SYSTEM_PROMPT`/`getModel`. New agent kind → add to `ASSISTANT_AGENTS`, create a `server-only` agent file, and branch in `/api/agents/[agentId]` (+ the assistant page UI). Wrap any new external/model calls in the route's existing error-to-JSON handling.

---

### Data pipeline (SG pet data ingestion + embeddings)

_Offline, manually-run Node ESM scripts that scrape Singapore pet data (Kohepets products, Google Places groomers/vets) into Postgres + pgvector and embed it into `knowledge_chunks` so the AI agent can answer profile-aware questions via RAG._

**Paths:** `scripts/data-pipeline/`

This module populates the retrieval store behind the AI agent. It owns a canonical, Prisma-independent SQL schema (`products`, `service_places`, `knowledge_chunks`, plus pgvector and two RPC functions) and idempotent ingestion scripts run by hand against a local Docker Postgres first. Each write step upserts on a natural key and records a row in `ingestion_runs`. The output is queried by `src/lib/pet-data/search.ts` (the **Data layer**), which the agent's tools call. Live-search fallback is intentionally not built here — `probe-product-providers.mjs` documents the endpoints.

**Key files**
- `sql/pipeline-schema.sql` — canonical, idempotent schema: extensions (`pgcrypto`, `vector`), tables (`ingestion_runs`, `products`, `product_variants`, `service_places`, `service_place_contacts`, `place_reviews`, `service_place_suitability`, `booking_requests`, `knowledge_chunks` with `vector(1536)` + HNSW index) and RPCs `match_knowledge_chunks(query_embedding, match_count, filter)` + `nearby_service_places(kind_filter, origin_lat, origin_lng, radius_km, result_count)`. Lives outside `prisma/migrations/` on purpose.
- `_db.mjs` — shared pg connection from `DATABASE_URL`; SSL off for local hosts, `rejectUnauthorized:false` otherwise. Exports `getClient`, `getPool`, `describeTarget` (logs `LOCAL`/`REMOTE`).
- `apply-sql.mjs` — applies any `.sql` file via node-postgres (no `psql` needed); wrapped by `pnpm db:apply:pipeline`.
- `run-sql-file.mjs` — alternative applier that shells out to `psql`; `--discover-pooler --project-ref <ref>` finds a working Supabase pooler region.
- `db-check.mjs` — read-only introspection (tables + row counts, extensions, RPC presence). Wrapped by `pnpm db:check`.
- `ingest-kohepets.mjs` — Kohepets (Shopify) food collections → `products` + `product_variants` (no API key). Flags: `--limit`, `--per-collection`, `--collections-limit`, `--delay`, `--dry-run`.
- `ingest-google-places.mjs` — Google Places API (New) `places:searchText` for SG groomers/vets → `service_places` + `place_reviews`. Needs `GOOGLE_PLACES_API_KEY`. Flags: `--kind groomer|vet|all`, `--delay`, `--dry-run`.
- `backfill-contacts.mjs` — base pass writes phone/website/maps; enrich pass fetches each website for email/WhatsApp/booking links and promotes `primary_email` + `booking_url`. Flags: `--base-only`, `--concurrency`, `--timeout`.
- `embed-knowledge.mjs` — embeds `products`/`service_places`/`place_reviews` into `knowledge_chunks` via OpenAI `text-embedding-3-small` (1536-dim, batches of 96). Needs `OPENAI_API_KEY`. Flags: `--entity product|service_place|place_review`, `--limit`.
- `lib/parse.mjs` — shared HTML helpers (`stripHtml`, `htmlToText`, `extractProductSections`).
- `probe-product-providers.mjs` — exploration-only endpoint probe (wrapped by `pnpm probe:products`).
- `search-smoke.ts` — smoke test importing `src/lib/pet-data/search.ts`; run with `pnpm exec tsx scripts/data-pipeline/search-smoke.ts`.

**How it connects:** Output is consumed only through `src/lib/pet-data/search.ts` (**Data layer**) — `searchFood` → `match_knowledge_chunks`, `searchGroomers`/`searchVets` → `nearby_service_places` + reviews — which is the handoff to the **AI assistant** tools.

**Conventions**
- Run order: (1) `ingest-kohepets.mjs` → (2) `ingest-google-places.mjs` → (3) `backfill-contacts.mjs` → (4) `embed-knowledge.mjs` (embeddings last; they read populated rows).
- Every write step is idempotent (upserts on a natural `unique` key); re-running is safe.
- Each ingestion opens/closes an `ingestion_runs` row with a `stats` jsonb — use it to audit runs.
- Develop against local Postgres first (`pgvector/pgvector:pg17` Docker). `describeTarget()` tells you which DB you're hitting before writes.
- Keep `text-embedding-3-small` (1536-dim) in `embed-knowledge.mjs` and `search.ts` matched to the `vector(1536)` column.

**Gotchas**
- **Prisma ownership footgun:** these tables are not in `prisma/schema.prisma` (Prisma owns only `Pet` + `CareLog`). `prisma migrate dev`/`db push`/`reset` treat them as drift and **DROP** them. Use `prisma migrate deploy`; re-apply anytime with `pnpm db:apply:pipeline` (idempotent).
- Only a subset is wrapped by npm scripts (`db:apply:pipeline`, `db:check`, `probe:products`); the ingest/embed/backfill scripts run via `node scripts/data-pipeline/<file>.mjs`.
- Required env: `DATABASE_URL` (all), `GOOGLE_PLACES_API_KEY` (places), `OPENAI_API_KEY` (embed + search). Loaded via `dotenv`.
- Scrapers depend on third-party HTML/JSON shapes and can silently degrade; use `--dry-run` + the probe to diagnose.

**When editing:** Keep `sql/pipeline-schema.sql` the single source of truth and fully idempotent (`create ... if not exists` / `create or replace`); never add these tables to Prisma. Changing embedding shape means updating `embed-knowledge.mjs`, the `vector(1536)` column + `match_knowledge_chunks`, and `search.ts` together, then re-embedding and running the smoke test. Test against local Postgres and confirm with `pnpm db:check`.

---

### Routing, layouts & pages (App Router)

_The Next.js App Router surface: a global root layout, an auth-gated `(main)` route group that injects pet context, and four feature pages (dashboard, assistant, discovery, profiles)._

**Paths:** `src/app/layout.tsx`, `src/app/(main)/`

Routing follows App Router conventions. The root layout sets fonts/themes/toaster globally. The `(main)` route group shares one async layout that enforces access and fetches pet context once. Most pages are Server Components that read `getPetCareContext()` and redirect to `/onboarding` when there's no pet; the assistant page is the exception (a Client Component orchestrating chat state).

**Key files**
- `src/app/layout.tsx` — root layout: Google fonts (`Inter` → `--font-inter`, `Quicksand` → `--font-quicksand`, `Geist_Mono`), Material Symbols stylesheet, app `metadata`, and mounts `<ThemeProvider>` + `<Toaster position="top-center" richColors />` (from `sonner`).
- `src/app/(main)/layout.tsx` — async Server Component: `await ensureAppAccess()` then `getPetCareContext()`, wraps children in `<PetCareProvider value={petContext}>`. Every `(main)` page renders inside this.
- `src/app/(main)/page.tsx` — dashboard (Server Component): `getPetCareContext()`, `redirect("/onboarding")` if no pet, renders the pet card, daily care log, and AI/nearby cards via `PetCareShell active="dashboard"`.
- `src/app/(main)/assistant/page.tsx` — `"use client"`: owns chat state. Builds `DefaultChatTransport({ api: "/api/chat" })` + `useChat`, plus a manual meme flow that POSTs `FormData` to `/api/agents/meme`. (UI building blocks documented under **Assistant UI**.)
- `src/app/(main)/discovery/page.tsx` — Server Component: personalizes the header/filters from the pet, but the listings + map are currently **hard-coded mock UI** (no live pipeline data yet).
- `src/app/(main)/profiles/page.tsx` + `profiles-pet-form.tsx` — server page computes a "profile strength" %, renders the client `ProfilesPetForm`, which submits to the `updatePrimaryPet` server action (**Data layer**).

**How it connects:** Root layout wraps the whole tree (theme + toasts). `(main)/layout.tsx` is the gate + context provider for all logged-in pages, bridging **Auth** (`ensureAppAccess`) and the **Data layer** (`getPetCareContext`) into the **App shell** (`PetCareProvider`). Pages compose `PetCareShell` + **UI primitives** + `pet-care/primitives`. The assistant page is the client of the **AI backend**.

**Conventions**
- Default to Server Components; add `"use client"` only when you need browser state/hooks (assistant page, forms).
- Gate authed routes by placing them in `(main)` (inherits `ensureAppAccess`) rather than re-checking per page; still `redirect("/onboarding")` when a page hard-requires a pet.
- Wrap page content in `<PetCareShell active="...">`; read pet state via `usePetCare()`, not props drilling.
- Mutations go through server actions that `revalidatePath`, not client fetches to ad-hoc routes.

**Gotchas**
- `discovery/page.tsx` listings and the dashboard's "AI care alert"/weather are **placeholder/mock content** — wiring them to `search.ts`/live data is pending work, not a bug.
- Pages assume a pet exists (they `redirect("/onboarding")` otherwise); keep that guard when adding `(main)` pages that read `pet`.

**When editing:** New authed page → add a folder under `src/app/(main)/`, render `PetCareShell`, read `getPetCareContext()`/`usePetCare()`, and add a nav entry in `src/lib/pet-data.ts` (`navItems`) + `ROUTE_META` in `app-top-bar.tsx`. To make discovery real, replace the mock `listings` with `searchGroomers`/`searchVets` results seeded by `postalToLatLng(pet.locationPostalCode)`.

---

### App shell, pet-care UI & theming

_The authenticated app frame — resizable sidebar, top bar, branding, theming, and the design-token system — wrapping every `(main)` page in shared pet context._

**Paths:** `src/components/pet-care`, `src/components/react-bits/ambient-aurora.tsx`, `src/components/mode-toggle.tsx`, `src/components/theme-provider.tsx`, `src/hooks`, `src/app/globals.css`

The `(main)` route group renders inside `PetCareShell`, a fixed left rail (drag-resizable) plus a sticky top bar, with the page content in the remaining column. Active-pet state is delivered via React Context (`PetCareProvider`), not zustand. Theming is `next-themes` class-based dark mode, and all surface colors/radii/fonts are Tailwind v4 `@theme` tokens layered over `:root`/`.dark` CSS variables.

**Key files**
- `src/components/pet-care/shell.tsx` — `PetCareShell({ active, children })`; sets `--app-sidebar-width` from `useResizableSidebar(248, { min: 212, max: 340 })`, renders `AppSidebar` (desktop) + a `Sheet`-based mobile drawer + `AppTopBar`.
- `src/components/pet-care/app-sidebar.tsx` — `AppSidebar` + `SidebarContent` (shared by rail + drawer) + internal `SidebarGrip` drag handle. Reads `pet` from `usePetCare()`; maps `navItems` from `@/lib/pet-data`; hosts `ModeToggle`, "Book vet", `SignOutButton`.
- `src/components/pet-care/app-top-bar.tsx` — `AppTopBar`; per-route titles via a `ROUTE_META` map keyed on `usePathname()`, shows active pet avatar/name.
- `src/components/pet-care/pet-care-provider.tsx` — `PetCareProvider({ value, children })` + `usePetCare()` over `createContext<PetCareContext | null>`; `usePetCare` throws outside the provider. Holds the server-fetched `PetCareContext` (`pet: PetDTO | null`). **React Context, not zustand.**
- `src/components/pet-care/brand-wordmark.tsx` / `mascot.tsx` — `BrandWordmark({ compact })` / `BrandMascot({ size })` (inline animated SVG).
- `src/components/pet-care/primitives.tsx` — presentational wrappers `Pill`, `FadeContent`, `AnimatedList`, `SpotlightCard`, `ShinyText` (apply `rb-*`/`llp-*` classes).
- `src/components/pet-care/sign-out-button.tsx` — `SignOutButton`; calls Supabase `createClient().auth.signOut()` then `router.push("/login")` + `router.refresh()`.
- `src/components/react-bits/ambient-aurora.tsx` — `AmbientAurora`; fixed `-z-10` decorative gradient blobs.
- `src/components/theme-provider.tsx` / `mode-toggle.tsx` — `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`) / `ModeToggle` (SSR-guarded with a `mounted` flag).
- `src/hooks/use-mobile.ts` (`useIsMobile()`, 768px) / `use-resizable-sidebar.ts` (`useResizableSidebar`).
- `src/app/globals.css` — Tailwind v4 `@import "tailwindcss"`; `@custom-variant dark`; `@theme inline` mapping `--color-*`/`--radius-*`/font vars; `:root` + `.dark` tokens (oklch colors, `--llp-*` palette, shadows); `llp-*`/`rb-*` keyframes.

**How it connects:** `(main)/layout.tsx` fetches context and wraps children in `PetCareProvider`; pages render `PetCareShell active="..."`; sidebar/top-bar read the same context via `usePetCare()`. Fonts declared in the root layout are consumed via `@theme`'s `--font-sans`/`--font-llp-display`. `ThemeProvider` (root layout) makes `.dark` tokens + `ModeToggle` work app-wide.

**Conventions**
- Read the active pet only through `usePetCare()`; never thread `pet` as props through the shell.
- Use `font-llp-display` (Quicksand) for brand/headline text; body inherits Inter via `font-sans`.
- Prefer semantic token classes (`bg-sidebar`, `text-muted-foreground`, `border-border`, `bg-card`) and `--llp-*` vars over raw hex.
- Sidebar width is the CSS var `--app-sidebar-width`; content offsets with `md:pl-[var(--app-sidebar-width)]`.

**Gotchas**
- `usePetCare()` throws outside `PetCareProvider`, so shell components only render under the `(main)` layout.
- `ModeToggle` renders a hidden placeholder until `mounted` (avoids hydration mismatch) — expected, not dead code.
- `AppSidebar`/`AppTopBar` are desktop-only (`hidden ... md:flex`); mobile nav is the `Sheet` drawer in `shell.tsx`.

**When editing:** Add color/radius tokens by declaring a CSS var in `:root` + `.dark` and mapping it under `@theme inline`. New nav destinations go in `navItems` (`@/lib/pet-data`) + a `ROUTE_META` entry in `app-top-bar.tsx`. Keep new components reading state via `usePetCare()` and reuse `primitives.tsx`/`react-bits` wrappers.

---

### Assistant UI (chat components)

_Presentational chat building blocks for the AI Assistant tab — two agent modes (streaming text vs. image meme) orchestrated by the assistant page._

**Paths:** `src/components/assistant`

These are mostly stateless, prop-driven view components. The page (`src/app/(main)/assistant/page.tsx`) owns all state and wiring: it switches between a "general" streaming chat (`useChat`) and a "meme" mode (manual `FormData` POST). `agent-selector.tsx` flips the active agent; `chat-bubble.tsx`/`chat-input.tsx` render messages and composer; `general-chat.tsx`/`meme-chat.tsx` are the two message lists; `context-sidebar.tsx` shows the active pet + agent context.

**Key files**
- `src/components/assistant/agent-selector.tsx` — `AgentSelector({ agentId, onAgentChange })`; `"use client"` dropdown over `ASSISTANT_AGENTS` (ids `"general"` | `"meme"`).
- `src/components/assistant/general-chat.tsx` — `GeneralChat({ messages, busy, error })`; reads each message's `parts` (`type === "text"`) or falls back to `content`, renders `ChatBubble`s + a trailing `LoadingBubble`.
- `src/components/assistant/meme-chat.tsx` — `MemeChat({ messages, busy, error, welcomeText })` + the `MemeMessage` type (`{ id, role, text, imageUrl? }`).
- `src/components/assistant/chat-bubble.tsx` — `ChatBubble({ speaker, content, imageUrl? })` (renders `next/image` for memes) + `LoadingBubble()`.
- `src/components/assistant/chat-input.tsx` — `ChatInput` (text composer) and `MemeChatInput` (file + text; submit disabled until a `file` is chosen).
- `src/components/assistant/context-sidebar.tsx` — `ContextSidebar({ activeAgentId })`, `"use client"`; reads `pet` via `usePetCare()`, shows pet card + meme tips or static `sources`. Desktop-only.

**How it connects:** The page builds `new DefaultChatTransport({ api: "/api/chat" })` (from `ai`) and `useChat({ transport, messages })` (from `@ai-sdk/react`), deriving `busy` from `status`. Text submit → `sendMessage({ text })` → streams from `/api/chat` → re-renders `GeneralChat`. Meme mode bypasses `useChat`: it reads the file to a data-URL preview, POSTs `FormData` to `/api/agents/meme`, and pushes the JSON response into its own `memeMessages` state. Welcome text + pet name come from `usePetCare()` (**App shell**).

**Conventions**
- Keep these components presentational; state, transport, and fetch logic live in the assistant page.
- General-chat messages are AI SDK `UIMessage`-shaped (`parts[]`); read text from `parts` first, `content` as fallback.
- Meme messages use the local `MemeMessage` shape — distinct from `useChat` messages; don't mix the two lists.

**Gotchas**
- Two parallel busy signals: `busy` (from `useChat` `status`) for general vs. `memeBusy` (manual) for meme — wire the right one per mode.
- The meme path is a one-shot JSON POST (no streaming); errors surface via the page's `memeError`, not `useChat`'s `error`.
- `ChatBubble` images use `next/image` with `unoptimized` (data-URL/remote output) — keep that flag.

**When editing:** New agent mode → extend `ASSISTANT_AGENTS` (**AI backend**) + add a branch in the assistant page (list + input + busy/error wiring); the selector picks it up. To change the streaming backend, edit the `DefaultChatTransport` `api` path in the page, not these components.

---

### UI primitives (shadcn/ui)

_Repo-owned shadcn/ui (new-york style) primitive library: thin, editable wrappers over Radix using the cva variant pattern and the `cn()` className-merge convention._

**Paths:** `src/components/ui/`, `src/lib/utils.ts`

These ~50 components are shadcn/ui primitives generated *into* the repo (not pulled from `node_modules`), so they are owned and freely editable. Most wrap a Radix primitive and tag elements with `data-slot` attributes; styling is Tailwind v4 utilities merged through `cn()`. Components with multiple looks (e.g. `button`, `badge`, `toggle`, `alert`) define styles via `cva` and export both the component and its `*Variants` function. Icons are `lucide-react`.

**Key files**
- `src/lib/utils.ts` — `cn()` (`twMerge(clsx(...))`), imported by every primitive; also a `tryCatch` Result helper.
- `src/components/ui/button.tsx` — canonical `cva` example: `variant` + `size`, `asChild` via Radix `Slot`.
- `src/components/ui/form.tsx` — react-hook-form integration: re-exports `FormProvider` as `Form`, plus `FormField` (wraps `Controller`), `FormItem`/`FormLabel`/`FormControl`/`FormDescription`/`FormMessage`, and `useFormField()`.
- `src/components/ui/sonner.tsx` — `Toaster` reading `next-themes`; mounted once in the root layout.
- `src/components/ui/dialog.tsx` — representative Radix wrapper (`sheet`, `drawer`, `alert-dialog` follow the same shape).
- `src/components/ui/sidebar.tsx` — large composite: `SidebarProvider`/`useSidebar`, cookie-persisted open state, depends on `use-mobile`.
- Remaining primitives — layout (`card`, `accordion`, `tabs`, `table`, `scroll-area`, `carousel`, `chart`), inputs (`input`, `textarea`, `checkbox`, `radio-group`, `switch`, `select`, `slider`, `label`, `field`, `input-otp`, `calendar`, `toggle`/`toggle-group`), overlays (`popover`, `hover-card`, `tooltip`, `dropdown-menu`, `context-menu`, `menubar`, `command`, `navigation-menu`), feedback/display (`alert`, `badge`, `avatar`, `progress`, `skeleton`, `spinner`, `empty`, `item`, `kbd`, `breadcrumb`, `pagination`, `button-group`).

**How it connects:** The shared building blocks the whole app composes with. The **App shell** mounts `Toaster` once in the root layout and uses `sidebar.tsx`; **Auth** and other forms build on `form.tsx` + react-hook-form with `input`/`button`/`label`; **Assistant UI** and feature views reuse `dialog`/`sheet`/`card`/`button`. Any toast calls `toast(...)` from `sonner`.

**Conventions**
- Always merge classNames with `cn()` from `@/lib/utils` (last-wins) — never string-concatenate Tailwind classes.
- Variant-bearing components use `cva` and export `*Variants`; reuse those (e.g. `buttonVariants({ variant: "ghost" })`) instead of hand-rolling class strings.
- Components style via `data-slot` + accept a `className` override; prefer overriding through props over forking a file.

**Gotchas**
- These are first-party source, not a dependency — re-running the shadcn CLI for an existing component **overwrites local edits**. Treat regeneration as destructive.
- `useFormField()` only works inside a `<FormField>` (throws otherwise); `useSidebar` requires `SidebarProvider`.
- `sonner.tsx` depends on `next-themes`; the theme provider must be in the tree.
- No JS Tailwind config (v4 is CSS-first via `globals.css`); `components.json`'s `tailwind.config` is empty.

**When editing:** Edit these files directly for app-wide tweaks (e.g. add a `variant` to `buttonVariants`). To add a primitive, prefer the shadcn CLI (`npx shadcn@latest add <name>`), which reads `components.json` (new-york, lucide, the aliases) and writes into `src/components/ui/`; a `@react-bits` registry is also configured. After generating, verify it imports `cn` from `@/lib/utils` and follows the `data-slot` + `cva` conventions.

---

### Design references & prototypes (NOT shipped app code)

_Static HTML/JSX mockups and Stitch-generated design references that informed the real app in `src/` but are never imported, built, or served._

**Paths:** `fourcats/`, `stitch_sg_personalized_pet_ai/`, `public/`

These two top-level directories are **design handoff bundles**, not application code. `fourcats/` is a Claude Design export of standalone HTML/JSX prototypes plus the chat transcript that produced them; its `README.md` says these are "prototypes, not production code." `stitch_sg_personalized_pet_ai/` is a set of Stitch-generated screens (each a `code.html` + `screen.png`) plus a `DESIGN.md` defining the "Warm AI Pet Care" tokens (Petal Pink / Tail Wag Yellow / Loyal Navy palette, Quicksand + Inter). Neither directory is referenced by the Next.js app. By contrast, `public/` holds the **real** static assets served by Next.js.

**Key files / dirs**
- `fourcats/README.md` — handoff instructions (design medium, not code).
- `fourcats/chats/chat1.md` — design conversation transcript (intent).
- `fourcats/project/llp-shell.jsx`, `llp-assistant.jsx`, `llp-discovery.jsx`, `llp-onboarding.jsx`, `llp-profiles.jsx`, `llp-dashboard.jsx`, `llp-main.jsx` — per-screen prototypes.
- `fourcats/project/llp-designsystem.jsx`, `llp-ds.jsx`, `tweaks-panel.jsx` — design-system spec / tuning prototypes.
- `fourcats/project/Little Lovely Pets.html`, `... - Landing.html` — standalone HTML prototypes.
- `stitch_sg_personalized_pet_ai/warm_ai_pet_care/DESIGN.md` — design-token / brand source of truth.
- `stitch_sg_personalized_pet_ai/{ai_pet_care_agent,daily_care_dashboard,local_discovery_services,pet_profile_onboarding}/` — `code.html` + `screen.png` each.
- `public/*.svg` — real static assets served by Next.js.

**How it connects:** These inform the design of `src/` but never execute. Prototype → real implementation mapping: `llp-shell.jsx` → `src/components/pet-care/shell.tsx`; `llp-assistant.jsx` → `src/app/(main)/assistant/page.tsx`; `llp-discovery.jsx` → `src/app/(main)/discovery/page.tsx`; `llp-profiles.jsx` → `src/app/(main)/profiles/page.tsx`; `llp-onboarding.jsx` → `src/app/onboarding/page.tsx`; `DESIGN.md` tokens → `src/app/globals.css`.

**Conventions**
- Treat `fourcats/` and `stitch_sg_personalized_pet_ai/` as a **visual source of truth**, not a behavioral one — match the look, don't port internal structure.
- `DESIGN.md` is canonical for brand tokens; `llp-*.jsx` show intended screen composition.

**Gotchas**
- Editing anything under `fourcats/` or `stitch_sg_personalized_pet_ai/` does **NOT** change app behavior — they aren't imported or built.
- `public/` is the opposite — it **is** real and served; don't lump it in with the prototypes.
- The `.jsx` prototypes use plain browser globals; the shipped components are `.tsx` under `src/`.

**When editing:** To change what users see, edit the corresponding `src/` file from the mapping above — not the prototype. Update the prototypes only to revise the design reference itself, then propagate into `src/` manually. To change served static assets, edit `public/`.

---

## Global conventions

- **Server-first.** Default to React Server Components; add `"use client"` only for interactivity. Server-only modules import `"server-only"`.
- **Auth-scope every data access** by the Supabase user id; never trust client-supplied ids.
- **Mutations = server actions** that validate with zod and `revalidatePath`; avoid bespoke mutation API routes.
- **Path aliases** (`@/*`, `@public/*`, `@generated/*`) over deep relative imports.
- **Styling** via `cn()` + semantic Tailwind tokens; design tokens live in `globals.css` (Tailwind v4, no JS config).
- **Lint/format** with Biome (`pnpm lint` / `pnpm format`) before committing.

## Sharp edges (read before you touch the DB or AI)

1. **Never** run `prisma migrate dev` / `db push` / `reset` against a DB with pipeline tables — they get dropped. Use `prisma migrate deploy`; re-seed schema with `pnpm db:apply:pipeline`.
2. `/api/chat` is **unauthenticated** and routes through the **Vercel AI gateway** (needs gateway creds locally). `/api/agents/meme` is authenticated and needs `OPENAI_API_KEY`.
3. Prisma `Decimal` fields are **stringified** in DTOs (`ageYears`, `weightKg`); `Number(...)` only when rendering.
4. `Pet.userId` ↔ Supabase `auth.users.id` has **no FK** (soft cross-DB join); onboarding state derives from `prisma.pet.count`.
5. The discovery page and some dashboard cards are **mock UI** today — real data comes from `src/lib/pet-data/search.ts` once wired.
6. Embedding model/dims (`text-embedding-3-small`, 1536) must stay in sync across `embed-knowledge.mjs`, the `vector(1536)` column, and `search.ts`.
