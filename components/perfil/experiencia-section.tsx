"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import type { Experiencia, PostulantePerfil } from "@/types/postulante"
import { authHeader } from "@/lib/session"

interface ExperienciaSectionProps {
  perfil: PostulantePerfil
  session: AuthResponse
  onPerfilActualizado: (perfil: PostulantePerfil) => void
  onSessionExpirada: () => void
}

const FORM_VACIO = {
  descripcionExperiencia: "",
  nombreCargoExperiencia: "",
  nombreEmpresaExperiencia: "",
  fechaDesdeExp: "",
  fechaHastaExp: "",
  actualidad: false,
}

export function ExperienciaSection({ perfil, session, onPerfilActualizado, onSessionExpirada }: ExperienciaSectionProps) {
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

  const abrirEdicion = (experiencia: Experiencia) => {
    setEditandoId(experiencia.id)
    setForm({
      descripcionExperiencia: experiencia.descripcionExperiencia ?? "",
      nombreCargoExperiencia: experiencia.nombreCargoExperiencia,
      nombreEmpresaExperiencia: experiencia.nombreEmpresaExperiencia,
      fechaDesdeExp: experiencia.fechaDesdeExp ?? "",
      fechaHastaExp: experiencia.fechaHastaExp ?? "",
      actualidad: experiencia.fechaHastaExp === null,
    })
    setErrorMessage(null)
    setDialogAbierto(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    const payload = {
      descripcionExperiencia: form.descripcionExperiencia || null,
      nombreCargoExperiencia: form.nombreCargoExperiencia,
      nombreEmpresaExperiencia: form.nombreEmpresaExperiencia,
      fechaDesdeExp: form.fechaDesdeExp || null,
      fechaHastaExp: form.actualidad ? null : form.fechaHastaExp || null,
    }

    try {
      const url = editandoId
        ? `/api/pala/postulante/me/experiencias/${editandoId}`
        : "/api/pala/postulante/me/experiencias"

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
        throw new Error(body?.mensaje ?? "No se pudo guardar la experiencia")
      }

      setDialogAbierto(false)
      await recargarPerfil()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la experiencia")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = async (id: number) => {
    const response = await fetch(`/api/pala/postulante/me/experiencias/${id}`, {
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
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Briefcase className="h-3.5 w-3.5" />
          </span>
          Experiencia laboral
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
              <DialogTitle>{editandoId ? "Editar experiencia" : "Agregar experiencia"}</DialogTitle>
            </DialogHeader>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exp-cargo">Cargo</Label>
                  <Input
                    id="exp-cargo"
                    value={form.nombreCargoExperiencia}
                    onChange={(e) => setForm((current) => ({ ...current, nombreCargoExperiencia: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp-empresa">Empresa</Label>
                  <Input
                    id="exp-empresa"
                    value={form.nombreEmpresaExperiencia}
                    onChange={(e) => setForm((current) => ({ ...current, nombreEmpresaExperiencia: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-descripcion">Descripción</Label>
                <Textarea
                  id="exp-descripcion"
                  value={form.descripcionExperiencia}
                  onChange={(e) => setForm((current) => ({ ...current, descripcionExperiencia: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exp-desde">Desde</Label>
                  <Input
                    id="exp-desde"
                    type="date"
                    value={form.fechaDesdeExp}
                    onChange={(e) => setForm((current) => ({ ...current, fechaDesdeExp: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp-hasta">Hasta</Label>
                  <Input
                    id="exp-hasta"
                    type="date"
                    disabled={form.actualidad}
                    value={form.fechaHastaExp}
                    onChange={(e) => setForm((current) => ({ ...current, fechaHastaExp: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="exp-actualidad"
                  checked={form.actualidad}
                  onCheckedChange={(checked) => setForm((current) => ({ ...current, actualidad: checked === true, fechaHastaExp: "" }))}
                />
                <Label htmlFor="exp-actualidad" className="font-normal">
                  Trabajo actualmente aquí
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

      {perfil.experiencias.length === 0 ? (
        <p className="text-muted-foreground text-sm">Todavía no agregaste experiencia laboral.</p>
      ) : (
        <div className="space-y-2">
          {perfil.experiencias.map((experiencia) => (
            <div key={experiencia.id} className="flex items-start justify-between rounded-xl border p-4">
              <div>
                <p className="font-medium">
                  {experiencia.nombreCargoExperiencia} — {experiencia.nombreEmpresaExperiencia}
                </p>
                <p className="text-xs text-muted-foreground">
                  {experiencia.fechaDesdeExp ?? "?"} — {experiencia.fechaHastaExp ?? "Actualidad"}
                </p>
                {experiencia.descripcionExperiencia && (
                  <p className="text-sm text-muted-foreground mt-1">{experiencia.descripcionExperiencia}</p>
                )}
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
                      <AlertDialogTitle>Eliminar experiencia</AlertDialogTitle>
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
