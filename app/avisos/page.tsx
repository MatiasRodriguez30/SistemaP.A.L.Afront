"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AvisoCard } from "@/components/aviso-card"
import { AvisoDetalle } from "@/components/aviso-detalle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Aviso, AvisoDetalleApi, AvisoResumenApi } from "@/types/avisos"
import { mapAvisoDetalle, mapAvisoResumen } from "@/lib/avisos-mapper"
import { authHeader, clearSession, getSession, resolverRutaPerfil } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"

type Vista = "lista" | "detalle" | "salir"

export default function VerAvisosPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [vista, setVista] = useState<Vista>("lista")
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [avisoActual, setAvisoActual] = useState<Aviso | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensajeSalida, setMensajeSalida] = useState<string | null>(null)
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null)

  useEffect(() => {
    const currentSession = getSession()
    if (!currentSession || !currentSession.permisos.includes("VER_AVISOS")) {
      router.replace("/login")
      return
    }
    setSession(currentSession)

    fetch("/api/pala/avisos", { headers: authHeader(currentSession) })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          router.replace("/login")
          return
        }
        if (!response.ok) throw new Error("No se pudieron cargar los avisos")

        const body = (await response.json()) as AvisoResumenApi[]
        setAvisos(body.map(mapAvisoResumen))
      })
      .catch(() => setError("No se pudieron cargar los avisos. Intente nuevamente más tarde."))
      .finally(() => setCargando(false))
  }, [router])

  const puedeSolicitarAsociacion = Boolean(session?.permisos.includes("SOLICITAR_ASOCIACION_RECLUTADOR"))

  const handleSeleccionarAviso = async (nroAviso: number) => {
    const session = getSession()
    if (!session) {
      router.replace("/login")
      return
    }

    try {
      const response = await fetch(`/api/pala/avisos/${nroAviso}`, { headers: authHeader(session) })
      if (response.status === 401) {
        clearSession()
        router.replace("/login")
        return
      }
      if (!response.ok) throw new Error("No se pudo cargar el detalle del aviso")

      const body = (await response.json()) as AvisoDetalleApi
      setAvisoActual(mapAvisoDetalle(body))
      setVista("detalle")
      setError(null)
    } catch {
      setError("No se pudo cargar el detalle del aviso.")
    }
  }

  const handleRegresar = () => {
    setVista("lista")
    setAvisoActual(null)
  }

  const handlePostular = () => {
    // El backend todavia no expone PostulacionController; el boton queda deshabilitado.
  }

  const handlePrimaryAction = () => {
    if (puedeSolicitarAsociacion) {
      router.push("/solicitar-asociacion")
      return
    }
    handlePostular()
  }

  const handleSalir = () => {
    clearSession()
    setVista("salir")
    setMensajeSalida("Sesion finalizada correctamente.")
    setTimeout(() => router.replace("/login"), 500)
  }

  const rutaPerfil = resolverRutaPerfil(session)

  const handleIrAPerfil = () => {
    if (rutaPerfil) router.push(rutaPerfil)
  }

  if (vista === "salir") {
    return (
      <main className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sesion Finalizada</AlertTitle>
          <AlertDescription>{mensajeSalida}</AlertDescription>
        </Alert>
      </main>
    )
  }

  if (vista === "detalle" && avisoActual) {
    return (
      <AvisoDetalle
        aviso={avisoActual}
        onRegresar={handleRegresar}
        onPrimaryAction={handlePrimaryAction}
        primaryActionLabel={puedeSolicitarAsociacion ? "Asóciate con una empresa" : "Postular"}
        primaryActionDisabled={!puedeSolicitarAsociacion}
      />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src="/logo-pala.jpeg"
            alt="PALA - Plataforma de Acceso Laboral para Alumnos"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative hover:bg-indigo-50 hover:text-indigo-600">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white text-xs flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Notificaciones</span>
            </Button>
            {rutaPerfil && (
              <Button variant="ghost" size="icon" onClick={handleIrAPerfil} className="hover:bg-indigo-50 hover:text-indigo-600">
                <User className="h-5 w-5" />
                <span className="sr-only">Perfil</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSalir}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto p-6 space-y-6">
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/15 via-fuchsia-400/10 to-transparent blur-3xl" />

        <div className="relative space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Avisos disponibles
          </h1>
          <p className="text-muted-foreground mt-1">Explorá oportunidades y revisá el detalle de cada publicación.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cargando ? (
          <p className="text-muted-foreground">Cargando avisos...</p>
        ) : avisos.length === 0 && !error ? (
          <p className="text-muted-foreground">No hay avisos disponibles por el momento.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {avisos.map((aviso) => (
              <AvisoCard
                key={aviso.nroAviso}
                aviso={aviso}
                onSelect={() => handleSeleccionarAviso(aviso.nroAviso)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
