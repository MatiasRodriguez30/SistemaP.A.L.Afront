"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AuthResponse } from "@/types/auth"
import type { PostulantePerfil } from "@/types/postulante"
import { authHeader } from "@/lib/session"

interface DatosPersonalesTabProps {
  perfil: PostulantePerfil
  session: AuthResponse
  onPerfilActualizado: (perfil: PostulantePerfil) => void
  onSessionExpirada: () => void
}

export function DatosPersonalesTab({ perfil, session, onPerfilActualizado, onSessionExpirada }: DatosPersonalesTabProps) {
  const [nombrePostulante, setNombrePostulante] = useState(perfil.nombrePostulante)
  const [apellidoPostulante, setApellidoPostulante] = useState(perfil.apellidoPostulante)
  const [legajoAcademicoPostulante, setLegajoAcademicoPostulante] = useState(String(perfil.legajoAcademicoPostulante))
  const [mailAcademicoPostulante, setMailAcademicoPostulante] = useState(perfil.mailAcademicoPostulante ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/pala/postulante/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify({
          nombrePostulante,
          apellidoPostulante,
          legajoAcademicoPostulante: Number(legajoAcademicoPostulante),
          mailAcademicoPostulante: mailAcademicoPostulante || null,
        }),
      })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudieron guardar los datos personales")
      }

      onPerfilActualizado(body as PostulantePerfil)
      setSuccessMessage("Datos personales actualizados correctamente.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudieron guardar los datos personales")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos personales</CardTitle>
        <CardDescription>Estos datos los ve la empresa cuando te postulás a un aviso.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>No se pudo completar la operacion</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
            <AlertTitle>Listo</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="nombre-postulante">Nombre</Label>
            <Input id="nombre-postulante" value={nombrePostulante} onChange={(e) => setNombrePostulante(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellido-postulante">Apellido</Label>
            <Input id="apellido-postulante" value={apellidoPostulante} onChange={(e) => setApellidoPostulante(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legajo-postulante">Legajo academico</Label>
            <Input
              id="legajo-postulante"
              inputMode="numeric"
              value={legajoAcademicoPostulante}
              onChange={(e) => setLegajoAcademicoPostulante(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mail-academico-postulante">Mail academico</Label>
            <Input
              id="mail-academico-postulante"
              type="email"
              value={mailAcademicoPostulante}
              onChange={(e) => setMailAcademicoPostulante(e.target.value)}
              placeholder="usuario@universidad.edu.ar"
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha de nacimiento</Label>
            <Input value={perfil.fechaNacimientoPostulante ?? "No informada"} disabled />
          </div>

          <div className="space-y-2">
            <Label>Mail personal (acceso al sistema)</Label>
            <Input value={perfil.mailPersonalPostulante} disabled />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Tipo de estudiante</Label>
            <Input value={perfil.tipoEstudiante?.nombre ?? "No informado"} disabled />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={submitting} className="h-11 w-full md:w-auto">
              {submitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
