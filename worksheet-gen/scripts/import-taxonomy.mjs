import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { createClient } from '@supabase/supabase-js'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const content = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim()
  }
  return env
}

const env = loadEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars in .env.local:')
  if (!SUPABASE_URL) console.error('  NEXT_PUBLIC_SUPABASE_URL')
  if (!SERVICE_KEY) console.error('  SUPABASE_SERVICE_ROLE_KEY  ← Supabase Dashboard → Settings → API')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const TAXONOMY_DIR = 'C:\\Users\\adamh\\Downloads\\EduHub\\IGCSE Math Taxonomy'

const CURRICULA = [
  {
    board: 'AQA',
    qualification: 'GCSE',
    subject: 'Mathematics',
    syllabus_code: '8300',
    file: 'AQA_GCSE_Maths_8300_Skill_Taxonomy.xlsx',
    tierColumn: 'tier',
    expectedCount: 226,
  },
  {
    board: 'Cambridge Assessment International Education',
    qualification: 'IGCSE',
    subject: 'Mathematics',
    syllabus_code: '0580',
    file: 'Cambridge_IGCSE_Maths_0580_Skill_Taxonomy.xlsx',
    tierColumn: 'level',
    expectedCount: 190,
  },
  {
    board: 'Pearson',
    qualification: 'IGCSE',
    subject: 'Mathematics',
    syllabus_code: '4MA1',
    file: 'Pearson_Edexcel_IGCSE_Maths_4MA1_Skill_Taxonomy.xlsx',
    tierColumn: 'tier',
    expectedCount: 220,
  },
]

async function main() {
  let allPassed = true

  for (const curriculum of CURRICULA) {
    console.log(`\n--- ${curriculum.board} ${curriculum.syllabus_code} ---`)

    const { data: curriculumRow, error: upsertErr } = await supabase
      .from('curricula')
      .upsert(
        {
          board: curriculum.board,
          qualification: curriculum.qualification,
          subject: curriculum.subject,
          syllabus_code: curriculum.syllabus_code,
        },
        { onConflict: 'syllabus_code' }
      )
      .select('id')
      .single()

    if (upsertErr) {
      console.error('curricula upsert failed:', upsertErr.message)
      process.exit(1)
    }

    const curriculum_id = curriculumRow.id
    console.log(`curriculum_id: ${curriculum_id}`)

    const wb = XLSX.readFile(join(TAXONOMY_DIR, curriculum.file))
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
    console.log(`Read ${rows.length} rows`)

    // Clear existing to make re-runs idempotent
    const { error: deleteErr } = await supabase
      .from('skills')
      .delete()
      .eq('curriculum_id', curriculum_id)

    if (deleteErr) {
      console.error('delete failed:', deleteErr.message)
      process.exit(1)
    }

    const skillRows = rows.map((row) => ({
      curriculum_id,
      skill_id: String(row.skill_id),
      topic: String(row.topic),
      subtopic: String(row.subtopic),
      skill_name: String(row.skill_name),
      tier: row[curriculum.tierColumn] != null ? String(row[curriculum.tierColumn]) : null,
      spec_reference: row.spec_reference != null ? String(row.spec_reference) : null,
      source: row.source != null ? String(row.source) : null,
    }))

    const BATCH = 100
    for (let i = 0; i < skillRows.length; i += BATCH) {
      const { error: insertErr } = await supabase
        .from('skills')
        .insert(skillRows.slice(i, i + BATCH))
      if (insertErr) {
        console.error(`insert error at offset ${i}:`, insertErr.message)
        process.exit(1)
      }
    }

    const { count, error: countErr } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('curriculum_id', curriculum_id)

    if (countErr) {
      console.error('count query failed:', countErr.message)
      process.exit(1)
    }

    if (count === curriculum.expectedCount) {
      console.log(`✓ ${count}/${curriculum.expectedCount} skills`)
    } else {
      console.error(`✗ count mismatch: got ${count}, expected ${curriculum.expectedCount}`)
      allPassed = false
    }
  }

  // Global: no null curriculum_id
  const { count: nullCount, error: nullErr } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true })
    .is('curriculum_id', null)

  if (nullErr) {
    console.error('null check failed:', nullErr.message)
    process.exit(1)
  }

  if (nullCount === 0) {
    console.log('\n✓ No skills with null curriculum_id')
  } else {
    console.error(`\n✗ ${nullCount} skills have null curriculum_id`)
    allPassed = false
  }

  if (allPassed) {
    console.log('\n✓ Import complete.')
  } else {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
