const API_BASE_URL = import.meta.env.VITE_API_URL

const normalizeBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('Thiếu VITE_API_URL trong file .env.')
  }

  return API_BASE_URL.replace(/\/+$/g, '')
}

const buildUrl = (path) => {
  const base = normalizeBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Support both styles:
  // - VITE_API_URL=http://localhost:3000
  // - VITE_API_URL=http://localhost:3000/api
  if (base.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${base}${normalizedPath.slice(4)}`
  }

  return `${base}${normalizedPath}`
}

const toFriendlyNetworkError = (error) => {
  if (error instanceof TypeError) {
    return new Error(
      'Không thể kết nối backend. Kiểm tra VITE_API_URL, backend đang chạy và CORS.',
    )
  }

  return error instanceof Error
    ? error
    : new Error('Đã xảy ra lỗi khi gọi API.')
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

  return `Yêu cầu API thất bại với mã ${response.status}.`
}

export const fetchTransactions = async () => {
  try {
    const response = await fetch(
      buildUrl('/api/transactions')
    )

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response))
    }

    const payload = await response.json()

    return Array.isArray(payload) ? payload : []
  } catch (error) {
    throw toFriendlyNetworkError(error)
  }
}
// Frontend service updated
export const addTransaction = async (transaction) => {
  try {
    const response = await fetch(
      buildUrl('/api/transactions'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      },
    )

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response))
    }

    return response.json()
  } catch (error) {
    throw toFriendlyNetworkError(error)
  }
}
