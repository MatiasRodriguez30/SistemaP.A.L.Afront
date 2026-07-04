"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { authHeader, getSession } from "@/lib/session"
import type { Notificacion } from "@/types/notificacion"

const formato = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" })
const INTERVALO_ACTUALIZACION_MS = 30000
const MAX_ITEMS_POPOVER = 8

export function NotificationBell() {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])

  const cargar = async () => {
    const session = getSession()
    if (!session) return
    try {
      const response = await fetch("/api/pala/notificaciones", { headers: authHeader(session) })
      if (!response.ok) return
      setNotificaciones((await response.json()) as Notificacion[])
    } catch {
      // silencioso: no interrumpe la navegación si falla el polling
    }
  }

  useEffect(() => {
    cargar()
    const intervalo = setInterval(cargar, INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noLeidas = notificaciones.filter((n) => !n.fechaLectura).length

  const marcarLeida = async (notificacion: Notificacion) => {
    const session = getSession()
    if (!session) return
    if (!notificacion.fechaLectura) {
      await fetch(`/api/pala/notificaciones/${notificacion.id}/leer`, {
        method: "PATCH",
        headers: authHeader(session),
      })
      setNotificaciones((actual) =>
        actual.map((n) => (n.id === notificacion.id ? { ...n, fechaLectura: new Date().toISOString() } : n)),
      )
    }
    if (notificacion.urlDestino) router.push(notificacion.urlDestino)
  }

  const marcarTodasLeidas = async () => {
    const session = getSession()
    if (!session) return
    await fetch("/api/pala/notificaciones/leer-todas", { method: "PATCH", headers: authHeader(session) })
    setNotificaciones((actual) => actual.map((n) => ({ ...n, fechaLectura: n.fechaLectura ?? new Date().toISOString() })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-indigo-50 hover:text-indigo-600">
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-1 text-white text-xs flex items-center justify-center">
              {noLeidas > 9 ? "9+" : noLeidas}
            </span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notificaciones</p>
          {noLeidas > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={marcarTodasLeidas} title="Marcar todas como leídas">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No tenés notificaciones.</p>
          ) : (
            notificaciones.slice(0, MAX_ITEMS_POPOVER).map((notificacion) => (
              <button
                key={notificacion.id}
                onClick={() => marcarLeida(notificacion)}
                className={`block w-full border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-muted/50 ${
                  notificacion.fechaLectura ? "" : "bg-indigo-50/60 dark:bg-indigo-950/20"
                }`}
              >
                <p className="font-medium">{notificacion.titulo}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">{notificacion.mensaje}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formato.format(new Date(notificacion.fechaCreacion))}</p>
              </button>
            ))
          )}
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full text-sm" onClick={() => router.push("/notificaciones")}>
            Ver todas
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
