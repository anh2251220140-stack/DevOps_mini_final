import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ENV_FILE_PATHS = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
]

const parseEnvFile = (fileContent) =>
  fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .reduce((accumulator, line) => {
      const separatorIndex = line.indexOf('=')

      if (separatorIndex === -1) {
        return accumulator
      }

      const key = line.slice(0, separatorIndex).trim()
      const rawValue = line.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^['"]|['"]$/g, '')

      if (key && !(key in process.env)) {
        process.env[key] = value
      }

      return accumulator
    }, {})

for (const envFilePath of ENV_FILE_PATHS) {
  if (existsSync(envFilePath)) {
    parseEnvFile(readFileSync(envFilePath, 'utf8'))
  }
}

const normalizePort = (value, fallback) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const config = {
  port: normalizePort(process.env.PORT, 3000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseTable: process.env.SUPABASE_TABLE || 'transactions',
  supabaseTaskTable: process.env.SUPABASE_TASK_TABLE || 'tasks',
}

export const isSupabaseConfigured = Boolean(
  config.supabaseUrl &&
    (config.supabaseServiceRoleKey || config.supabaseAnonKey),
)
