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

## Phase 4 — Auth resolution
_Completed: 2026-06-28 (then intentionally reverted)_

**Decision: No auth for hackathon demo.**
Real auth was wired (middleware.ts, auth page, session user.id in dashboard/createCourse) then reverted. Dashboard uses hardcoded `DEV_TEACHER_ID = 'e3987e0e-6bd4-4438-94fe-e821e1f1e0f1'`. All courses/data share this single teacher account. Auth gate would have required Supabase email confirmation which the demo environment couldn't deliver.

**Profile onboarding deferred to Phase 8** — a first-visit modal (localStorage) asking for teacher name, personalises the greeting. No backend needed.

**Status:** COMPLETE (no-auth path chosen) — ready for Phase 5

---

## Phase 5 — Skills picker scoped to curriculum
_Completed: 2026-06-28_

**Changes:**
- `app/workspace/[id]/page.tsx` — migrated from Supabase to Aurora; JOIN `worksheets → courses` to get `curriculum_id`; passes `curriculumId` and `courseId` to `WorkspaceClient`
- `components/workspace/WorkspaceClient.tsx` — accepts `curriculumId` and `courseId` props
- `components/workspace/ParametersPanel.tsx` — skills fetch now scoped: `/api/skills?curriculum_id=<id>`; added `GroupCheckbox` component with `indeterminate` state via `useRef`; topic groups have parent checkboxes that select/deselect all skills in the group

**Verified:** Skills panel loads only curriculum-relevant skills; group checkboxes show indeterminate state correctly.

**Status:** COMPLETE — ready for Phase 6

---

## Phase 6 — Classes/roster, feedback flags, analytics events
_Completed: 2026-06-28_

**Classes/roster:**
- `app/actions/students.ts` — `addStudent(formData)` and `removeStudent(studentId, courseId)` server actions
- `app/courses/[id]/page.tsx` — queries `classes` table; renders roster section with add form and remove buttons

**Feedback flags:**
- `app/api/feedback/route.ts` — POST inserts into `feedback_flags`; fires `question_flagged` analytics event
- `lib/questions.ts` — added `id?: string` to `Question` interface
- `app/api/generate/route.ts` — `dbRowToQuestion` now returns `id`; accepts `course_id` in request body
- `components/workspace/DocumentCanvas.tsx` — "Flag" hover button on questions; accepts `onFlag` callback
- `components/workspace/WorkspaceClient.tsx` — `handleFlag` uses `window.prompt` for reason then POSTs to `/api/feedback`

**Analytics events:**
- `app/api/generate/route.ts` — fires `worksheet_generated` event after generation (non-blocking `.catch(() => {})`)
- `app/api/feedback/route.ts` — fires `question_flagged` event after flag is submitted

**Admin review page:**
- `app/admin/review/page.tsx` — migrated from Supabase to Aurora; auth gate removed; queries `questions WHERE verified = false` directly

**Verified:** Roster add/remove works. Flag button appears on hover. Admin review at `/admin/review` loads unverified questions.

**⚠️ ANTHROPIC_API_KEY not yet set in Vercel** — generation returns 500 until added. Go to Vercel → Settings → Environment Variables → add `ANTHROPIC_API_KEY`.

**Status:** COMPLETE — ready for Phase 7

---

## Phase 7 — Full regression check
_Status: NOT STARTED_

Click through every flow and confirm nothing is broken:
- [ ] Dashboard loads, courses visible
- [ ] Add Course → appears on dashboard
- [ ] Course detail → worksheets + roster visible
- [ ] Add/remove student from roster
- [ ] Create question set → workspace opens
- [ ] Generate questions (needs ANTHROPIC_API_KEY in Vercel first)
- [ ] Chat panel mutates questions
- [ ] Flag question → prompt → submits
- [ ] Delete worksheet → removed from course page
- [ ] `/admin/review` shows unverified questions, Approve/Reject work

---

## Phase 8 — Demo polish
_Status: NOT STARTED_

- Profile onboarding modal on first visit (localStorage): asks teacher name, personalises "Good morning, [name]" greeting
- Any visual/copy polish for the demo
- Hardcoded demo data if needed for showcase branch

---

## Phase 9 — Submission assets
_Status: NOT STARTED — Deadline: 2026-06-29 5pm PDT_

- Architecture diagram showing Vercel → Aurora PostgreSQL flow
- Storage Configuration screenshot (proves Aurora is primary DB — required for judging gate)
- Demo video walkthrough
- Submission writeup
