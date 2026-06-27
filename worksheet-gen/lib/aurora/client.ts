import { STSClient, AssumeRoleWithWebIdentityCommand } from '@aws-sdk/client-sts'
import { Signer } from '@aws-sdk/rds-signer'
import postgres, { type Sql } from 'postgres'

let _sql: Sql | null = null

async function getAuroraToken(): Promise<string> {
  const oidcToken = process.env.VERCEL_OIDC_TOKEN
  if (!oidcToken) {
    throw new Error('VERCEL_OIDC_TOKEN not set — go to Vercel Settings → Security → enable OIDC Federation')
  }

  // AssumeRoleWithWebIdentity is an unsigned AWS API — no AWS credentials required.
  // Dummy values prevent the SDK from throwing during credential resolution.
  const sts = new STSClient({
    region: process.env.AURORA_AWS_REGION!,
    credentials: { accessKeyId: 'none', secretAccessKey: 'none' },
  })

  const { Credentials } = await sts.send(
    new AssumeRoleWithWebIdentityCommand({
      RoleArn: process.env.AURORA_AWS_ROLE_ARN!,
      WebIdentityToken: oidcToken,
      RoleSessionName: 'worksheet-gen',
    })
  )

  if (!Credentials?.AccessKeyId || !Credentials?.SecretAccessKey) {
    throw new Error('STS returned no credentials')
  }

  const signer = new Signer({
    hostname: process.env.AURORA_PGHOST!,
    port: Number(process.env.AURORA_PGPORT ?? 5432),
    region: process.env.AURORA_AWS_REGION!,
    username: process.env.AURORA_PGUSER!,
    credentials: {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
    },
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
  })

  return _sql
}
