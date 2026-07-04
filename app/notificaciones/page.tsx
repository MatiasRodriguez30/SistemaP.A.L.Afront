"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminShell } from "@/components/admin-shell"
import { ReclutadorShell } from "@/components/reclutador-shell"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { Notificacion } from "@/types/notificacion"

const formato = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" })

export default function NotificacionesPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = async (sesionActual: AuthResponse) => {
    setCargando(true)
    try {
      const response = await fetch("/api/pala/notificaciones", { headers: authHeader(sesionActual) })
      if (response.status === 401) {
        clearSession()
        router.replace("/login")
        return
      }
      if (response.ok) setNotificaciones((await response.json()) as Notificacion[])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const sesionActual = getSession()
    if (!sesionActual) {
      router.replace("/login")
      return
    }
    setSession(sesionActual)
    cargar(sesionActual)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const marcarLeida = async (notificacion: Notificacion) => {
    if (!session || notificacion.fechaLectura) return
    await fetch(`/api/pala/notificaciones/${notificacion.id}/leer`, { method: "PATCH", headers: authHeader(session) })
    setNotificaciones((actual) =>
      actual.map((n) => (n.id === notificacion.id ? { ...n, fechaLectura: new Date().toISOString() } : n)),
    )
  }

  const marcarTodasLeidas = async () => {
    if (!session) return
    await fetch("/api/pala/notificaciones/leer-todas", { method: "PATCH", headers: authHeader(session) })
    setNotificaciones((actual) => actual.map((n) => ({ ...n, fechaLectura: n.fechaLectura ?? new Date().toISOString() })))
  }

  if (!session) return null

  const noLeidas = notificaciones.filter((n) => !n.fechaLectura).length
  const esAdmin = session.permisos.includes("VER_PERFIL_ADMINISTRADOR")
  const esReclutador = session.roles.some((rol) => rol.toUpperCase() === "RECLUTADOR")

  const contenido = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notificaciones</h1>
        {noLeidas > 0 && (
          <Button variant="outline" size="sm" onClick={marcarTodasLeidas}>
            <Check className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {cargando ? (
        <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tenés notificaciones todavía.</p>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((notificacion) => (
            <button
              key={notificacion.id}
              onClick={() => {
                marcarLeida(notificacion)
                if (notificacion.urlDestino) router.push(notificacion.urlDestino)
              }}
              className={`block w-full rounded-xl border p-4 text-left transition hover:bg-muted/50 ${
                notificacion.fechaLectura ? "" : "border-indigo-200 bg-indigo-50/60 dark:bg-indigo-950/20"
              }`}
            >
              <p className="font-medium">{notificacion.titulo}</p>
              <p className="mt-1 text-sm text-muted-foreground">{notificacion.mensaje}</p>
              <p className="mt-2 text-xs text-muted-foreground">{formato.format(new Date(notificacion.fechaCreacion))}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (esAdmin) return <AdminShell mail={session.mailUsuario}>{contenido}</AdminShell>
  if (esReclutador) return <ReclutadorShell mail={session.mailUsuario}>{contenido}</ReclutadorShell>

  const handleSalir = () => {
    clearSession()
    router.replace("/login")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image src="/logo-pala.jpeg" alt="PALA" width={120} height={60} className="h-12 w-auto object-contain" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push("/avisos")} className="hover:bg-indigo-50 hover:text-indigo-600">
              Avisos
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSalir} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto p-6 space-y-4">
        <Link href="/avisos" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-600">
          <ArrowLeft className="h-4 w-4" /> Volver a avisos
        </Link>
        {contenido}
      </section>
    </main>
  )
}
