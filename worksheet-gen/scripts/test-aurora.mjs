// Run: node scripts/test-aurora.mjs
// Requires: AURORA_DATABASE_URL set in your environment (or .env.local loaded manually)
// Install dep if needed: npm install postgres

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local manually (Next.js doesn't load it for plain node scripts)
try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local not found — rely on env vars already set
}

const url = process.env.AURORA_DATABASE_URL
if (!url) {
  console.error('ERROR: AURORA_DATABASE_URL is not set.')
  console.error('Add it to worksheet-gen/.env.local or export it in your shell.')
  process.exit(1)
}

const { default: postgres } = await import('postgres')
const sql = postgres(url, { ssl: 'require', max: 1 })

try {
  const [version] = await sql`SELECT version()`
  console.log('✓ Connected to Aurora:', version.version)

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `
  if (tables.length === 0) {
    console.log('  No tables found yet — schema not applied.')
  } else {
    console.log('  Tables:', tables.map(t => t.table_name).join(', '))
  }

  console.log('\n✓ Aurora connectivity verified.')
} catch (err) {
  console.error('✗ Connection failed:', err.message)
  process.exit(1)
} finally {
  await sql.end()
}
