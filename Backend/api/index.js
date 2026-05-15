import { config, isSupabaseConfigured } from '../src/config.js'
import { logError, logInfo } from '../src/logger.js'
import {
  checkSupabaseConnection,
  fetchTransactionsFromSupabase,
  insertTransactionToSupabase,
  fetchTasksFromSupabase,
  insertTaskToSupabase,
} from '../src/supabase.js'

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
}

const getRequestPath = (request) => {
  const rawUrl = request.url || '/'

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    try {
      return new URL(rawUrl).pathname
    } catch {
      return rawUrl
    }
  }

  return rawUrl.split('?')[0]
}

const getAllowedCorsOrigin = (requestOrigin) => {
  if (config.corsOrigins.includes('*')) {
    return '*'
  }

  if (requestOrigin && config.corsOrigins.includes(requestOrigin)) {
    return requestOrigin
  }

  if (requestOrigin) {
    try {
      const { hostname } = new URL(requestOrigin)

      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.endsWith('.vercel.app')
      ) {
        return requestOrigin
      }
    } catch {
      // Fall back to configured origin below.
    }
  }

  return config.corsOrigins[0] || config.corsOrigin
}

const createCorsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': getAllowedCorsOrigin(origin),
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
})

const sendJson = (response, statusCode, payload, origin) => {
  response.statusCode = statusCode
  Object.entries({
    ...jsonHeaders,
    ...createCorsHeaders(origin),
  }).forEach(([key, value]) => {
    response.setHeader(key, value)
  })
  response.end(JSON.stringify(payload))
}

const readJsonBody = async (request) => {
  return new Promise((resolve) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body.trim()) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        resolve({})
      }
    })
  })
}

const parseDate = (input) => {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return null
  }
  const [year, month, day] = input.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? input
    : null
}

const parseAmount = (input) => {
  const amount = Number(input)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

const getErrorMessage = (error, fallback) =>
  error instanceof Error && error.message ? error.message : fallback

export default async function handler(request, response) {
  try {
    const requestPath = getRequestPath(request)

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return sendJson(response, 200, {}, request.headers.origin)
    }

    // Health check endpoint
    if (
      (requestPath === '/health' || requestPath === '/api/health') &&
      request.method === 'GET'
    ) {
      logInfo('Health check requested')
      const supabase = {
        configured: isSupabaseConfigured(),
        connected: false,
        error: null,
      }

      if (supabase.configured) {
        try {
          await checkSupabaseConnection()
          supabase.connected = true
        } catch (error) {
          supabase.error = getErrorMessage(error, 'Supabase health check failed')
          logError('Supabase health check failed', error)
        }
      }

      return sendJson(
        response,
        200,
        {
          status: 'ok',
          service: 'expense-manager-backend',
          supabase,
        },
        request.headers.origin,
      )
    }

  // API endpoints
    if (requestPath.startsWith('/api/')) {
      if (!isSupabaseConfigured()) {
        logError('Supabase not configured')
        return sendJson(
          response,
          503,
          { message: 'Service unavailable: Supabase not configured' },
          request.headers.origin
        )
      }

    // GET /api/transactions
    if (requestPath === '/api/transactions' && request.method === 'GET') {
      try {
        const transactions = await fetchTransactionsFromSupabase()
        return sendJson(response, 200, transactions, request.headers.origin)
      } catch (error) {
        logError('Failed to fetch transactions', error)
        return sendJson(
          response,
          500,
          { message: getErrorMessage(error, 'Failed to fetch transactions') },
          request.headers.origin
        )
      }
    }

    // POST /api/transactions
    if (requestPath === '/api/transactions' && request.method === 'POST') {
      try {
        const body = await readJsonBody(request)
        const { title, amount, category, date } = body

        const validDate = parseDate(date)
        if (!validDate) {
          return sendJson(
            response,
            400,
            { message: 'Invalid or missing date (format: YYYY-MM-DD)' },
            request.headers.origin
          )
        }

        const validAmount = parseAmount(amount)
        if (!validAmount) {
          return sendJson(
            response,
            400,
            { message: 'Invalid or missing amount' },
            request.headers.origin
          )
        }

        if (!title || typeof title !== 'string' || !title.trim()) {
          return sendJson(
            response,
            400,
            { message: 'Title is required' },
            request.headers.origin
          )
        }

        const transaction = await insertTransactionToSupabase({
          title: title.trim(),
          amount: validAmount,
          category: category || 'Khác',
          date: validDate,
        })

        return sendJson(response, 201, transaction, request.headers.origin)
      } catch (error) {
        logError('Failed to create transaction', error)
        return sendJson(
          response,
          500,
          { message: getErrorMessage(error, 'Failed to create transaction') },
          request.headers.origin
        )
      }
    }

    // GET /api/tasks
    if (requestPath === '/api/tasks' && request.method === 'GET') {
      try {
        const tasks = await fetchTasksFromSupabase()
        return sendJson(response, 200, tasks, request.headers.origin)
      } catch (error) {
        logError('Failed to fetch tasks', error)
        return sendJson(
          response,
          500,
          { message: getErrorMessage(error, 'Failed to fetch tasks') },
          request.headers.origin
        )
      }
    }

    // POST /api/tasks
    if (requestPath === '/api/tasks' && request.method === 'POST') {
      try {
        const body = await readJsonBody(request)
        const { title, description } = body

        if (!title || typeof title !== 'string' || !title.trim()) {
          return sendJson(
            response,
            400,
            { message: 'Title is required' },
            request.headers.origin
          )
        }

        const task = await insertTaskToSupabase({
          title: title.trim(),
          description: description || '',
        })

        return sendJson(response, 201, task, request.headers.origin)
      } catch (error) {
        logError('Failed to create task', error)
        return sendJson(
          response,
          500,
          { message: getErrorMessage(error, 'Failed to create task') },
          request.headers.origin
        )
      }
    }
    }

    // Not found
    return sendJson(
      response,
      404,
      { message: 'Route not found' },
      request.headers.origin
    )
  } catch (error) {
    logError('Unhandled Vercel API error', error)
    return sendJson(
      response,
      500,
      { message: getErrorMessage(error, 'Unhandled Vercel API error') },
      request.headers.origin
    )
  }
}
