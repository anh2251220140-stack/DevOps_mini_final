import { config, isSupabaseConfigured } from './config.js'

const normalizeUrl = (value) => value.replace(/\/$/, '')

const getSupabaseToken = () =>
  config.supabaseServiceRoleKey || config.supabaseAnonKey

const createSupabaseHeaders = (extraHeaders = {}) => ({
  apikey: getSupabaseToken(),
  Authorization: `Bearer ${getSupabaseToken()}`,
  ...extraHeaders,
})

const ensureSupabaseConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Chua cau hinh SUPABASE_URL va SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY trong Backend/.env.',
    )
  }
}

const mapTransactionFromSupabase = (row) => ({
  id: row.id,
  title: row.title,
  amount: Number(row.amount),
  category: row.category,
  date: row.transaction_date,
  createdAt: row.created_at,
})

const mapTaskFromSupabase = (row) => ({
  id: row.id,
  description: row.description,
  category: row.category,
  metadata: row.metadata,
  createdAt: row.created_at,
})

export const checkSupabaseConnection = async () => {
  ensureSupabaseConfigured()

  const endpoint = `${normalizeUrl(config.supabaseUrl)}/rest/v1/${config.supabaseTable}?select=id&limit=1`
  const response = await fetch(endpoint, {
    headers: createSupabaseHeaders(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase health check failed: ${response.status} ${errorText}`)
  }

  return true
}

export const fetchTransactionsFromSupabase = async () => {
  ensureSupabaseConfigured()

  const endpoint =
    `${normalizeUrl(config.supabaseUrl)}/rest/v1/${config.supabaseTable}` +
    '?select=*&order=transaction_date.desc,created_at.desc,id.desc'

  const response = await fetch(endpoint, {
    headers: createSupabaseHeaders(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase GET failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map(mapTransactionFromSupabase) : []
}

export const fetchTasksFromSupabase = async () => {
  ensureSupabaseConfigured()

  const endpoint =
    `${normalizeUrl(config.supabaseUrl)}/rest/v1/${config.supabaseTaskTable}` +
    '?select=*&order=created_at.desc,id.desc'

  const response = await fetch(endpoint, {
    headers: createSupabaseHeaders(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase tasks GET failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? data.map(mapTaskFromSupabase) : []
}

export const insertTaskToSupabase = async (payload) => {
  ensureSupabaseConfigured()

  const endpoint = `${normalizeUrl(config.supabaseUrl)}/rest/v1/${config.supabaseTaskTable}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: createSupabaseHeaders({
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({
      description: payload.description,
      category: payload.category || 'general',
      metadata: payload.metadata || null,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase task POST failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const [createdRow] = Array.isArray(data) ? data : []

  if (!createdRow) {
    throw new Error('Supabase khong tra ve task vua tao.')
  }

  return mapTaskFromSupabase(createdRow)
}

export const insertTransactionToSupabase = async (payload) => {
  ensureSupabaseConfigured()

  const endpoint = `${normalizeUrl(config.supabaseUrl)}/rest/v1/${config.supabaseTable}`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: createSupabaseHeaders({
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({
      title: payload.title,
      amount: payload.amount,
      category: payload.category,
      transaction_date: payload.date,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase POST failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const [createdRow] = Array.isArray(data) ? data : []

  if (!createdRow) {
    throw new Error('Supabase khong tra ve giao dich vua tao.')
  }

  return mapTransactionFromSupabase(createdRow)
}
