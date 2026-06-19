# WorksheetGen — Session Context & Build Log
*Last updated: 2026-06-10. Resume from here next session.*

---

## Project Location

```
C:\Users\adamh\Claude\Projects\EdTech Thang\worksheet-gen
```

Reference docs:
- UI/UX spec: `C:\Users\adamh\Downloads\gemini-code-1781009080020.md`
- Tech architecture: `C:\Users\adamh\Claude\Projects\EdTech Thang\build-structure.md`

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.7 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Font | Open Sans (via `next/font/google`) |
| Math rendering | KaTeX (server-side via `katex.renderToString`) |
| Database | Supabase (PostgreSQL) — **schema deployed** |
| Auth | Supabase Auth — **not yet wired into the app** |
| LLM | Anthropic Claude API — **not yet wired** |
| Hosting | Vercel — **not yet deployed** |

---

## What Has Been Built (Frontend — Complete)

### Phase 1 — Dashboard (`/`)
- Navbar: logo, constrained search bar with ⌘K hint, indigo avatar
- Welcome hero card with "Create New Question Set" CTA
- 3-column responsive worksheet card grid
- Each card: title, syllabus badge, subject, modified date, three-dot context menu
- Clicking a card navigates to `/workspace/[id]`

### Phase 2 — Open Sans Font
- Loaded via `next/font/google` → CSS variable `--font-open-sans`
- Applied to `html, body` only — **not** the `*` selector (would break KaTeX)

### Phase 3 — Dark Mode (NotebookLM aesthetic)
| Token | Hex |
|---|---|
| App background | `#121417` |
| Surface panels | `#1E2024` |
| Muted text | `#9AA0A6` |
| Borders | `#2C2E33` |
| CTA / accent | `#4D528A` |

### Phase 4 — Three-Panel Workspace (`/workspace/[id]`)
- 100vh-locked layout, hidden scrollbars
- Left 20%: Parameters panel
- Center 50%: Document canvas — white paper, Georgia serif, KaTeX math
- Right 30%: AI chat sidebar with macro pills
- 3 sample physics questions with display-mode equations

### Phase 5 — Parameters Panel Refactor
- Default **view state**: typographic key-value pairs, no dropdowns
- **Edit state**: animated dropdowns, 150ms ease-out opacity + translateY
- Draft pattern: changes staged locally, only committed on "Update Parameters"
- Cancel discards draft; double `requestAnimationFrame` triggers transition after mount

### Phase 6 — Full Interactivity Layer
- **Parameters → canvas header**: live binding — changing subject/syllabus/etc. instantly updates the document metadata string
- **Chat → question mutation**: submitting a message triggers a 1.4s skeleton loading state on targeted question nodes, then mutates the question array
- **Macro pills auto-submit**: clicking a pill fires immediately into the chat workflow (no second click)
- **Export Document → print**: `window.print()` + `@media print` CSS strips left/right panels, outputs clean white A4 with `break-inside: avoid` per question

---

## Key File Map

```
app/
  globals.css                    ← Tailwind v4, fonts, hide-scrollbar, skeleton animation, @media print
  layout.tsx                     ← Open Sans font load, root html/body
  page.tsx                       ← Dashboard (worksheet library)
  workspace/[id]/
    page.tsx                     ← Async server component, awaits params, renders WorkspaceHeader + WorkspaceClient

components/
  Navbar.tsx                     ← 'use client' — search bar focus handlers
  WorksheetCard.tsx              ← 'use client' — three-dot context menu, Link wrapper
  workspace/
    WorkspaceClient.tsx          ← 'use client' — shared state owner (parameters, questions, loadingIds)
                                    Contains mutateQuestion() logic for all command types
    WorkspaceHeader.tsx          ← 'use client' — Export button calls window.print()
    ParametersPanel.tsx          ← 'use client' — controlled by WorkspaceClient via values/onApply props
    DocumentCanvas.tsx           ← 'use client' — renders questions or QuestionSkeleton based on loadingIds
    ChatPanel.tsx                ← 'use client' — onSubmit prop wires into WorkspaceClient.handleChatSubmit

lib/
  renderMath.ts                  ← renderInline() and renderDisplay() using KaTeX
  questions.ts                   ← Question type + INITIAL_QUESTIONS array (source of truth for question data)
```

---

## Critical Technical Rules (do not break these)

1. **KaTeX font**: `html, body` only in globals.css — never `html, body, *`. The `*` selector overrides `.katex span { font-family: KaTeX_Main }` and breaks math glyphs.

2. **KaTeX color**: The white paper `<div>` in DocumentCanvas must have `color: "#1F2937"` inline. Without it, `body { color: #FFFFFF }` inherits through and makes white math invisible on white paper.

3. **Next.js 16 dynamic params**: Must be `async function Page({ params }: { params: Promise<{ id: string }> })` with `const { id } = await params`. Synchronous destructuring throws.

4. **Tailwind v4**: Uses `@import "tailwindcss"` and `@theme inline { }` in globals.css. No `tailwind.config.js`. Arbitrary values like `bg-[#121417]` work normally.

5. **Turbopack CSS cache**: If globals.css changes don't appear in the browser, delete `.next/` and restart the dev server. The hash-based CSS chunks don't always hot-reload.

6. **`'use client'` requirement**: Any component with `onClick`, `onFocus`, `onBlur`, `onMouseEnter`, `useState`, `useEffect` etc. needs `"use client"` at the top. Server Components cannot pass event handlers.

---

## Supabase — Database Status

**Schema has been deployed.** The following objects exist in the Supabase project:

### Tables
| Table | Purpose |
|---|---|
| `public.users` | Extends `auth.users` — role (`teacher`/`admin`), school |
| `public.topics` | Controlled vocabulary for typeahead — name, syllabus, subject |
| `public.questions` | Main question store — all filters + text + mark scheme + verification status |

### Key constraints
- `topics`: unique on `(name, syllabus, subject)`
- `questions`: grade check `BETWEEN 7 AND 13`, difficulty check `IN ('Approaching', 'Meeting', 'Exceeding')`, question_type check `IN ('short_answer', 'essay', 'structured', 'mcq')`

### Trigger
- `on_auth_user_created` → auto-inserts a `public.users` row with `role = 'teacher'` on every Supabase Auth signup

### RLS Policies
- `users`: read/insert/update own row only
- `topics`: any authenticated user can read and insert
- `questions`: authenticated users read verified only; admins read all; only admins update/delete
- Admin check pattern: `EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')`

### Views
- `questions_pending_review` — unverified questions joined with topic name (for admin queue)
- `topic_question_counts` — verified count per (topic, grade, criterion, difficulty, type) combination (for fetch-or-generate logic)

### Seed data
45 topics across: Cambridge IGCSE (Physics, Biology, Chemistry, Mathematics), Edexcel GCSE (Physics), IB MYP (Mathematics), A-Level (Physics)

### Post-deploy manual step
After creating your own Supabase Auth account, manually set `role = 'admin'` in the `public.users` table for your user ID to access the admin review queue.

---

## What Is Next (Backend Integration)

These are the remaining tasks in order of dependency:

### 1. Supabase client helpers
Create two files:
- `lib/supabase/client.ts` — browser client using `createBrowserClient` from `@supabase/ssr`
- `lib/supabase/server.ts` — server client using `createServerClient` + `cookies()` from `next/headers`

Install: `npm install @supabase/supabase-js @supabase/ssr`

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_api_key
```

### 2. Auth pages
- Login / signup route (e.g. `/auth`)
- Signup: email + password → Supabase Auth → trigger auto-creates `users` row
- Redirect authenticated users away from `/auth`, redirect unauthenticated users away from `/` and `/workspace/*`
- Auth middleware in `middleware.ts` using `@supabase/ssr`

### 3. API Route — `GET /api/topics`
Powers typeahead in the Parameters panel as teacher types.

Query params: `syllabus`, `subject`, `q` (partial name)

Logic:
```sql
SELECT id, name FROM public.topics
WHERE syllabus = $1 AND subject = $2
  AND name ILIKE $3 || '%'
ORDER BY name
LIMIT 10
```

### 4. API Route — `POST /api/questions/fetch-or-generate`
Core engine. Input: `{ syllabus, subject, grade, criterion, topic_id, difficulty, question_type, count }`

Logic:
1. Check `topic_question_counts` view — if `verified_count >= count` → return verified questions from DB
2. If not enough → call Claude API with a structured prompt
3. Store AI results as `verified: false` rows in `questions` table
4. Return questions + `{ source: 'ai_generated', needsReview: true }` flag

### 5. API Route — `PATCH /api/questions/[id]/verify`
Sets `verified = true`, `verified_by = auth.uid()`, `verified_at = NOW()`. Admin only.

### 6. API Route — `DELETE /api/questions/[id]`
Deletes the row. Admin only.

### 7. Wire the workspace to real data
- Parameters panel "Update Parameters" → triggers `POST /api/questions/fetch-or-generate`
- Replace `INITIAL_QUESTIONS` in `lib/questions.ts` with the API response
- Chat mutations → call Claude API instead of local `mutateQuestion()` in WorkspaceClient
- "Create New Question Set" button on dashboard → opens generation wizard

### 8. Admin Review Queue — `/admin/review`
New route, admin-only. Reads from `questions_pending_review` view.
Table with Approve / Reject actions per row.

### 9. Vercel deployment
- Connect GitHub repo to Vercel
- Set environment variables in Vercel dashboard
- Configure Supabase Auth redirect URLs for production domain

---

## Deferred to Phase 2 (out of scope now)
- Saving / reusing question set bundles
- Student submission collection
- Mark scheme auto-generation
- School-level multi-user accounts
- Vector / semantic search
