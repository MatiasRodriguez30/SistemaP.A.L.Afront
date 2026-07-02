"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { AuthResponse, ErrorResponse } from "@/types/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authHeader } from "@/lib/session"

const SESSION_KEY = "pala-auth-session"

export default function AdminPerfilInicialPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [nombreAdministrador, setNombreAdministrador] = useState("")
  const [apellidoAdministrador, setApellidoAdministrador] = useState("")
  const [legajoAdministrador, setLegajoAdministrador] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

      if (parsed.perfilCompleto || parsed.perfilPendiente !== "ADMINISTRADOR") {
        router.replace("/admin")
        return
      }

      setSession(parsed)
    } catch {
      window.localStorage.removeItem(SESSION_KEY)
      router.replace("/login")
    }
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session?.token) {
      setErrorMessage("No se encontró el token de sesión para completar el perfil.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/pala/auth/perfil-inicial", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(session),
        },
        body: JSON.stringify({
          administrador: {
            nombreAdministrador,
            apellidoAdministrador,
            legajoAdministrador: Number(legajoAdministrador),
          },
        }),
      })

      const body = (await response.json()) as AuthResponse | ErrorResponse
      if (!response.ok) {
        throw new Error("mensaje" in body && body.mensaje ? body.mensaje : "No se pudo completar el perfil inicial del administrador")
      }

      window.localStorage.setItem(SESSION_KEY, JSON.stringify(body))
      router.replace("/admin")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar el perfil inicial del administrador")
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(24,58,90,0.08),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-10">
        <Card className="w-full rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">Perfil inicial de administrador</CardTitle>
            <CardDescription className="text-base leading-6 text-slate-600">
              Tu cuenta ya está autenticada en seguridad. Falta completar el perfil local de PALA para entrar al panel principal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>No se pudo completar el perfil</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Mail autenticado: {session.mailUsuario}
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="admin-nombre">Nombre</Label>
                <Input id="admin-nombre" value={nombreAdministrador} onChange={(event) => setNombreAdministrador(event.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-apellido">Apellido</Label>
                <Input id="admin-apellido" value={apellidoAdministrador} onChange={(event) => setApellidoAdministrador(event.target.value)} required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="admin-legajo">Legajo</Label>
                <Input
                  id="admin-legajo"
                  inputMode="numeric"
                  value={legajoAdministrador}
                  onChange={(event) => setLegajoAdministrador(event.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={submitting} className="h-11 w-full rounded-xl">
                  {submitting ? "Guardando..." : "Continuar al panel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
