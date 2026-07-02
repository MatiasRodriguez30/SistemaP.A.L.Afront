"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import type { ExperienciaAcademica, PostulantePerfil } from "@/types/postulante"
import { authHeader } from "@/lib/session"

interface ExperienciaAcademicaSectionProps {
  perfil: PostulantePerfil
  session: AuthResponse
  onPerfilActualizado: (perfil: PostulantePerfil) => void
  onSessionExpirada: () => void
}

const FORM_VACIO = {
  nombreInstitucionExpAcademica: "",
  tituloExpAcademica: "",
  fechaDesdeExpAcademica: "",
  fechaHastaExpAcademica: "",
  actualidad: false,
}

export function ExperienciaAcademicaSection({ perfil, session, onPerfilActualizado, onSessionExpirada }: ExperienciaAcademicaSectionProps) {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState(FORM_VACIO)
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

  const abrirNuevo = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrorMessage(null)
    setDialogAbierto(true)
  }

  const abrirEdicion = (experiencia: ExperienciaAcademica) => {
    setEditandoId(experiencia.id)
    setForm({
      nombreInstitucionExpAcademica: experiencia.nombreInstitucionExpAcademica,
      tituloExpAcademica: experiencia.tituloExpAcademica,
      fechaDesdeExpAcademica: experiencia.fechaDesdeExpAcademica ?? "",
      fechaHastaExpAcademica: experiencia.fechaHastaExpAcademica ?? "",
      actualidad: experiencia.fechaHastaExpAcademica === null,
    })
    setErrorMessage(null)
    setDialogAbierto(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const payload = {
      nombreInstitucionExpAcademica: form.nombreInstitucionExpAcademica,
      tituloExpAcademica: form.tituloExpAcademica,
      fechaDesdeExpAcademica: form.fechaDesdeExpAcademica || null,
      fechaHastaExpAcademica: form.actualidad ? null : form.fechaHastaExpAcademica || null,
    }

    try {
      const url = editandoId
        ? `/api/pala/postulante/me/experiencias-academicas/${editandoId}`
        : "/api/pala/postulante/me/experiencias-academicas"

      const response = await fetch(url, {
        method: editandoId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudo guardar la experiencia academica")
      }

      setDialogAbierto(false)
      await recargarPerfil()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la experiencia academica")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = async (id: number) => {
    const response = await fetch(`/api/pala/postulante/me/experiencias-academicas/${id}`, {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <GraduationCap className="h-3.5 w-3.5" />
          </span>
          Experiencia académica
        </h3>
        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={abrirNuevo}>
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editandoId ? "Editar experiencia académica" : "Agregar experiencia académica"}</DialogTitle>
            </DialogHeader>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="expa-institucion">Institución</Label>
                <Input
                  id="expa-institucion"
                  value={form.nombreInstitucionExpAcademica}
                  onChange={(e) => setForm((current) => ({ ...current, nombreInstitucionExpAcademica: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expa-titulo">Título</Label>
                <Input
                  id="expa-titulo"
                  value={form.tituloExpAcademica}
                  onChange={(e) => setForm((current) => ({ ...current, tituloExpAcademica: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expa-desde">Desde</Label>
                  <Input
                    id="expa-desde"
                    type="date"
                    value={form.fechaDesdeExpAcademica}
                    onChange={(e) => setForm((current) => ({ ...current, fechaDesdeExpAcademica: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expa-hasta">Hasta</Label>
                  <Input
                    id="expa-hasta"
                    type="date"
                    disabled={form.actualidad}
                    value={form.fechaHastaExpAcademica}
                    onChange={(e) => setForm((current) => ({ ...current, fechaHastaExpAcademica: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="expa-actualidad"
                  checked={form.actualidad}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, actualidad: checked === true, fechaHastaExpAcademica: "" }))}
                />
                <Label htmlFor="expa-actualidad" className="font-normal">
                  Estudio actualmente aquí
                </Label>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {perfil.experienciasAcademicas.length === 0 ? (
        <p className="text-muted-foreground text-sm">Todavía no agregaste experiencia académica.</p>
      ) : (
        <div className="space-y-2">
          {perfil.experienciasAcademicas.map((experiencia) => (
            <div key={experiencia.id} className="flex items-start justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">
                  {experiencia.tituloExpAcademica} — {experiencia.nombreInstitucionExpAcademica}
                </p>
                <p className="text-xs text-muted-foreground">
                  {experiencia.fechaDesdeExpAcademica ?? "?"} — {experiencia.fechaHastaExpAcademica ?? "Actualidad"}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => abrirEdicion(experiencia)}>
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
                      <AlertDialogTitle>Eliminar experiencia académica</AlertDialogTitle>
                      <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleEliminar(experiencia.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
