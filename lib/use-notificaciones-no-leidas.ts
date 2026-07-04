"use client"

import { useEffect, useState } from "react"
import { authHeader, getSession } from "@/lib/session"
import type { Notificacion } from "@/types/notificacion"

const INTERVALO_ACTUALIZACION_MS = 30000

export function useNotificacionesNoLeidas() {
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    const cargar = async () => {
      const session = getSession()
      if (!session) return
      try {
        const response = await fetch("/api/pala/notificaciones", { headers: authHeader(session) })
        if (!response.ok) return
        const body = (await response.json()) as Notificacion[]
        setNoLeidas(body.filter((n) => !n.fechaLectura).length)
      } catch {
        // silencioso: no interrumpe la navegación si falla el polling
      }
    }

    cargar()
    const intervalo = setInterval(cargar, INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
  }, [])

  return noLeidas
}
