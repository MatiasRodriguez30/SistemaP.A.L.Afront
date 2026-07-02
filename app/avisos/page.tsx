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
import { authHeader, clearSession, getSession } from "@/lib/session"

type Vista = "lista" | "detalle" | "salir"

export default function VerAvisosPage() {
  const router = useRouter()
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
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src="/logo-pala.jpeg"
            alt="PALA - Plataforma de Acceso Laboral para Alumnos"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                3
              </span>
              <span className="sr-only">Notificaciones</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Perfil</span>
            </Button>
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

      <section className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Avisos disponibles</h1>
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
