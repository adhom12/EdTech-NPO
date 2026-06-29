import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { Signer } from '@aws-sdk/rds-signer'
import postgres, { type Sql } from 'postgres'

let _sql: Sql | null = null

async function getAuroraToken(): Promise<string> {
  const signer = new Signer({
    hostname: process.env.AURORA_PGHOST!,
    port: Number(process.env.AURORA_PGPORT ?? 5432),
    region: process.env.AURORA_AWS_REGION!,
    username: process.env.AURORA_PGUSER!,
    credentials: awsCredentialsProvider({
      roleArn: process.env.AURORA_AWS_ROLE_ARN!,
    }),
  })
  return signer.getAuthToken()
}

export async function getDb(): Promise<Sql> {
  if (_sql) return _sql

  const token = await getAuroraToken()

  _sql = postgres({
    host: process.env.AURORA_PGHOST!,
    port: Number(process.env.AURORA_PGPORT ?? 5432),
    database: process.env.AURORA_PGDATABASE!,
    username: process.env.AURORA_PGUSER!,
    password: token,
    ssl: 'require',
    max: 3,
    idle_timeout: 20,
    fetch_types: false, // skip OID type-fetching round-trip on connect
    connect_timeout: 15,
  })

  return _sql
}
