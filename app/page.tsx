"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AvisoCard } from "@/components/aviso-card"
import { AvisoDetalle } from "@/components/aviso-detalle"
import { SiteFooter } from "@/components/site-footer"
import { SiteNavbar } from "@/components/site-navbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  Bell,
  Building2,
  Calendar,
  GraduationCap,
  Lock,
  Search,
} from "lucide-react"
import type { Aviso, AvisoDetalleApi, AvisoResumenApi } from "@/types/avisos"
import { mapAvisoDetalle, mapAvisoResumen } from "@/lib/avisos-mapper"

const ESTADISTICAS = [
  { valor: "+12", etiqueta: "Empresas activas" },
  { valor: "+50", etiqueta: "Avisos publicados" },
  { valor: "100%", etiqueta: "Gratis para estudiantes" },
]

// Pagina de bienvenida, de acceso libre: pega contra /api/avisos/recomendados,
// que el backend expone sin autenticacion (ver SecurityConfig.permitAll).
export default function BienvenidaPage() {
  const [vista, setVista] = useState<"lista" | "detalle">("lista")
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [avisoActual, setAvisoActual] = useState<Aviso | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/pala/avisos/recomendados")
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudieron cargar los avisos recomendados.")

        const body = (await response.json()) as AvisoResumenApi[]
        setAvisos(body.map(mapAvisoResumen))
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const handleSeleccionarAviso = async (nroAviso: number) => {
    try {
      const response = await fetch(`/api/pala/avisos/recomendados/${nroAviso}`)
      if (!response.ok) throw new Error("No se pudo cargar el detalle del aviso.")

      const body = (await response.json()) as AvisoDetalleApi
      setAvisoActual(mapAvisoDetalle(body))
      setVista("detalle")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el detalle del aviso.")
    }
  }

  const handleRegresar = () => {
    setVista("lista")
    setAvisoActual(null)
  }

  const handlePostular = () => {
    // El backend todavia no expone PostulacionController; el boton queda deshabilitado.
  }

  if (vista === "detalle" && avisoActual) {
    return (
      <AvisoDetalle
        aviso={avisoActual}
        onRegresar={handleRegresar}
        onPostular={handlePostular}
        postularDisabled
      />
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <SiteNavbar activeHref="/" />

      {/* Bienvenida: que es PALA */}
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/15 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Columna de texto */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600" />
                Plataforma de Acceso Laboral para Alumnos
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Bienvenido a PALA
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                PALA es la <strong className="text-foreground">Plataforma de Acceso Laboral para Alumnos</strong>:
                conectamos estudiantes y graduados con empresas que buscan talento. Explorá avisos reales de
                trabajo y pasantías, sin necesidad de crear una cuenta.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  asChild
                  className="border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                >
                  <Link href="/register">Crear cuenta gratis</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Ya tengo cuenta</Link>
                </Button>
              </div>

              <div className="flex justify-center lg:justify-start gap-8 pt-4">
                {ESTADISTICAS.map((stat) => (
                  <div key={stat.etiqueta}>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {stat.valor}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.etiqueta}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna visual: mockup de la app */}
            <div className="relative hidden lg:flex lg:justify-center h-96">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-72 -rotate-3 rounded-2xl border bg-card p-4 shadow-lg opacity-80">
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500 mb-3" />
                <div className="h-3 w-3/4 rounded bg-muted mb-2" />
                <div className="h-2 w-full rounded bg-muted mb-1" />
                <div className="h-2 w-2/3 rounded bg-muted" />
              </div>

              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 rounded-2xl border bg-card p-5 shadow-2xl">
                <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 mb-4" />
                <p className="text-xs text-muted-foreground mb-1">#1001</p>
                <p className="font-semibold mb-3">Desarrollador Full Stack Jr</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  TechDemo S.A.
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  Cierra: 9/8/2026
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                    Remoto
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                    Híbrido
                  </Badge>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-card px-4 py-2 shadow-lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 shrink-0">
                  <Bell className="h-3 w-3 text-white" />
                </span>
                <span className="text-xs font-medium whitespace-nowrap">Nuevo aviso publicado</span>
              </div>
            </div>
          </div>

          <div id="como-funciona" className="grid sm:grid-cols-3 gap-5 pt-16 text-left scroll-mt-24">
            <div className="group rounded-2xl border bg-card p-5 space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-100 hover:border-indigo-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                <GraduationCap className="h-5 w-5" />
              </span>
              <p className="font-semibold">Para estudiantes</p>
              <p className="text-sm text-muted-foreground">Encontrá pasantías y primeros empleos pensados para tu carrera.</p>
            </div>
            <div className="group rounded-2xl border bg-card p-5 space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-100 hover:border-violet-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
                <Building2 className="h-5 w-5" />
              </span>
              <p className="font-semibold">Para empresas</p>
              <p className="text-sm text-muted-foreground">Publicá avisos y llegá a talento universitario calificado.</p>
            </div>
            <div className="group rounded-2xl border bg-card p-5 space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fuchsia-100 hover:border-fuchsia-200">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600 transition group-hover:bg-fuchsia-100">
                <Search className="h-5 w-5" />
              </span>
              <p className="font-semibold">Explorá sin registrarte</p>
              <p className="text-sm text-muted-foreground">Mirá los avisos recomendados antes de decidir si te sumás.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="avisos" className="relative max-w-6xl mx-auto p-6 space-y-6 scroll-mt-16">
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 via-fuchsia-400/15 to-transparent blur-3xl" />

        <div className="relative space-y-2">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Avisos recomendados
          </h2>
          <p className="text-muted-foreground mt-1">
            Una muestra de lo que vas a encontrar. Esta es solo una vidriera pública — el catálogo completo y la
            postulación se habilitan al crear tu cuenta.
          </p>
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

        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <Lock className="h-6 w-6 mx-auto mb-3 opacity-90" />
          <h3 className="text-xl font-semibold mb-1">Hay más avisos esperándote</h3>
          <p className="text-sm text-white/85 max-w-md mx-auto mb-5">
            Creá tu cuenta gratis para ver el catálogo completo, recibir notificaciones de avisos nuevos y postularte.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Crear cuenta gratis</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
