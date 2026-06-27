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

---
