const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const getRuntimeOrigin = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.location?.origin || ''
}

const isLocalhostUrl = (value) => {
  try {
    const url = new URL(value)
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  } catch {
    return false
  }
}

const isRuntimeLocalhost = () => {
  const runtimeOrigin = getRuntimeOrigin()
  return runtimeOrigin ? isLocalhostUrl(runtimeOrigin) : false
}

export const normalizeApiBaseUrl = () => {
  const configuredBaseUrl = API_BASE_URL.trim().replace(/\/+$/g, '')

  if (configuredBaseUrl && isLocalhostUrl(configuredBaseUrl) && !isRuntimeLocalhost()) {
    return ''
  }

  return configuredBaseUrl
}

export const buildApiUrl = (path) => {
  const base = normalizeApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Support both styles:
  // - VITE_API_URL=http://localhost:3000
  // - VITE_API_URL=http://localhost:3000/api
  if (base.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${base}${normalizedPath.slice(4)}`
  }

  return base ? `${base}${normalizedPath}` : normalizedPath
}

const toFriendlyNetworkError = (error) => {
  if (error instanceof TypeError) {
    return new Error(
      'Khong the ket noi backend. Kiem tra backend dang chay va cau hinh CORS.',
    )
  }

  return error instanceof Error
    ? error
    : new Error('Da xay ra loi khi goi API.')
}

const parseErrorMessage = async (response) => {
  try {
    const payload = await response.json()

    if (
      payload &&
      typeof payload.message === 'string' &&
      payload.message.trim()
    ) {
      return payload.message
    }
  } catch {
    // ignore JSON parse errors
  }

  return `Yeu cau API that bai voi ma ${response.status}.`
}

export const fetchTransactions = async () => {
  try {
    const response = await fetch(buildApiUrl('/api/transactions'))

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response))
    }

    const payload = await response.json()

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    throw toFriendlyNetworkError(error)
  }
}

export const addTransaction = async (transaction) => {
  try {
    const response = await fetch(buildApiUrl('/api/transactions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    })

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response))
    }

    return response.json()
  } catch (error) {
    throw toFriendlyNetworkError(error)
  }
}
