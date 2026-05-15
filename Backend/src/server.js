import http from 'node:http'
import { randomUUID } from 'node:crypto'

import { config, isSupabaseConfigured } from './config.js'
import { logError, logInfo } from './logger.js'
import {
  checkSupabaseConnection,
  fetchTransactionsFromSupabase,
  insertTransactionToSupabase,
  fetchTasksFromSupabase,
  insertTaskToSupabase,
} from './supabase.js'

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
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

const createCorsHeaders = (requestOrigin) => ({
  'Access-Control-Allow-Origin': getAllowedCorsOrigin(requestOrigin),
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
})

const sendJson = (response, statusCode, payload, requestOrigin) => {
  response.writeHead(statusCode, {
    ...jsonHeaders,
    ...createCorsHeaders(requestOrigin),
  })
  response.end(JSON.stringify(payload))
}

const notFound = (response, requestOrigin) => {
  sendJson(response, 404, {
    message: 'Route khong ton tai.',
  }, requestOrigin)
}

const readJsonBody = async (request) =>
  new Promise((resolve, reject) => {
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
        reject(new ApiError(400, 'Body JSON khong hop le.'))
      }
    })

    request.on('error', reject)
  })

const validateTransactionPayload = (payload) => {
  const title = typeof payload.title === 'string' ? payload.title.trim() : ''
  const category =
    typeof payload.category === 'string' && payload.category.trim()
      ? payload.category.trim()
      : 'Khac'
  const date = typeof payload.date === 'string' ? payload.date.trim() : ''
  const amount = Number(payload.amount)

  if (!title) {
    throw new ApiError(400, 'Truong title la bat buoc.')
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'Truong amount phai la so lon hon 0.')
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, 'Truong date phai co dinh dang YYYY-MM-DD.')
  }

  return {
    title,
    amount,
    category,
    date,
  }
}

const handleHealthCheck = async (response, requestOrigin) => {
  const supabase = {
    configured: isSupabaseConfigured(),
    connected: false,
  }

  if (isSupabaseConfigured()) {
    try {
      await checkSupabaseConnection()
      supabase.connected = true
    } catch (error) {
      logError('Khong the ket noi Supabase trong health check.', error)
    }
  }

  sendJson(response, 200, {
    status: 'ok',
    service: 'expense-manager-backend',
    timestamp: new Date().toISOString(),
    supabase,
  }, requestOrigin)
}

const server = http.createServer(async (request, response) => {
  const requestId = randomUUID()
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host}`)
  const requestOrigin = request.headers.origin

  if (request.method === 'OPTIONS') {
    response.writeHead(204, createCorsHeaders(requestOrigin))
    response.end()
    return
  }

  try {
    if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
      await handleHealthCheck(response, requestOrigin)
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/transactions') {
      const transactions = await fetchTransactionsFromSupabase()
      sendJson(response, 200, transactions, requestOrigin)
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/tasks') {
      const tasks = await fetchTasksFromSupabase()
      sendJson(response, 200, tasks, requestOrigin)
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/transactions') {
      const rawPayload = await readJsonBody(request)
      const validatedPayload = validateTransactionPayload(rawPayload)
      const createdTransaction = await insertTransactionToSupabase(validatedPayload)

      try {
        await insertTaskToSupabase({
          description: `Đã tạo giao dịch "${createdTransaction.title}" (${createdTransaction.category}) trị giá ${createdTransaction.amount}`,
          category: 'transaction',
          metadata: { transactionId: createdTransaction.id },
        })
      } catch (taskError) {
        logError('Không thể lưu task thao tác người dùng.', taskError, {
          transactionId: createdTransaction.id,
        })
      }

      sendJson(response, 201, createdTransaction, requestOrigin)
      return
    }

    notFound(response, requestOrigin)
  } catch (error) {
    logError('API request failed.', error, {
      requestId,
      method: request.method,
      path: requestUrl.pathname,
    })

    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Da xay ra loi khong xac dinh.'

    const statusCode = error instanceof ApiError ? error.statusCode : 500
    sendJson(response, statusCode, {
      message,
      requestId,
    }, requestOrigin)
  }
})
// Backend service updated
server.listen(config.port, () => {
  logInfo('Backend server started.', {
    port: config.port,
    corsOrigin: config.corsOrigin,
  })
})
