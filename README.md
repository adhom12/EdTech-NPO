# EduHub — AI Worksheet Generator

AI-native question set and worksheet generator for secondary school teachers. Built for the AWS Aurora Hackathon 2026.

## What it does

EduHub lets teachers generate exam-style worksheet questions in seconds using Claude AI, organised by syllabus, topic, and skill objectives. Each class gets its own worksheet library, student roster, and performance reports — all in one place.

**Key features:**
- AI question generation aligned to AQA GCSE / Cambridge IGCSE curricula
- Three-panel workspace: parameters → live typeset preview (KaTeX) → chat editor
- Assign worksheets to multiple classes at once
- Per-class reports: topic mastery, last assignment stats, smart intervention suggestions
- Activity stream per class
- Admin review queue for AI-generated questions

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Deployment | Vercel (serverless functions) |
| Database | **AWS Aurora PostgreSQL 17.7** |
| DB auth | Vercel OIDC → AWS RDS IAM token (no stored credentials) |
| DB client | postgres.js |
| AI | Anthropic Claude — `claude-opus-4-8` (generation) · `claude-haiku-4-5` (chat) |
| Maths rendering | KaTeX |
| Language | TypeScript |

## Running locally

1. Clone the repo and install dependencies:
   ```bash
   cd worksheet-gen
   npm install
   ```

2. Create `worksheet-gen/.env.local` with:
   ```
   AURORA_PGHOST=your-aurora-cluster-endpoint
   AURORA_PGPORT=5432
   AURORA_PGDATABASE=your-db-name
   AURORA_PGUSER=your-db-user
   AURORA_AWS_REGION=your-region
   AURORA_AWS_ROLE_ARN=arn:aws:iam::...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

The app seeds three demo classes (10A Mathematics, 10E Mathematics, 11A Mathematics) with students and worksheets automatically on first run.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Production — live AI calls, real database |
| `demo` | Recording aid — hardcoded responses, reset button in sidebar |

## Database schema

```
curricula        — board, qualification, syllabus_code
courses          — teacher_id, label, subject, curriculum_id
classes          — course_id, student_name
worksheets       — course_id, title, created_at
skills           — curriculum_id, topic, subtopic, skill_name, spec_reference
questions        — syllabus, subject, grade, blocks (JSONB), mark_scheme, verified
analytics_events — course_id, event_type, payload (JSONB)
```

Aurora PostgreSQL was chosen for its serverless scaling, IAM-based passwordless authentication via OIDC (no secrets stored), JSONB support for flexible AI output, and relational integrity across the schema.
