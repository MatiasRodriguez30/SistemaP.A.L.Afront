"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import type { AuthResponse } from "@/types/auth"
import type { AdministradorPerfil } from "@/types/administrador"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authHeader, clearSession, getSession } from "@/lib/session"

export default function AdminPerfilPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [perfil, setPerfil] = useState<AdministradorPerfil | null>(null)
  const [nombreAdministrador, setNombreAdministrador] = useState("")
  const [apellidoAdministrador, setApellidoAdministrador] = useState("")
  const [cargando, setCargando] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const currentSession = getSession()
    if (!currentSession || !currentSession.permisos.includes("VER_PERFIL_ADMINISTRADOR")) {
      router.replace("/login")
      return
    }
    setSession(currentSession)

    fetch("/api/pala/administrador/me", { headers: authHeader(currentSession) })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          router.replace("/login")
          return
        }
        if (!response.ok) throw new Error("No se pudo cargar el perfil")

        const body = (await response.json()) as AdministradorPerfil
        setPerfil(body)
        setNombreAdministrador(body.nombreAdministrador)
        setApellidoAdministrador(body.apellidoAdministrador)
      })
      .catch(() => setErrorMessage("No se pudo cargar el perfil. Intente nuevamente más tarde."))
      .finally(() => setCargando(false))
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/pala/administrador/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify({ nombreAdministrador, apellidoAdministrador }),
      })

      if (response.status === 401) {
        clearSession()
        router.replace("/login")
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudo actualizar el perfil")
      }

      setPerfil(body as AdministradorPerfil)
      setSuccessMessage("Perfil actualizado correctamente.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar el perfil")
    } finally {
      setSubmitting(false)
    }
  }

  if (cargando || !perfil) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando perfil...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <div className="relative mx-auto flex min-h-[calc(100vh-0.375rem)] max-w-3xl flex-col gap-6 px-6 py-10 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/15 blur-3xl" />

        <Link href="/admin" className="relative flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <Card className="relative rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-100/60">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Mi perfil
            </CardTitle>
            <CardDescription className="text-base leading-6 text-muted-foreground">
              Tu nombre y apellido se pueden editar. El legajo y el mail son inmutables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertTitle>No se pudo completar la operación</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-950">
                <AlertTitle>Listo</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="admin-nombre">Nombre</Label>
                <Input id="admin-nombre" className="h-11" value={nombreAdministrador} onChange={(e) => setNombreAdministrador(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-apellido">Apellido</Label>
                <Input id="admin-apellido" className="h-11" value={apellidoAdministrador} onChange={(e) => setApellidoAdministrador(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-legajo">Legajo</Label>
                <Input id="admin-legajo" className="h-11" value={perfil.legajoAdministrador} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-mail">Mail</Label>
                <Input id="admin-mail" className="h-11" value={perfil.mailAdministrador} disabled />
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                >
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
