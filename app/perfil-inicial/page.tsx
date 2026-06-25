"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react"

import type { AuthResponse, TipoEstudianteOption } from "@/types/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteNavbar } from "@/components/site-navbar"
import { SiteFooter } from "@/components/site-footer"
import { authHeader, clearSession, getSession, saveSession } from "@/lib/session"

// ---------- helpers ----------

async function readBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }
  const text = await response.text()
  throw new Error(text || "Error inesperado del servidor")
}

function getMensaje(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>
    const v = b["mensaje"] ?? b["message"] ?? b["error"]
    if (typeof v === "string") return v
  }
  return fallback
}

// ---------- tipos ----------

interface PostulanteFormState {
  nombrePostulante: string
  apellidoPostulante: string
  fechaNacimientoPostulante: string
  legajoAcademicoPostulante: string
  mailPersonalPostulante: string
  tipoEstudianteId: string
}

interface ReclutadorFormState {
  nombreReclutador: string
  cuilReclutador: string
  descripcionReclutador: string
}

const emptyPostulante: PostulanteFormState = {
  nombrePostulante: "",
  apellidoPostulante: "",
  fechaNacimientoPostulante: "",
  legajoAcademicoPostulante: "",
  mailPersonalPostulante: "",
  tipoEstudianteId: "",
}

const emptyReclutador: ReclutadorFormState = {
  nombreReclutador: "",
  cuilReclutador: "",
  descripcionReclutador: "",
}

// ---------- componente ----------

export default function PerfilInicialPage() {
  const router = useRouter()

  const [session, setSession] = useState<AuthResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [postulanteForm, setPostulanteForm] = useState<PostulanteFormState>(emptyPostulante)
  const [reclutadorForm, setReclutadorForm] = useState<ReclutadorFormState>(emptyReclutador)

  const [tiposEstudiante, setTiposEstudiante] = useState<TipoEstudianteOption[]>([])
  const [tiposLoading, setTiposLoading] = useState(false)

  // Determinar rol pendiente
  const rolPendiente = useMemo(() => {
    if (!session) return null
    const rolesUp = session.roles.map((r) => r.toUpperCase())
    if (rolesUp.includes("POSTULANTE")) return "POSTULANTE"
    if (rolesUp.includes("RECLUTADOR")) return "RECLUTADOR"
    return null
  }, [session])

  // Verificar sesion y redirigir si ya tiene perfil completo
  useEffect(() => {
    const s = getSession()
    if (!s) {
      router.replace("/login")
      return
    }
    if (s.perfilCompleto) {
      const rolesUp = s.roles.map((r) => r.toUpperCase())
      router.replace(rolesUp.includes("ADMINISTRADOR") ? "/admin" : "/avisos")
      return
    }
    setSession(s)
  }, [router])

  // Cargar tipos de estudiante para postulante
  useEffect(() => {
    if (rolPendiente !== "POSTULANTE" || tiposEstudiante.length > 0) return
    setTiposLoading(true)
    fetch("/api/pala/auth/tipos-estudiante")
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudieron cargar los tipos de estudiante")
        const body = await res.json()
        setTiposEstudiante(body as TipoEstudianteOption[])
      })
      .catch((err: Error) => setErrorMessage(err.message))
      .finally(() => setTiposLoading(false))
  }, [rolPendiente, tiposEstudiante.length])

  useEffect(() => {
    if (!errorMessage && !successMessage) return
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [errorMessage, successMessage])

  const updatePostulante = <K extends keyof PostulanteFormState>(
    field: K,
    value: PostulanteFormState[K]
  ) => setPostulanteForm((prev) => ({ ...prev, [field]: value }))

  const updateReclutador = <K extends keyof ReclutadorFormState>(
    field: K,
    value: ReclutadorFormState[K]
  ) => setReclutadorForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session) return
    setErrorMessage(null)
    setSuccessMessage(null)

    if (rolPendiente === "POSTULANTE" && !postulanteForm.tipoEstudianteId) {
      setErrorMessage("Debe seleccionar el tipo de estudiante.")
      return
    }

    setSubmitting(true)

    // El mail academico se toma directamente del mail de la sesion
    const mailSesion = session.mailUsuario

    const payload =
      rolPendiente === "RECLUTADOR"
        ? {
            reclutador: {
              nombreReclutador: reclutadorForm.nombreReclutador,
              cuilReclutador: reclutadorForm.cuilReclutador,
              descripcionReclutador: reclutadorForm.descripcionReclutador || null,
            },
          }
        : {
            postulante: {
              nombrePostulante: postulanteForm.nombrePostulante,
              apellidoPostulante: postulanteForm.apellidoPostulante,
              fechaNacimientoPostulante: postulanteForm.fechaNacimientoPostulante || null,
              legajoAcademicoPostulante: Number(postulanteForm.legajoAcademicoPostulante),
              mailAcademicoPostulante: mailSesion,
              mailPersonalPostulante: postulanteForm.mailPersonalPostulante || null,
              tipoEstudianteId: Number(postulanteForm.tipoEstudianteId),
            },
          }

    try {
      const response = await fetch("/api/pala/auth/perfil-inicial", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(session),
        },
        body: JSON.stringify(payload),
      })

      const body = await readBody<AuthResponse>(response)
      if (!response.ok) {
        throw new Error(getMensaje(body, "No se pudo completar el perfil"))
      }

      const newSession = body as AuthResponse
      // Preservar el token original si el backend no devuelve uno nuevo
      const sessionToSave: AuthResponse = {
        ...newSession,
        token: newSession.token ?? session.token,
        tipo: newSession.tipo ?? session.tipo,
      }
      saveSession(sessionToSave)

      setSuccessMessage("Perfil completado correctamente. Redirigiendo...")
      setTimeout(() => {
        router.push("/avisos")
      }, 1200)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "No se pudo completar el perfil")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSalir = () => {
    clearSession()
    router.replace("/login")
  }

  if (!session) return null

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <SiteNavbar />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-start justify-center overflow-hidden px-6 py-12 lg:items-center lg:px-8">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[40rem] rounded-full bg-gradient-to-br from-indigo-400/25 via-fuchsia-400/20 to-amber-300/15 blur-3xl" />

        <Card className="relative w-full max-w-2xl rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-100/60">
          <CardHeader className="space-y-3 pb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-lg shadow-indigo-200/50">
              {rolPendiente === "RECLUTADOR" ? (
                <BriefcaseBusiness className="h-6 w-6 text-white" />
              ) : (
                <GraduationCap className="h-6 w-6 text-white" />
              )}
            </div>

            <CardTitle className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Completa tu perfil
            </CardTitle>
            <CardDescription className="text-base leading-6 text-muted-foreground">
              Tu cuenta esta lista, pero necesitamos algunos datos adicionales para activar tu perfil de{" "}
              <span className="font-semibold text-foreground">
                {rolPendiente === "RECLUTADOR" ? "reclutador" : "postulante"}
              </span>{" "}
              en PALA.
            </CardDescription>

            <div className="flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm">
              <KeyRound className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="text-muted-foreground">
                Sesion activa como{" "}
                <span className="font-semibold text-foreground">{session.mailUsuario}</span>
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            {errorMessage && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No se pudo completar la operacion</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-950">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Listo</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {rolPendiente === "RECLUTADOR" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rec-nombre">Nombre</Label>
                    <Input
                      id="rec-nombre"
                      value={reclutadorForm.nombreReclutador}
                      onChange={(e) => updateReclutador("nombreReclutador", e.target.value)}
                      placeholder="Juan"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rec-cuil">CUIL</Label>
                    <Input
                      id="rec-cuil"
                      value={reclutadorForm.cuilReclutador}
                      onChange={(e) => updateReclutador("cuilReclutador", e.target.value)}
                      placeholder="20-12345678-9"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rec-descripcion">
                      Descripcion{" "}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                      id="rec-descripcion"
                      value={reclutadorForm.descripcionReclutador}
                      onChange={(e) => updateReclutador("descripcionReclutador", e.target.value)}
                      placeholder="Cargo, empresa o descripcion profesional"
                      className="h-11"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="post-mail-academico" className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      Mail academico
                    </Label>
                    <Input
                      id="post-mail-academico"
                      type="email"
                      value={session.mailUsuario}
                      readOnly
                      className="h-11 bg-muted/40 cursor-not-allowed"
                      aria-readonly="true"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se usa el mail de tu cuenta registrada.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-nombre">Nombre</Label>
                    <Input
                      id="post-nombre"
                      value={postulanteForm.nombrePostulante}
                      onChange={(e) => updatePostulante("nombrePostulante", e.target.value)}
                      placeholder="Juan"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-apellido">Apellido</Label>
                    <Input
                      id="post-apellido"
                      value={postulanteForm.apellidoPostulante}
                      onChange={(e) => updatePostulante("apellidoPostulante", e.target.value)}
                      placeholder="Perez"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-legajo">Legajo academico</Label>
                    <Input
                      id="post-legajo"
                      type="number"
                      min={1}
                      value={postulanteForm.legajoAcademicoPostulante}
                      onChange={(e) => updatePostulante("legajoAcademicoPostulante", e.target.value)}
                      placeholder="12345"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="post-nacimiento">
                      Fecha de nacimiento{" "}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                      id="post-nacimiento"
                      type="date"
                      value={postulanteForm.fechaNacimientoPostulante}
                      onChange={(e) => updatePostulante("fechaNacimientoPostulante", e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="post-mail-personal">
                      Mail personal{" "}
                      <span className="text-muted-foreground font-normal">(opcional)</span>
                    </Label>
                    <Input
                      id="post-mail-personal"
                      type="email"
                      value={postulanteForm.mailPersonalPostulante}
                      onChange={(e) => updatePostulante("mailPersonalPostulante", e.target.value)}
                      placeholder="juan@gmail.com"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="post-tipo-estudiante">Tipo de estudiante</Label>
                    <Select
                      value={postulanteForm.tipoEstudianteId}
                      onValueChange={(v) => updatePostulante("tipoEstudianteId", v)}
                      disabled={tiposLoading}
                    >
                      <SelectTrigger id="post-tipo-estudiante" className="h-11">
                        <SelectValue
                          placeholder={
                            tiposLoading ? "Cargando tipos..." : "Selecciona tu tipo de estudiante"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEstudiante.map((tipo) => (
                          <SelectItem key={tipo.id} value={String(tipo.id)}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {submitting ? "Guardando..." : "Completar perfil"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={handleSalir}
                  disabled={submitting}
                >
                  Cerrar sesion
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <SiteFooter />
    </main>
  )
}
