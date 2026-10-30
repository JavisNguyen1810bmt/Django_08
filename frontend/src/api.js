const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api')
  .replace(/\/+$/, '')
  .replace(/\/models$/, '')

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiRequest(path, { token, ...options } = {}) {
  const send = (accessToken) => {
    const headers = new Headers(options.headers || {})
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
    if (!(options.body instanceof FormData) && options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }
    return fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  }

  let response = await send(localStorage.getItem('accessToken') || token)
  if (response.status === 401 && (localStorage.getItem('accessToken') || token)) {
    const refresh = localStorage.getItem('refreshToken')
    if (refresh) {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json()
        localStorage.setItem('accessToken', refreshed.access)
        response = await send(refreshed.access)
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
  }
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = data?.detail || data?.error || Object.values(data || {}).flat().join(' ') ||
      `Yêu cầu thất bại (${response.status})`
    throw new ApiError(message, response.status, data)
  }

  return data
}

export function getApiBaseUrl() {
  return API_BASE_URL
}

export function purchaseProduct(productId, token) {
  return apiRequest('/payments/checkout/', {
    method: 'POST',
    token,
    body: JSON.stringify({ product_ids: [productId] }),
  })
}

export function downloadProduct(productId, token) {
  return apiRequest(`/downloads/${productId}/`, { token })
}

export function getWallet(token) {
  return apiRequest('/payments/wallet/', { token })
}

export function buffWalletBalance({ username, amount }, token) {
  return apiRequest('/payments/admin-buff-balance/', {
    method: 'POST',
    token,
    body: JSON.stringify({ username, amount }),
  })
}
