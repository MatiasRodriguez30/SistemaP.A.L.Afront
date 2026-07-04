"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostulacionesTab } from "@/components/perfil/postulaciones-tab"
import { PostulanteProfileMenu } from "@/components/postulante-profile-menu"
import type { AuthResponse } from "@/types/auth"
import { clearSession, getSession } from "@/lib/session"

export default function MisPostulacionesPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)

  useEffect(() => {
    const sesionActual = getSession()
    if (!sesionActual || !sesionActual.permisos.includes("POSTULARSE_AVISO")) {
      router.replace("/login")
      return
    }
    setSession(sesionActual)
  }, [router])

  const handleSalir = () => {
    clearSession()
    router.replace("/login")
  }

  const handleSessionExpirada = () => {
    clearSession()
    router.replace("/login")
  }

  if (!session) return null

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
            <PostulanteProfileMenu rutaPerfil="/perfil" />
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
          <Link href="/avisos" className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-600">
            <ArrowLeft className="h-4 w-4" /> Volver a avisos
          </Link>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Mis postulaciones
          </h1>
          <p className="text-muted-foreground mt-1">Seguí el estado de tus postulaciones y gestioná tu participación.</p>
        </div>

        <PostulacionesTab session={session} onSessionExpirada={handleSessionExpirada} />
      </section>
    </main>
  )
}
