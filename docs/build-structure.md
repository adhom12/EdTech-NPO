# EdTech SaaS — Phase 1 Build Structure

## Stack

- **Frontend + backend**: Next.js (App Router)
- **Database + auth**: Supabase
- **LLM**: Anthropic Claude API (or OpenAI GPT-4o)
- **Hosting**: Vercel

---

## Database Schema

### `topics` — controlled vocabulary for the typeahead

| field | type | notes |
|---|---|---|
| id | uuid | PK |
| name | text | e.g. "Photosynthesis" |
| syllabus | text | e.g. "IB MYP", "IGCSE" |
| subject | text | e.g. "Biology" |
| created_at | timestamp | |

Unique constraint on `(name, syllabus, subject)`.

---

### `questions` — main store

| field | type | notes |
|---|---|---|
| id | uuid | PK |
| topic_id | uuid | FK → topics |
| syllabus | text | denormalised for easy filtering |
| subject | text | denormalised |
| grade | integer | e.g. 9 |
| criterion | text | e.g. "B" |
| difficulty | text | "Approaching", "Meeting", "Exceeding" |
| question_type | text | "short_answer", "essay", "structured", "mcq" |
| question_text | text | |
| mark_scheme | text | nullable |
| source | text | "ai_generated" or "manual" |
| verified | boolean | default false |
| verified_by | uuid | FK → users, nullable |
| verified_at | timestamp | nullable |
| created_at | timestamp | |

---

### `users` — extends Supabase Auth

| field | type | notes |
|---|---|---|
| id | uuid | matches auth.users |
| role | text | "teacher" or "admin" |
| school | text | free text for now |

---

## Pages

| route | purpose |
|---|---|
| `/` | Landing + login |
| `/generate` | Main teacher flow |
| `/admin/review` | Verification queue (admin only) |

---

## API Routes

### `GET /api/topics`
Powers the typeahead as the teacher types.

Query params: `syllabus`, `subject`, `q` (partial topic name)

Returns matching topic names from the DB filtered by syllabus + subject.

---

### `POST /api/questions/fetch-or-generate`
Core logic route.

**Input:** `{ syllabus, subject, grade, criterion, topic_id, difficulty[], question_type }`

**Logic:**
1. Query DB for verified questions matching all filters
2. If sufficient results → return them
3. If not → call LLM API, store results as `verified: false`, return them + set a flag notifying admin

**On novel topic (not in DB yet):**
- Before generating, query for topics with similar names and return a "did you mean X?" suggestion
- If teacher confirms new topic → insert into `topics`, then generate

---

### `PATCH /api/questions/:id/verify`
Admin approves a question.

Sets `verified = true`, `verified_by`, `verified_at`.

---

### `DELETE /api/questions/:id`
Admin rejects a bad generation.

---

## Teacher Flow (UI sequence)

1. Select **Syllabus** (dropdown)
2. Select **Subject** (dropdown, filtered by syllabus)
3. Select **Grade** (dropdown)
4. Select **Criterion** (dropdown, filtered by syllabus + subject)
5. Type **Topic** → typeahead suggests existing topics matching current filters
   - If novel topic entered: show "did you mean X?" or confirm new topic
6. Select **Difficulty** (checkboxes: Approaching / Meeting / Exceeding)
7. Select **Question type** (short answer / essay / MCQ / structured)
8. Click **Generate**
9. Results returned — verified questions shown clearly, AI-generated (unverified) shown with a badge

---

## Admin Review Queue (`/admin/review`)

Table of all questions where `verified = false`, sorted by `created_at` descending.

Each row shows: question text, syllabus, subject, grade, criterion, topic, difficulty, date generated.

Actions per row: **Approve** (sets verified = true) | **Reject** (deletes).

---

## What's deferred to Phase 2

- Saving question sets (bundles a teacher can reuse)
- Student submission collection
- Mark scheme generation
- School-level accounts / multi-user schools
- Vector/semantic search (not needed while topic matching is structured)
