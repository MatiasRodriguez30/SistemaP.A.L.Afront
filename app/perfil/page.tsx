"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AuthResponse } from "@/types/auth"
import type { PostulantePerfil } from "@/types/postulante"
import { authHeader, clearSession, getSession } from "@/lib/session"
import { DatosPersonalesTab } from "@/components/perfil/datos-personales-tab"
import { CarrerasTab } from "@/components/perfil/carreras-tab"
import { ArmarCvTab } from "@/components/perfil/armar-cv-tab"

export default function PerfilPostulantePage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [perfil, setPerfil] = useState<PostulantePerfil | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sesionActual = getSession()
    if (!sesionActual || !sesionActual.permisos.includes("VER_PERFIL_POSTULANTE")) {
      router.replace("/login")
      return
    }

    setSession(sesionActual)

    fetch("/api/pala/postulante/me", { headers: authHeader(sesionActual) })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          router.replace("/login")
          return
        }
        if (!response.ok) throw new Error("No se pudo cargar el perfil")

        const body = (await response.json()) as PostulantePerfil
        setPerfil(body)
      })
      .catch(() => setError("No se pudo cargar el perfil. Intente nuevamente más tarde."))
      .finally(() => setCargando(false))
  }, [router])

  const handleSalir = () => {
    clearSession()
    router.replace("/login")
  }

  const handleSessionExpirada = () => {
    clearSession()
    router.replace("/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src="/logo-pala.jpeg"
            alt="PALA - Plataforma de Acceso Laboral para Alumnos"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/avisos")} className="hover:bg-indigo-50 hover:text-indigo-600">
              Avisos
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

      <section className="relative max-w-5xl mx-auto p-6 space-y-6">
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/15 via-fuchsia-400/10 to-transparent blur-3xl" />

        <div className="relative space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Mi perfil
          </h1>
          <p className="text-muted-foreground mt-1">Gestioná tus datos, carreras y armá tu CV.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cargando ? (
          <p className="text-muted-foreground">Cargando perfil...</p>
        ) : perfil && session ? (
          <Tabs defaultValue="datos" className="gap-6">
            <TabsList className="grid w-full grid-cols-3 max-w-xl rounded-2xl bg-indigo-50 p-1">
              <TabsTrigger value="datos" className="rounded-xl data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
                Datos personales
              </TabsTrigger>
              <TabsTrigger value="carreras" className="rounded-xl data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
                Carreras
              </TabsTrigger>
              <TabsTrigger value="cv" className="rounded-xl data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300">
                Armar CV
              </TabsTrigger>
            </TabsList>

            <TabsContent value="datos">
              <DatosPersonalesTab
                perfil={perfil}
                session={session}
                onPerfilActualizado={setPerfil}
                onSessionExpirada={handleSessionExpirada}
              />
            </TabsContent>

            <TabsContent value="carreras">
              <CarrerasTab
                perfil={perfil}
                session={session}
                onPerfilActualizado={setPerfil}
                onSessionExpirada={handleSessionExpirada}
              />
            </TabsContent>

            <TabsContent value="cv">
              <ArmarCvTab
                perfil={perfil}
                session={session}
                onPerfilActualizado={setPerfil}
                onSessionExpirada={handleSessionExpirada}
              />
            </TabsContent>
          </Tabs>
        ) : null}
      </section>
    </main>
  )
}
