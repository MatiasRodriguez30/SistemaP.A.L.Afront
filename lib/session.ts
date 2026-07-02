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

export function saveSession(session: AuthResponse) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

function normalizeAccessToken(token: string): string {
  return token.replace(/^Bearer\s+/i, "").trim()
}

export function authHeader(session: AuthResponse): Record<string, string> {
  if (!session.token) return {}
  return { Authorization: `Bearer ${normalizeAccessToken(session.token)}` }
}

export function resolverRutaPerfil(session: AuthResponse | null): "/perfil" | "/admin/perfil" | null {
  if (!session) return null
  if (session.permisos.includes("VER_PERFIL_POSTULANTE")) return "/perfil"
  if (session.permisos.includes("VER_PERFIL_ADMINISTRADOR")) return "/admin/perfil"
  return null
}
