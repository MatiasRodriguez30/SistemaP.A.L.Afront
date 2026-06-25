"use client"

import { useRef, useState } from "react"
import { FileText, Upload, Sparkles, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AuthResponse } from "@/types/auth"
import type { PostulantePerfil } from "@/types/postulante"
import { authHeader } from "@/lib/session"
import { ExperienciaSection } from "@/components/perfil/experiencia-section"
import { ExperienciaAcademicaSection } from "@/components/perfil/experiencia-academica-section"
import { HabilidadSection } from "@/components/perfil/habilidad-section"

interface ArmarCvTabProps {
  perfil: PostulantePerfil
  session: AuthResponse
  onPerfilActualizado: (perfil: PostulantePerfil) => void
  onSessionExpirada: () => void
}

export function ArmarCvTab({ perfil, session, onPerfilActualizado, onSessionExpirada }: ArmarCvTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [descargando, setDescargando] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  const handleSubirArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0]
    if (!archivo) return

    setSubiendo(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append("archivo", archivo)

      const response = await fetch("/api/pala/postulante/me/cv", {
        method: "POST",
        headers: authHeader(session),
        body: formData,
      })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudo subir el CV")
      }

      setSuccessMessage("CV subido correctamente.")
      await recargarPerfil()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo subir el CV")
    } finally {
      setSubiendo(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleGenerar = async () => {
    setGenerando(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/pala/postulante/me/cv/generar", {
        method: "POST",
        headers: authHeader(session),
      })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      const body = await response.json()
      if (!response.ok) {
        throw new Error(body?.mensaje ?? "No se pudo generar el CV")
      }

      setSuccessMessage("CV generado correctamente a partir de tu perfil.")
      await recargarPerfil()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo generar el CV")
    } finally {
      setGenerando(false)
    }
  }

  const handleVerCv = async () => {
    setDescargando(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/pala/postulante/me/cv", { headers: authHeader(session) })

      if (response.status === 401) {
        onSessionExpirada()
        return
      }

      if (!response.ok) {
        throw new Error("No se pudo obtener el CV")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank", "noopener,noreferrer")
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo obtener el CV")
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <ExperienciaSection
            perfil={perfil}
            session={session}
            onPerfilActualizado={onPerfilActualizado}
            onSessionExpirada={onSessionExpirada}
          />

          <Separator />

          <ExperienciaAcademicaSection
            perfil={perfil}
            session={session}
            onPerfilActualizado={onPerfilActualizado}
            onSessionExpirada={onSessionExpirada}
          />

          <Separator />

          <HabilidadSection
            perfil={perfil}
            session={session}
            onPerfilActualizado={onPerfilActualizado}
            onSessionExpirada={onSessionExpirada}
          />
        </CardContent>
      </Card>

      <Card className="border-indigo-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="h-4 w-4" />
            </span>
            Tu CV
          </CardTitle>
          <CardDescription>Subí tu propio PDF o generá uno automáticamente a partir de los datos de tu perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleSubirArchivo} />
            <Button variant="outline" disabled={subiendo} onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {subiendo ? "Subiendo..." : "Subir PDF"}
            </Button>

            <Button
              disabled={generando}
              onClick={handleGenerar}
              className="border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
            >
              <Sparkles className="h-4 w-4" />
              {generando ? "Generando..." : "Generar automáticamente"}
            </Button>

            {perfil.urlCVGuardado && (
              <Button variant="ghost" disabled={descargando} onClick={handleVerCv} className="hover:bg-indigo-50 hover:text-indigo-600">
                <Download className="h-4 w-4" />
                {descargando ? "Abriendo..." : `Ver CV actual${perfil.cvNombreArchivo ? ` (${perfil.cvNombreArchivo})` : ""}`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
