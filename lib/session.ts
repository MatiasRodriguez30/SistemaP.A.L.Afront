import type { AuthResponse } from "@/types/auth"

const SESSION_KEY = "pala-auth-session"

export function getSession(): AuthResponse | null {
  if (typeof window === "undefined") return null

  const raw = window.localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthResponse
  } catch {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

export function authHeader(session: AuthResponse): Record<string, string> {
  if (!session.token) return {}
  return { Authorization: `${session.tipo} ${session.token}` }
}
