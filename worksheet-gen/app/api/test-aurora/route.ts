// TEMPORARY — delete after Phase 1 connectivity is verified
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/aurora/client'

export async function GET() {
  try {
    const sql = await getDb()
    const [ver] = await sql`SELECT version()`
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    return NextResponse.json({
      ok: true,
      version: ver.version,
      tables: tables.map((t) => (t as { table_name: string }).table_name),
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: String(err),
      diagnostics: {
        hasOidcToken: !!process.env.VERCEL_OIDC_TOKEN,
        hasRoleArn: !!process.env.AURORA_AWS_ROLE_ARN,
        hasHost: !!process.env.AURORA_PGHOST,
        hasRegion: !!process.env.AURORA_AWS_REGION,
        hasUser: !!process.env.AURORA_PGUSER,
        hasDatabase: !!process.env.AURORA_PGDATABASE,
      },
    }, { status: 500 })
  }
}
