"use client"

import { useEffect, useState } from "react"
import { Building2, Calendar, CalendarClock, Link2, User, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AuthResponse } from "@/types/auth"
import type { PostulacionPostulante } from "@/types/postulacion-postulante"
import { authHeader } from "@/lib/session"

interface PostulacionesTabProps {
  session: AuthResponse
  onSessionExpirada: () => void
}

const formato = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" })

const tonosEstado: Record<string, string> = {
  ENVIADO: "bg-slate-200 text-slate-700",
  CITADO: "bg-amber-100 text-amber-800",
  ACEPTADO: "bg-emerald-100 text-emerald-800",
  RECHAZADO: "bg-rose-100 text-rose-800",
  CANCELADO: "bg-rose-100 text-rose-800",
}

const ESTADOS_CON_BAJA_PERMITIDA = ["ENVIADO", "CITADO"]

export function PostulacionesTab({ session, onSessionExpirada }: PostulacionesTabProps) {
  const [postulaciones, setPostulaciones] = useState<PostulacionPostulante[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aDarDeBaja, setADarDeBaja] = useState<PostulacionPostulante | null>(null)
  const [procesando, setProcesando] = useState(false)

  const cargar = async () => {
    setCargando(true)
    try {
      const response = await fetch("/api/pala/postulante/me/postulaciones", { headers: authHeader(session) })
      if (response.status === 401) {
        onSessionExpirada()
        return
      }
      if (!response.ok) throw new Error("No se pudieron cargar tus postulaciones")
      setPostulaciones((await response.json()) as PostulacionPostulante[])
      setError(null)
    } catch {
      setError("No se pudieron cargar tus postulaciones. Intente nuevamente más tarde.")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDarDeBaja = async () => {
    if (!aDarDeBaja) return
    setProcesando(true)
    try {
      const response = await fetch(`/api/pala/postulante/me/postulaciones/${aDarDeBaja.id}/baja`, {
        method: "PATCH",
        headers: authHeader(session),
      })
      if (response.status === 401) {
        onSessionExpirada()
        return
      }
      if (!response.ok) throw new Error("No se pudo dar de baja la postulación")
      setADarDeBaja(null)
      await cargar()
    } catch {
      setError("No se pudo dar de baja la postulación. Intente nuevamente más tarde.")
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cargando ? (
          <p className="text-sm text-muted-foreground">Cargando postulaciones...</p>
        ) : postulaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no te postulaste a ningún aviso.</p>
        ) : (
          postulaciones.map((postulacion) => {
            const puedeDarseDeBaja = ESTADOS_CON_BAJA_PERMITIDA.includes(postulacion.codigoEstado)
            return (
              <div key={postulacion.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`border-0 ${tonosEstado[postulacion.codigoEstado] ?? tonosEstado.ENVIADO}`}>
                        {postulacion.nombreEstado}
                      </Badge>
                    </div>
                    <h3 className="mt-2 truncate font-medium">{postulacion.nombreAviso}</h3>
                  </div>

                  {puedeDarseDeBaja && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setADarDeBaja(postulacion)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Dar de baja
                    </Button>
                  )}
                </div>

                <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{postulacion.razonSocialEmpresa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    <span>{postulacion.nombreReclutador}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Postulado el {formato.format(new Date(postulacion.fechaPostulacion))}</span>
                  </div>
                  {postulacion.fechaReunion && (
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Reunión: {formato.format(new Date(postulacion.fechaReunion))}</span>
                    </div>
                  )}
                  {postulacion.enlaceReunion && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Link2 className="h-3.5 w-3.5" />
                      <a
                        href={postulacion.enlaceReunion}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-indigo-600 hover:underline"
                      >
                        {postulacion.enlaceReunion}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </CardContent>

      <AlertDialog open={Boolean(aDarDeBaja)} onOpenChange={(open) => !open && setADarDeBaja(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dar de baja postulación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que querés darte de baja de la postulación a "{aDarDeBaja?.nombreAviso}"? Va a pasar a estado Cancelado y el
              reclutador va a verlo reflejado. Esta acción no puede revertirse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={procesando}>Volver</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              disabled={procesando}
              onClick={handleDarDeBaja}
            >
              {procesando ? "Procesando..." : "Dar de baja"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
