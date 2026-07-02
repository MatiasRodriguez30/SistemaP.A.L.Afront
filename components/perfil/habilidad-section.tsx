"use client"

import { useState } from "react"
import { Plus, Trash2, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { AuthResponse } from "@/types/auth"
import type { PostulantePerfil } from "@/types/postulante"
import { authHeader } from "@/lib/session"

interface HabilidadSectionProps {
  perfil: PostulantePerfil
  session: AuthResponse
  onPerfilActualizado: (perfil: PostulantePerfil) => void
  onSessionExpirada: () => void
}

export function HabilidadSection({ perfil, session, onPerfilActualizado, onSessionExpirada }: HabilidadSectionProps) {
  const [dialogAbierto, setDialogAbierto] = useState(false)
  const [nombreHabilidad, setNombreHabilidad] = useState("")
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
    setNombreHabilidad("")
    setErrorMessage(null)
    setDialogAbierto(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/pala/postulante/me/habilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify({ nombreHabilidad }),
      })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudo agregar la habilidad")
      }

      setDialogAbierto(false)
      await recargarPerfil()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo agregar la habilidad")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEliminar = async (id: number) => {
    const response = await fetch(`/api/pala/postulante/me/habilidades/${id}`, {
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
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-600">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          Habilidades
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
              <DialogTitle>Agregar habilidad</DialogTitle>
            </DialogHeader>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="habilidad-nombre">Habilidad</Label>
                <Input
                  id="habilidad-nombre"
                  value={nombreHabilidad}
                  onChange={(e) => setNombreHabilidad(e.target.value)}
                  placeholder="Ej: React, Trabajo en equipo, Ingles avanzado"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {perfil.habilidades.length === 0 ? (
        <p className="text-muted-foreground text-sm">Todavía no agregaste habilidades.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {perfil.habilidades.map((habilidad) => (
            <Badge key={habilidad.id} variant="outline" className="gap-1.5 pr-1.5 bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200">
              {habilidad.nombreHabilidad}
              <button
                type="button"
                onClick={() => handleEliminar(habilidad.id)}
                className="rounded-full hover:bg-fuchsia-100 p-0.5"
                aria-label={`Eliminar ${habilidad.nombreHabilidad}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
