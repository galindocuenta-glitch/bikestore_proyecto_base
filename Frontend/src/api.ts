const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

interface ApiErrorResponse {
  error?: string
  errors?: Record<string, string>
}

export class ApiRequestError extends Error {
  constructor(message: string, public fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export async function apiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      credentials: 'include',
      headers: {
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiRequestError('No se pudo conectar con el servidor. Verifica que la API esté activa y vuelve a intentar.')
    }
    throw error
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null
    const message = errorPayload?.error ?? Object.values(errorPayload?.errors ?? {})[0] ?? `Error del servidor (${response.status}).`
    throw new ApiRequestError(message, errorPayload?.errors)
  }
  return payload as T
}
