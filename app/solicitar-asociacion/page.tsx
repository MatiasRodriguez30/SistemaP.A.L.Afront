"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Search,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react"

import type { AuthResponse, MessageResponse } from "@/types/auth"
import type {
  EmpresaActivaResponse,
  SolicitudAsociacionCreatePayload,
  SolicitudAsociacionResponse,
} from "@/types/avisos"
import { sileo } from "sileo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authHeader, getSession } from "@/lib/session"

function getMensaje(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>
    const value = record["mensaje"] ?? record["message"] ?? record["error"]
    if (typeof value === "string") return value
  }
  return fallback
}

async function readBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return (await response.json()) as T
  }
  const text = await response.text()
  throw new Error(text || "Error inesperado del servidor")
}

type FormState = SolicitudAsociacionCreatePayload

const emptyForm: FormState = {
  cuitEmpresaSolicitud: "",
  razonSocialEmpresaSolicitud: "",
  mailEmpresaSolicitud: "",
  telefonoEmpresaSolicitud: "",
}

export default function SolicitarAsociacionPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [empresas, setEmpresas] = useState<EmpresaActivaResponse[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const currentSession = getSession()
    if (!currentSession || !currentSession.token) {
      router.replace("/login")
      return
    }
    setSession(currentSession)
  }, [router])

  const puedeSolicitarAsociacion = Boolean(
    session?.permisos.includes("SOLICITAR_ASOCIACION_RECLUTADOR")
  )

  useEffect(() => {
    if (!session || !puedeSolicitarAsociacion) return

    setLoadingEmpresas(true)
    fetch("/api/pala/empresas/activas", {
      headers: authHeader(session),
    })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/login")
          return
        }
        if (!response.ok) throw new Error("No se pudieron cargar las empresas activas")

        const body = (await response.json()) as EmpresaActivaResponse[]
        setEmpresas(body)
      })
      .catch(() => {
        setEmpresas([])
      })
      .finally(() => setLoadingEmpresas(false))
  }, [puedeSolicitarAsociacion, router, session])

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const selectedEmpresa = useMemo(
    () => empresas.find((empresa) => empresa.id === selectedEmpresaId) ?? null,
    [empresas, selectedEmpresaId]
  )

  const empresasFiltradas = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return empresas

    return empresas.filter((empresa) => {
      return (
        empresa.cuitEmpresa.toLowerCase().includes(value) ||
        empresa.razonSocialEmpresa.toLowerCase().includes(value)
      )
    })
  }, [empresas, search])

  const seleccionarEmpresa = (empresa: EmpresaActivaResponse) => {
    setSelectedEmpresaId(empresa.id)
    setManualMode(false)
    setForm({
      cuitEmpresaSolicitud: empresa.cuitEmpresa,
      razonSocialEmpresaSolicitud: empresa.razonSocialEmpresa,
      mailEmpresaSolicitud: "",
      telefonoEmpresaSolicitud: "",
    })
  }

  const abrirFormularioManual = () => {
    setSelectedEmpresaId(null)
    setManualMode(true)
    setForm(emptyForm)
  }

  const volverASeleccion = () => {
    setSelectedEmpresaId(null)
    setManualMode(false)
    setForm(emptyForm)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return

    setSubmitting(true)

    try {
      const response = await fetch("/api/pala/solicitudes-asociacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(session),
        },
        body: JSON.stringify(form),
      })

      const body = await readBody<SolicitudAsociacionResponse | MessageResponse>(response)
      if (!response.ok) {
        throw new Error(getMensaje(body, "No se pudo enviar la solicitud"))
      }

      sileo.success({
        title: "Solicitud enviada con éxito",
        description: "Podrás usar las funcionalidades una vez verificada tu solicitud",
        icon: <CheckCircle2 className="h-4 w-4" />,
        fill: "#f8fff9",
        roundness: 28,
        styles: {
          title: "text-[0.95rem] font-semibold tracking-tight text-emerald-950",
          description: "text-sm leading-5 text-emerald-800",
          badge: "shadow-sm",
          button: "text-xs font-medium",
        },
      })

      setForm(emptyForm)
      router.push("/avisos")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo enviar la solicitud"
      sileo.error({
        title: "No se pudo enviar la solicitud",
        description: message,
        icon: <AlertCircle className="h-4 w-4" />,
        fill: "#fff8f8",
        roundness: 28,
        styles: {
          title: "text-[0.95rem] font-semibold tracking-tight text-rose-950",
          description: "text-sm leading-5 text-rose-700",
          badge: "shadow-sm",
          button: "text-xs font-medium",
        },
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!session) return null

  if (!puedeSolicitarAsociacion) {
    return (
      <main className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Flujo no disponible
            </CardTitle>
            <CardDescription>
              Este flujo se habilita solo para reclutadores con el permiso
              `SOLICITAR_ASOCIACION_RECLUTADOR`.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/avisos")} className="w-full">
              Volver a avisos
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Seleccione la empresa con la que desea asociarse para publicar avisos laborales
          </h1>
          <p className="text-muted-foreground mt-1">
            Primero elegí una empresa activa. Si no la encontrás, podés pedir asociar otra empresa a tu perfil.
          </p>
        </div>

        {!manualMode ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Empresas activas
              </CardTitle>
              <CardDescription>
                Se muestran solo las empresas dadas de alta y sin fecha de baja.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="search-empresa" className="flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-indigo-500" />
                  Buscar empresa
                </Label>
                <Input
                  id="search-empresa"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscá por CUIT o razón social"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={abrirFormularioManual}
                  className="h-11 rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                >
                  Deseo asociar otra empresa a mi perfil
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => router.push("/avisos")}
                >
                  Volver
                </Button>
              </div>

              {loadingEmpresas ? (
                <p className="text-sm text-muted-foreground">Cargando empresas activas...</p>
              ) : empresasFiltradas.length > 0 ? (
                <div className="max-h-[26rem] overflow-y-auto pr-1">
                  <div className="grid gap-3">
                    {empresasFiltradas.map((empresa) => (
                      <button
                        key={empresa.id}
                        type="button"
                        onClick={() => seleccionarEmpresa(empresa)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          selectedEmpresaId === empresa.id
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-border bg-background hover:border-indigo-300 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold">{empresa.razonSocialEmpresa}</p>
                            <p className="text-sm text-muted-foreground">CUIT {empresa.cuitEmpresa}</p>
                          </div>
                          <span className="text-sm font-medium text-indigo-600">Seleccionar</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                  No encontramos empresas con ese criterio.
                </div>
              )}

            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Datos de la empresa
              </CardTitle>
              <CardDescription>
                Si no encontraste tu empresa, completá estos datos para generar la solicitud manualmente.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cuit">CUIT de la empresa</Label>
                    <Input
                      id="cuit"
                      value={form.cuitEmpresaSolicitud}
                      onChange={(e) => updateField("cuitEmpresaSolicitud", e.target.value)}
                      placeholder="20123456789"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Ingresalo sin guiones. El sistema intentará usar una empresa ya cargada si coincide.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="razon-social">
                      Razón social <span className="text-muted-foreground font-normal">(si no existe)</span>
                    </Label>
                    <Input
                      id="razon-social"
                      value={form.razonSocialEmpresaSolicitud}
                      onChange={(e) => updateField("razonSocialEmpresaSolicitud", e.target.value)}
                      placeholder="Empresa SA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mail-empresa" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-500" />
                      Mail de contacto
                    </Label>
                    <Input
                      id="mail-empresa"
                      type="email"
                      value={form.mailEmpresaSolicitud}
                      onChange={(e) => updateField("mailEmpresaSolicitud", e.target.value)}
                      placeholder="contacto@empresa.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono-empresa" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-indigo-500" />
                      Teléfono de contacto
                    </Label>
                    <Input
                      id="telefono-empresa"
                      value={form.telefonoEmpresaSolicitud}
                      onChange={(e) => updateField("telefonoEmpresaSolicitud", e.target.value)}
                      placeholder="2615551234"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:from-indigo-500 hover:to-fuchsia-500"
                  >
                    {submitting ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={volverASeleccion}
                    disabled={submitting}
                  >
                    Volver a seleccionar empresa
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {selectedEmpresa && !manualMode && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="h-5 w-5" />
                Empresa seleccionada
              </CardTitle>
              <CardDescription>
                Se usarán los datos de esta instancia de empresa para crear la solicitud.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Razón social</p>
                    <p className="mt-1 font-semibold">{selectedEmpresa.razonSocialEmpresa}</p>
                  </div>
                  <div className="rounded-xl border bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">CUIT</p>
                    <p className="mt-1 font-semibold">{selectedEmpresa.cuitEmpresa}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-xl border-0 bg-gradient-to-r from-emerald-600 to-lime-600 text-white hover:from-emerald-500 hover:to-lime-500"
                  >
                    {submitting ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                  <Button type="button" variant="outline" className="h-11 rounded-xl" onClick={abrirFormularioManual}>
                    Deseo asociar otra empresa a mi perfil
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
