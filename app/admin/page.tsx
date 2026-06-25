"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BriefcaseBusiness, LogOut, ShieldCheck, UserCog } from "lucide-react"

import type { AuthResponse } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resolverRutaPerfil } from "@/lib/session"

const SESSION_KEY = "pala-auth-session"

export default function AdminHomePage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)

  useEffect(() => {
    const sessionRaw = window.localStorage.getItem(SESSION_KEY)
    if (!sessionRaw) {
      router.replace("/login")
      return
    }

    try {
      const parsed = JSON.parse(sessionRaw) as AuthResponse
      const esAdministrador = parsed.roles.some((role) => role.toUpperCase() === "ADMINISTRADOR")

      if (!esAdministrador) {
        router.replace("/login")
        return
      }

      if (!parsed.perfilCompleto && parsed.perfilPendiente === "ADMINISTRADOR") {
        router.replace("/admin/perfil-inicial")
        return
      }

      setSession(parsed)
    } catch {
      window.localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
    }
  }, [router])

  const handleLogout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    router.replace("/login")
  }

  if (!session) {
    return null
  }

  const puedeVerAvisos = session.permisos.includes("VER_AVISOS")
  const rutaPerfil = resolverRutaPerfil(session)

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <div className="relative mx-auto flex min-h-[calc(100vh-0.375rem)] max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/15 via-fuchsia-400/10 to-transparent blur-3xl" />

        <header className="relative flex items-center justify-between gap-4 rounded-[2rem] border border-indigo-100 bg-card px-8 py-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-indigo-600">Administrador PALA</p>
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Panel principal
            </h1>
            <p className="text-sm text-muted-foreground">{session.mailUsuario}</p>
          </div>
          <div className="flex items-center gap-3">
            {rutaPerfil && (
              <Link href={rutaPerfil}>
                <Button variant="outline" className="gap-2">
                  <UserCog className="h-4 w-4" />
                  Mi perfil
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        <section className="relative grid gap-6 md:grid-cols-2">
          <Card className="rounded-[2rem] border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <UserCog className="h-4 w-4" />
                </span>
                Estado de sesión
              </CardTitle>
              <CardDescription>Resumen del usuario autenticado contra el subsistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Usuario seguridad ID: {session.usuarioId ?? "sin dato"}</p>
              <p>Roles: {session.roles.join(", ") || "sin roles"}</p>
              <p>Permisos: {session.permisos.join(", ") || "sin permisos"}</p>
              <p>Perfil completo: {session.perfilCompleto ? "sí" : "no"}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-violet-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <BriefcaseBusiness className="h-4 w-4" />
                </span>
                Acciones disponibles
              </CardTitle>
              <CardDescription>Primer destino del administrador dentro de PALA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {puedeVerAvisos ? (
                <Link
                  href="/avisos"
                  className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:bg-indigo-50"
                >
                  <span>Ver avisos</span>
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                  Este administrador no tiene `VER_AVISOS`. Si querés que entre al flujo de avisos, asignale ese permiso en el subsistema.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
