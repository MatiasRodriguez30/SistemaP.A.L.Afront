"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil, GraduationCap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { AuthResponse } from "@/types/auth"
import type { CarreraOption, PostulanteCarrera, PostulantePerfil } from "@/types/postulante"
import { authHeader } from "@/lib/session"

interface CarrerasTabProps {
  perfil: PostulantePerfil
  session: AuthResponse
  onPerfilActualizado: (perfil: PostulantePerfil) => void
  onSessionExpirada: () => void
}

export function CarrerasTab({ perfil, session, onPerfilActualizado, onSessionExpirada }: CarrerasTabProps) {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editando, setEditando] = useState<PostulanteCarrera | null>(null)
  const [carrerasDisponibles, setCarrerasDisponibles] = useState<CarreraOption[]>([])
  const [cargandoCarreras, setCargandoCarreras] = useState(false)
  const [carreraId, setCarreraId] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [actualidad, setActualidad] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const recargarPerfil = async () => {
    const response = await fetch("/api/pala/postulante/me", { headers: authHeader(session) })
    if (response.status === 401) {
      onSessionExpirada()
      return
    }
    if (response.ok) {
      onPerfilActualizado((await response.json()) as PostulantePerfil)
    }
  }

  const abrirNuevo = async () => {
    setEditando(null)
    setErrorMessage(null)
    setCarreraId("")
    setFechaDesde("")
    setFechaHasta("")
    setActualidad(false)
    setDialogAbierto(true)
    setCargandoCarreras(true)

    try {
      const response = await fetch("/api/pala/carreras", { headers: authHeader(session) })
      if (response.status === 401) {
        onSessionExpirada()
        return
      }
      const body = (await response.json()) as CarreraOption[]
      const idsAsignados = new Set(perfil.carreras.map((pc) => pc.carreraId))
      setCarrerasDisponibles(body.filter((carrera) => !idsAsignados.has(carrera.id)))
    } catch {
      setErrorMessage("No se pudieron cargar las carreras disponibles.")
    } finally {
      setCargandoCarreras(false)
    }
  }

  const abrirEdicion = (carrera: PostulanteCarrera) => {
    setEditando(carrera)
    setErrorMessage(null)
    setCarreraId(String(carrera.carreraId))
    setFechaDesde(carrera.fechaDesdePostulanteCarrera ?? "")
    setFechaHasta(carrera.fechaHastaPostulanteCarrera ?? "")
    setActualidad(carrera.fechaHastaPostulanteCarrera === null)
    setDialogAbierto(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const url = editando ? `/api/pala/postulante/me/carreras/${editando.id}` : "/api/pala/postulante/me/carreras"

      const payload = editando
        ? {
            fechaDesdePostulanteCarrera: fechaDesde || null,
            fechaHastaPostulanteCarrera: actualidad ? null : fechaHasta || null,
          }
        : {
            carreraId: Number(carreraId),
            fechaDesdePostulanteCarrera: fechaDesde || null,
            fechaHastaPostulanteCarrera: actualidad ? null : fechaHasta || null,
          }

      const response = await fetch(url, {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudo guardar la carrera")
      }

      setDialogAbierto(false)
      await recargarPerfil()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la carrera")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = async (id: number) => {
    const response = await fetch(`/api/pala/postulante/me/carreras/${id}`, {
      method: "DELETE",
      headers: authHeader(session),
    })

    if (response.status === 401) {
      onSessionExpirada()
      return
    }

    await recargarPerfil()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Carreras</CardTitle>
          <CardDescription>Las carreras que estás cursando o que ya completaste.</CardDescription>
        </div>
        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={abrirNuevo}>
              <Plus className="h-4 w-4" />
              Agregar carrera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editando ? "Editar carrera" : "Agregar carrera"}</DialogTitle>
            </DialogHeader>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {editando ? (
                <div className="space-y-2">
                  <Label>Carrera</Label>
                  <Input value={editando.nombreCarrera} disabled />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="carrera-select">Carrera</Label>
                  <Select value={carreraId} onValueChange={setCarreraId}>
                    <SelectTrigger id="carrera-select" className="w-full">
                      <SelectValue placeholder={cargandoCarreras ? "Cargando carreras..." : "Seleccione una carrera"} />
                    </SelectTrigger>
                    <SelectContent>
                      {carrerasDisponibles.map((carrera) => (
                        <SelectItem key={carrera.id} value={String(carrera.id)}>
                          {carrera.nombreCarrera}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrera-fecha-desde">Fecha desde</Label>
                  <Input id="carrera-fecha-desde" type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carrera-fecha-hasta">Fecha hasta</Label>
                  <Input
                    id="carrera-fecha-hasta"
                    type="date"
                    disabled={actualidad}
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="carrera-actualidad"
                  checked={actualidad}
                  onCheckedChange={(checked) => {
                    setActualidad(checked === true)
                    setFechaHasta("")
                  }}
                />
                <Label htmlFor="carrera-actualidad" className="font-normal">
                  Estoy cursando actualmente
                </Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting || (!editando && !carreraId)}>
                  {submitting ? "Guardando..." : editando ? "Guardar" : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {perfil.carreras.length === 0 ? (
          <p className="text-muted-foreground text-sm">Todavía no agregaste ninguna carrera.</p>
        ) : (
          perfil.carreras.map((carrera) => (
            <div key={carrera.id} className="flex items-center justify-between rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium">{carrera.nombreCarrera}</p>
                  <p className="text-xs text-muted-foreground">
                    {carrera.fechaDesdePostulanteCarrera ?? "?"} — {carrera.fechaHastaPostulanteCarrera ?? "En curso"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => abrirEdicion(carrera)}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Quitar carrera</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Seguro que querés quitar "{carrera.nombreCarrera}" de tu perfil? Vas a poder volver a agregarla mas adelante.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleEliminar(carrera.id)}>Quitar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
