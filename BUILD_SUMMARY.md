# WorksheetGen — Build Summary
_Last updated: 2026-06-27_

---

## What It Is

A teacher-facing AI worksheet generator. Teachers pick a syllabus, subject, skills, and difficulty — the app pulls verified questions from a bank, fills gaps by calling Claude, and renders a printable worksheet. Questions can be refined through a chat panel without regenerating the whole set.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind v4 |
| Database | Supabase (PostgreSQL + auth) |
| AI | Claude Sonnet 4.6 (generation), Claude Haiku 4.5 (chat mutations) |
| Math rendering | KaTeX |
| Taxonomy import | Node script + `xlsx` parsing AQA/Cambridge/Edexcel spec sheets |

---

## Database Schema

```
curricula        id, board, qualification, subject, syllabus_code
skills           id, curriculum_id, skill_id, topic, subtopic, skill_name, tier, spec_reference
courses          id, teacher_id, label, subject, curriculum_id, created_at
worksheets       id, course_id, title, share_code, created_at
questions        id, syllabus, subject, grade, criterion, difficulty, topic, question_text,
                 mark_scheme, source, verified, verified_by, verified_at
users            id, role
```

**Curriculum data loaded:** AQA GCSE Maths (8300), Cambridge IGCSE Maths (0580), Pearson Edexcel Maths (4MA1) — imported from official spec Excel files via `worksheet-gen/scripts/import-taxonomy.mjs`.

---

## Pages & Routes

| Route | What It Does |
|---|---|
| `/` | Dashboard — lists teacher's courses, "Add Course" modal |
| `/auth` | Sign in / sign up (email + password via Supabase) |
| `/auth/callback` | Email confirmation OAuth exchange |
| `/courses/[id]` | Course detail — worksheet list, stats strip, sort, empty-state topic suggestions |
| `/workspace/new?course_id=` | Server redirect: creates DB row → redirects to workspace |
| `/workspace/[id]` | 3-panel worksheet editor |
| `/admin/review` | Admin queue of unverified AI-generated questions |

---

## Core Feature: Worksheet Generation

**Flow:**
1. Teacher fills Parameters Panel (syllabus, subject, grade, difficulty, skills)
2. Hits **Apply** → `POST /api/generate`
3. API queries DB for matching _verified_ questions
4. If fewer than requested, Claude Sonnet generates the remainder (with extended thinking enabled)
5. AI-generated questions are stored with `verified: false`
6. All questions render in the Document Canvas with marks and answer lines
7. Teacher chats in the Chat Panel to mutate questions (e.g. "make question 3 harder") → `POST /api/chat` → Claude Haiku rewrites in place

---

## Components

### Workspace (3-panel IDE layout)
- **ParametersPanel** — dropdowns for syllabus/subject/grade/criterion/difficulty + skill picker grouped by topic/subtopic (fetched from `/api/skills`)
- **DocumentCanvas** — printable A4 layout; question blocks with marks, loading skeletons, verified / AI badges
- **ChatPanel** — message thread + preset macro pills ("Add Step-by-Step Answer Key", "Convert to Short Answer", "Balance Difficulty")
- **WorkspaceHeader** — back-to-course link, worksheet title, Export (browser print)

### Library
- **CourseCard** — course grid card
- **WorksheetCard** — worksheet card with delete context menu
- **AddCourseCard** — modal form to create a course
- **SortControls** — sort dropdown (newest / oldest / A–Z / Z–A) via URL param
- **Navbar** — logo, search stub, user avatar stub

---

## Server Actions & API Routes

| | Name | Does |
|---|---|---|
| Action | `createCourse` | Inserts course row, redirects to `/` |
| Action | `createWorksheet` | Inserts worksheet row, returns new UUID |
| Action | `deleteWorksheet` | Deletes worksheet, revalidates course page |
| API | `POST /api/generate` | DB lookup + Claude generation (Sonnet) |
| API | `POST /api/chat` | Claude mutation of existing questions (Haiku) |
| API | `GET /api/skills` | Skills list, optionally filtered by `curriculum_id` |
| API | `GET /api/topics` | Topic autocomplete by syllabus + subject |
| API | `PATCH /api/questions/[id]` | Admin: mark question verified |
| API | `DELETE /api/questions/[id]` | Admin: delete question |

---

## What Is Real vs. Mocked

### Real / Wired Up
- Course and worksheet CRUD (Supabase)
- Question bank (verified questions stored in DB)
- AI generation via Claude with DB persistence
- Curriculum taxonomy (AQA, Cambridge, Edexcel — imported from real specs)
- Supabase auth (sign in / sign up / callback)
- Sort controls, stats strip, topic suggestions on course page
- Worksheet title loaded from DB; workspace back-link resolves to correct course

### Hardcoded / Mocked
- `DEV_TEACHER_ID` — hardcoded UUID used everywhere instead of `supabase.auth.getUser()` (flagged with TODO comments throughout)
- Default workspace parameters ("Cambridge IGCSE · Physics · Grade 10 · Meeting")
- Initial questions on workspace load (3 sample physics questions from `lib/questions.ts`)
- ParametersPanel dropdown options (syllabus/subject/grade/criterion list hardcoded)
- "Good morning, Ms. Johnson" greeting on dashboard
- Navbar search, help, and profile buttons — UI only, no handlers
- Export Document — calls `window.print()`, no real PDF backend

---

## Known Gaps (Hackathon Priorities)

### Must-fix for a live demo
- **Auth → real user ID**: swap `DEV_TEACHER_ID` for `supabase.auth.getUser()` in `courses.ts` and `page.tsx`
- **Workspace persistence**: questions edited via chat exist in memory only — closing the tab loses them
- **Parameters → dynamic**: dropdown options for syllabus/subject should come from the `curricula` table, not be hardcoded

### Nice-to-have
- PDF export (Puppeteer / react-pdf) instead of `window.print()`
- "Regenerate" and "Delete" buttons on individual question cards (currently render on hover but have no handlers)
- Skills picker filtered to the selected curriculum only (currently loads all 500 skills regardless)
- Student-facing share link (`share_code` column exists on worksheets, no UI yet)
- Question versioning / edit history

### Not Started
- Roster / student management
- Teacher feedback / flagging on AI questions
- Analytics (completion rates, difficulty calibration)

---

## Folder Structure

```
worksheet-gen/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── auth/                     # Sign in/up + callback
│   ├── courses/[id]/             # Course detail
│   ├── workspace/
│   │   ├── new/                  # Create + redirect
│   │   └── [id]/                 # Editor
│   ├── admin/review/             # Admin queue
│   ├── actions/                  # Server actions (courses, worksheets)
│   └── api/                      # generate, chat, skills, topics, questions
├── components/
│   ├── workspace/                # 5 editor panel components
│   ├── Navbar, CourseCard, WorksheetCard, AddCourseCard, SortControls, ...
├── lib/
│   ├── supabase/server.ts        # createClient + createAdminClient
│   ├── questions.ts              # INITIAL_QUESTIONS mock data
│   └── renderMath.ts             # KaTeX block parser
├── scripts/
│   └── import-taxonomy.mjs       # One-off XLSX → Supabase importer
└── docs/
    ├── create-curricula-skills.sql
    └── add-courses-worksheets.sql
```
