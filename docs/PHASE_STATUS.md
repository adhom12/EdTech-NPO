# Phase Status Log
_WorksheetGen — Hackathon H0: Hack the Zero Stack_

---

## Phase 1 — Decisions, provisioning, schema
_Started: 2026-06-27_

**Auth decision: Supabase auth-only.**
All application tables migrate to Aurora PostgreSQL. Supabase is used exclusively for authentication (session management, email/password sign-in, email confirmation callback). The `teacher_id` column in `courses` stores the user's Supabase auth UUID as a plain `uuid` column with no FK constraint — FK validation is enforced at the app layer via `supabase.auth.getUser()`. Architecture diagram and submission description will state this explicitly.

**Tables migrated to Aurora:** curricula, skills, topics, questions, users, courses, worksheets  
**New tables added to Aurora:** classes, feedback_flags, analytics_events  
**Remains on Supabase:** auth only (no application tables)

### Checklist
- [x] Aurora provisioned via Vercel Marketplace
- [x] Schema applied (`docs/aurora-schema-full.sql`) — via `/api/migrate` route
- [x] Connectivity verified — Aurora PostgreSQL 17.7 confirmed
- [x] OIDC auth working via `@vercel/functions/oidc` `awsCredentialsProvider`

### Files changed
- `docs/PHASE_STATUS.md` — created (this file)
- `docs/aurora-schema-full.sql` — full Aurora DDL (all tables + new Phase 1 tables)
- `worksheet-gen/lib/aurora/client.ts` — Aurora client (IAM auth via Vercel OIDC)
- `worksheet-gen/app/api/migrate/route.ts` — DELETED after use
- `worksheet-gen/app/api/test-aurora/route.ts` — DELETED after use

### Auth notes
- Vercel does not inject `VERCEL_OIDC_TOKEN` as an env var automatically
- Use `awsCredentialsProvider` from `@vercel/functions/oidc` — it fetches the token internally
- `AssumeRoleWithWebIdentity` + RDS Signer flow works correctly on Vercel's runtime

**Status:** COMPLETE — ready for Phase 2

---

## Phase 2 — Migrate read paths to Aurora
_Completed: 2026-06-27_

**Routes migrated:**
- `GET /api/skills` → Aurora
- `GET /api/topics` → Aurora
- `app/page.tsx` (dashboard) → Aurora (courses + curricula)
- `app/courses/[id]/page.tsx` (course detail) → Aurora (course, worksheets, topic suggestions)

**Data seeded into Aurora from Supabase:**
- curricula: 3 (AQA 8300, Cambridge 0580, Edexcel 4MA1)
- skills: 636
- topics: 45
- questions: 0 (none existed in Supabase yet — will be generated fresh via Aurora)

**Verified:** Dashboard loads, Add Course dropdown shows 3 curricula, course detail page renders correctly.

**Files changed:**
- `app/api/skills/route.ts` — Aurora
- `app/api/topics/route.ts` — Aurora
- `app/page.tsx` — Aurora
- `app/courses/[id]/page.tsx` — Aurora
- `app/api/seed-from-supabase/route.ts` — DELETED after use

**Status:** COMPLETE — ready for Phase 3

---

## Phase 3 — Migrate write paths to Aurora
_Completed: 2026-06-27_

**Routes/actions migrated:**
- `app/actions/courses.ts` → `createCourse` uses Aurora INSERT
- `app/actions/worksheets.ts` → `createWorksheet` (INSERT RETURNING id), `deleteWorksheet` (DELETE)
- `app/api/generate/route.ts` → topic lookup, verified question query, AI question INSERT all on Aurora
- `app/api/questions/[id]/route.ts` → PATCH (verify) and DELETE on Aurora; Supabase retained only for `auth.getUser()` + admin role check against Aurora `users` table
- `app/api/chat/route.ts` — no DB calls, no change needed

**Notes:**
- `api/generate` uses postgres.js `sql(insertPayload, 'col1', ...)` syntax for bulk insert
- Admin routes: Supabase auth.getUser() → Aurora users table role check → Aurora questions mutation

**Files changed:**
- `app/actions/courses.ts`
- `app/actions/worksheets.ts`
- `app/api/generate/route.ts`
- `app/api/questions/[id]/route.ts`

**Status:** COMPLETE — ready for Phase 4

---
