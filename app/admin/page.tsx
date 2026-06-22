"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BriefcaseBusiness, LogOut, ShieldCheck, UserCog } from "lucide-react"

import type { AuthResponse } from "@/types/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(24,58,90,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200/80 bg-white/90 px-8 py-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Administrador PALA</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Panel principal</h1>
            <p className="text-sm text-slate-600">{session.mailUsuario}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-[2rem] border-slate-200/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Estado de sesión
              </CardTitle>
              <CardDescription>Resumen del usuario autenticado contra el subsistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p>Usuario seguridad ID: {session.usuarioId ?? "sin dato"}</p>
              <p>Roles: {session.roles.join(", ") || "sin roles"}</p>
              <p>Permisos: {session.permisos.join(", ") || "sin permisos"}</p>
              <p>Perfil completo: {session.perfilCompleto ? "sí" : "no"}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5" />
                Acciones disponibles
              </CardTitle>
              <CardDescription>Primer destino del administrador dentro de PALA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {puedeVerAvisos ? (
                <Link
                  href="/"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                >
                  <span>Ver avisos</span>
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-600">
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
