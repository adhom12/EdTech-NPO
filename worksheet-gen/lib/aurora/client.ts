import { Signer } from '@aws-sdk/rds-signer'
import postgres, { type Sql } from 'postgres'

// Cached connection per serverless instance lifetime.
// Token expires after 15 min — for serverless this is fine since
// cold starts are frequent enough that stale tokens are rarely an issue.
let _sql: Sql | null = null

async function getToken(): Promise<string> {
  const signer = new Signer({
    hostname: process.env.AURORA_PGHOST!,
    port: Number(process.env.AURORA_PGPORT ?? 5432),
    region: process.env.AURORA_AWS_REGION!,
    username: process.env.AURORA_PGUSER!,
  })
  return signer.getAuthToken()
}

export async function getDb(): Promise<Sql> {
  if (_sql) return _sql

  const token = await getToken()

  _sql = postgres({
    host: process.env.AURORA_PGHOST!,
    port: Number(process.env.AURORA_PGPORT ?? 5432),
    database: process.env.AURORA_PGDATABASE!,
    username: process.env.AURORA_PGUSER!,
    password: token,
    ssl: 'require',
    max: 3,
    idle_timeout: 20,
  })

  return _sql
}
