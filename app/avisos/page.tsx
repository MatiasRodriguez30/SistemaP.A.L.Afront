"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AvisoCard } from "@/components/aviso-card"
import { AvisoDetalle } from "@/components/aviso-detalle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, LogOut, Send, FileText, Paperclip, Sparkles, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostulanteProfileMenu } from "@/components/postulante-profile-menu"
import { NotificationBell } from "@/components/notification-bell"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { sileo } from "sileo"
import type { Aviso, AvisoDetalleApi, AvisoResumenApi } from "@/types/avisos"
import { mapAvisoDetalle, mapAvisoResumen } from "@/lib/avisos-mapper"
import { authHeader, clearSession, getSession, resolverRutaPerfil } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"

type Vista = "lista" | "detalle" | "salir"

export default function VerAvisosPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background p-6"><p className="text-sm text-muted-foreground">Cargando avisos...</p></main>}><VerAvisosContent /></Suspense>
}

function VerAvisosContent() {
  const router = useRouter()
  const avisoInicial = useSearchParams().get("aviso")
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [vista, setVista] = useState<Vista>("lista")
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [avisoActual, setAvisoActual] = useState<Aviso | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mensajeSalida, setMensajeSalida] = useState<string | null>(null)
  const [postulando, setPostulando] = useState(false)
  const [descripcionPostulacion, setDescripcionPostulacion] = useState("")
  const [enviandoPostulacion, setEnviandoPostulacion] = useState(false)
  const [cvAlternativo, setCvAlternativo] = useState<File | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [clasificacionFiltro, setClasificacionFiltro] = useState("TODOS")
  const [carreraFiltro, setCarreraFiltro] = useState("TODOS")
  const [orden, setOrden] = useState<"recientes" | "antiguos">("recientes")
  const [generandoCvIa, setGenerandoCvIa] = useState(false)
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null)
  useEffect(() => {
    const currentSession = getSession()
    if (!currentSession || !currentSession.permisos.includes("VER_AVISOS")) {
      router.replace("/login")
      return
    }
    setSession(currentSession)

    fetch("/api/pala/avisos", { headers: authHeader(currentSession) })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          router.replace("/login")
          return
        }
        if (!response.ok) throw new Error("No se pudieron cargar los avisos")

        const body = (await response.json()) as AvisoResumenApi[]
        setAvisos(body.map(mapAvisoResumen))
        if (avisoInicial) {
          const detalleResponse = await fetch(`/api/pala/avisos/${avisoInicial}`, { headers: authHeader(currentSession) })
          if (detalleResponse.ok) {
            setAvisoActual(mapAvisoDetalle(await detalleResponse.json() as AvisoDetalleApi))
            setVista("detalle")
          }
        }
      })
      .catch(() => setError("No se pudieron cargar los avisos. Intente nuevamente más tarde."))
      .finally(() => setCargando(false))
  }, [router, avisoInicial])

  const puedeSolicitarAsociacion = Boolean(session?.permisos.includes("SOLICITAR_ASOCIACION_RECLUTADOR"))
  const puedePostularse = Boolean(session?.permisos.includes("POSTULARSE_AVISO"))

  const SEPARADOR_CLASIFICACION = "::"

  const clasificacionesDisponibles = useMemo(() => {
    const subTiposPorTipo = new Map<string, Set<string>>()
    for (const aviso of avisos) {
      for (const tipo of aviso.tiposAviso) {
        const subTipos = subTiposPorTipo.get(tipo.nombreTipoAviso) ?? new Set<string>()
        tipo.subTipos.forEach((subTipo) => subTipos.add(subTipo.nombreSubTipoAviso))
        subTiposPorTipo.set(tipo.nombreTipoAviso, subTipos)
      }
    }
    return Array.from(subTiposPorTipo.entries())
      .map(([tipo, subTipos]) => ({ tipo, subTipos: Array.from(subTipos).sort() }))
      .sort((a, b) => a.tipo.localeCompare(b.tipo))
  }, [avisos])

  const carrerasDisponibles = useMemo(
    () => Array.from(new Set(avisos.flatMap((aviso) => aviso.carreras.map((carrera) => carrera.nombreCarrera)))).sort(),
    [avisos],
  )

  const avisosFiltrados = useMemo(() => {
    const [tipoFiltro, subTipoFiltro] =
      clasificacionFiltro === "TODOS" ? [null, null] : clasificacionFiltro.split(SEPARADOR_CLASIFICACION)

    const filtrados = avisos.filter((aviso) => {
      const coincideBusqueda =
        !busqueda.trim() || `${aviso.nombreAviso} ${aviso.empresa.nombreEmpresa}`.toLowerCase().includes(busqueda.trim().toLowerCase())
      const coincideClasificacion =
        !tipoFiltro ||
        aviso.tiposAviso.some(
          (tipo) => tipo.nombreTipoAviso === tipoFiltro && tipo.subTipos.some((subTipo) => subTipo.nombreSubTipoAviso === subTipoFiltro),
        )
      const coincideCarrera = carreraFiltro === "TODOS" || aviso.carreras.some((carrera) => carrera.nombreCarrera === carreraFiltro)
      return coincideBusqueda && coincideClasificacion && coincideCarrera
    })

    return filtrados.sort((a, b) => {
      const diferencia = new Date(a.fechaCierreAviso).getTime() - new Date(b.fechaCierreAviso).getTime()
      return orden === "recientes" ? -diferencia : diferencia
    })
  }, [avisos, busqueda, clasificacionFiltro, carreraFiltro, orden])

  const handleSeleccionarAviso = async (nroAviso: number) => {
    const session = getSession()
    if (!session) {
      router.replace("/login")
      return
    }

    try {
      const response = await fetch(`/api/pala/avisos/${nroAviso}`, { headers: authHeader(session) })
      if (response.status === 401) {
        clearSession()
        router.replace("/login")
        return
      }
      if (!response.ok) throw new Error("No se pudo cargar el detalle del aviso")

      const body = (await response.json()) as AvisoDetalleApi
      setAvisoActual(mapAvisoDetalle(body))
      setVista("detalle")
      setError(null)
    } catch {
      setError("No se pudo cargar el detalle del aviso.")
    }
  }

  const handleRegresar = () => {
    setVista("lista")
    setAvisoActual(null)
  }

  const handlePostular = () => {
    if (!puedePostularse) return
    setDescripcionPostulacion("")
    setCvAlternativo(null)
    if (cvPreviewUrl) URL.revokeObjectURL(cvPreviewUrl)
    setCvPreviewUrl(null)
    setPostulando(true)
  }

  const generarCvIa = async () => {
    if (!session || !avisoActual || generandoCvIa) return
    setGenerandoCvIa(true)
    try {
      const response = await fetch(`/api/pala/postulante/me/avisos/${avisoActual.nroAviso}/cv-ia`, { method: "POST", headers: authHeader(session) })
      if (response.status === 401) throw new Error("La sesión venció. Volvé a iniciar sesión.")
      if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.mensaje ?? "No se pudo potenciar el CV") }
      const blob = await response.blob()
      const archivo = new File([blob], `cv_adaptado_${avisoActual.nroAviso}.pdf`, { type: "application/pdf" })
      if (cvPreviewUrl) URL.revokeObjectURL(cvPreviewUrl)
      setCvAlternativo(archivo)
      setCvPreviewUrl(URL.createObjectURL(blob))
      sileo.success({ title: "CV adaptado generado", description: "Revisalo antes de enviar la postulación." })
    } catch (reason) {
      sileo.error({ title: "No se pudo generar el CV", description: reason instanceof Error ? reason.message : "Intentá nuevamente." })
    } finally { setGenerandoCvIa(false) }
  }

  const handlePrimaryAction = () => {
    if (puedeSolicitarAsociacion) {
      router.push("/solicitar-asociacion")
      return
    }
    handlePostular()
  }

  const enviarPostulacion = async () => {
    if (!session || !avisoActual || !descripcionPostulacion.trim() || enviandoPostulacion) return
    setEnviandoPostulacion(true)
    try {
      const datos = new FormData()
      datos.append("datos", JSON.stringify({
        avisoId: avisoActual.nroAviso,
        descripcionPostulacion: descripcionPostulacion.trim(),
      }))
      if (cvAlternativo) datos.append("cv", cvAlternativo)
      const response = await fetch("/api/pala/postulante/me/postulaciones", {
        method: "POST",
        headers: authHeader(session),
        body: datos,
      })
      const text = await response.text()
      const body = text ? JSON.parse(text) : {}
      if (!response.ok) throw new Error(body.mensaje ?? "No se pudo enviar la postulacion")
      setPostulando(false)
      sileo.success({ title: "Postulacion enviada", description: "Quedo registrada con estado Enviado." })
    } catch (reason) {
      sileo.error({
        title: "No se pudo enviar la postulacion",
        description: reason instanceof Error ? reason.message : "Intente nuevamente.",
      })
    } finally {
      setEnviandoPostulacion(false)
    }
  }

  const handleSalir = () => {
    clearSession()
    setVista("salir")
    setMensajeSalida("Sesion finalizada correctamente.")
    setTimeout(() => router.replace("/login"), 500)
  }

  const rutaPerfil = resolverRutaPerfil(session)

  if (vista === "salir") {
    return (
      <main className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Alert className="max-w-md">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sesion Finalizada</AlertTitle>
          <AlertDescription>{mensajeSalida}</AlertDescription>
        </Alert>
      </main>
    )
  }

  if (vista === "detalle" && avisoActual) {
    return (
      <>
        <AvisoDetalle
          aviso={avisoActual}
          onRegresar={handleRegresar}
          onPrimaryAction={handlePrimaryAction}
          primaryActionLabel={puedeSolicitarAsociacion ? "Asóciate con una empresa" : "Postularse"}
          primaryActionDisabled={!puedeSolicitarAsociacion && !puedePostularse}
        />
        <Dialog open={postulando} onOpenChange={setPostulando}>
          <DialogContent className={cvPreviewUrl ? "sm:max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto" : "sm:max-w-lg"}>
            <DialogHeader>
              <DialogTitle>Postularse a {avisoActual.nombreAviso}</DialogTitle>
              <DialogDescription>
                Presentate brevemente y explicá por qué te interesa esta oportunidad. Se adjuntará el CV guardado en tu perfil.
              </DialogDescription>
            </DialogHeader>

            <div className={cvPreviewUrl ? "grid grid-cols-1 lg:grid-cols-5 gap-6 mt-2" : "space-y-4 mt-2"}>
              {/* Panel Izquierdo: Formulario */}
              <div className={cvPreviewUrl ? "lg:col-span-2 space-y-4 flex flex-col" : "space-y-4"}>
                <div className="space-y-2">
                  <Textarea
                    value={descripcionPostulacion}
                    onChange={(event) => setDescripcionPostulacion(event.target.value.slice(0, 1000))}
                    placeholder="Escribí tu presentación para la empresa..."
                    className={cvPreviewUrl ? "min-h-[160px] resize-none" : "min-h-36 resize-none"}
                    autoFocus
                  />
                  <p className="text-right text-xs text-muted-foreground">{descripcionPostulacion.length}/1000</p>
                </div>
                
                <div className="space-y-3 rounded-xl border p-4 bg-white/50">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-indigo-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">CV para esta postulación</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cvAlternativo ? "Se adjuntará este archivo solamente a esta postulación." : "Se usará una copia del CV guardado en tu perfil."}
                      </p>
                    </div>
                  </div>
                  
                  <Button type="button" variant="outline" className="w-full gap-2 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100" onClick={generarCvIa} disabled={generandoCvIa}>
                    <Sparkles className="h-4 w-4" />{generandoCvIa ? "Analizando perfil y aviso..." : "Potenciar CV con IA para este aviso"}
                  </Button>
                  
                  {cvAlternativo ? (
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border px-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 truncate font-medium">{cvAlternativo.name}</span>
                      <span className="text-xs text-muted-foreground">{(cvAlternativo.size / 1024 / 1024).toFixed(2)} MB</span>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => { setCvAlternativo(null); if (cvPreviewUrl) URL.revokeObjectURL(cvPreviewUrl); setCvPreviewUrl(null) }} title="Remover y usar el CV de mi perfil">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Paperclip className="h-4 w-4" />
                      Adjuntar otro CV
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        onChange={(event) => {
                          const archivo = event.target.files?.[0] ?? null
                          if (archivo && archivo.size > 5 * 1024 * 1024) {
                            sileo.error({ title: "Archivo demasiado grande", description: "El CV no puede superar los 5 MB." })
                            event.target.value = ""
                            return
                          }
                          if (cvPreviewUrl) URL.revokeObjectURL(cvPreviewUrl)
                          setCvPreviewUrl(null)
                          setCvAlternativo(archivo)
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Panel Derecho: Visor de PDF */}
              {cvPreviewUrl && (
                <div className="lg:col-span-3 h-[65vh] lg:h-auto min-h-[500px]">
                  <div className="h-full w-full overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100 shadow-sm flex flex-col">
                    <div className="bg-slate-200 px-3 py-2 text-xs font-medium text-slate-600 border-b border-slate-200 flex items-center justify-between">
                      <span>Vista previa - {cvAlternativo?.name || 'cv_adaptado.pdf'}</span>
                    </div>
                    <iframe title="Vista previa del CV adaptado" src={cvPreviewUrl} className="h-full w-full border-0 flex-1" />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className={cvPreviewUrl ? "sm:mt-2" : "sm:mt-0"}>
              <Button variant="outline" onClick={() => setPostulando(false)} disabled={enviandoPostulacion}>Cancelar</Button>
              <Button onClick={enviarPostulacion} disabled={!descripcionPostulacion.trim() || enviandoPostulacion} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Send className="mr-2 h-4 w-4" />
                {enviandoPostulacion ? "Enviando..." : "Enviar postulación"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 via-fuchsia-500 via-amber-500 to-emerald-500" />

      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image
            src="/logo-pala.jpeg"
            alt="PALA - Plataforma de Acceso Laboral para Alumnos"
            width={120}
            height={60}
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <NotificationBell />
            {rutaPerfil && <PostulanteProfileMenu rutaPerfil={rutaPerfil} />}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSalir}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative max-w-6xl mx-auto p-6 space-y-6">
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/15 via-fuchsia-400/10 to-transparent blur-3xl" />

        <div className="relative space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Avisos disponibles
          </h1>
          <p className="text-muted-foreground mt-1">Explorá oportunidades y revisá el detalle de cada publicación.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!cargando && avisos.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="bg-background pl-9"
                placeholder="Buscar por título o empresa"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </div>
            <Select value={clasificacionFiltro} onValueChange={setClasificacionFiltro}>
              <SelectTrigger className="w-[200px] bg-background"><SelectValue placeholder="Clasificación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas las clasificaciones</SelectItem>
                {clasificacionesDisponibles.map(({ tipo, subTipos }) => (
                  <SelectGroup key={tipo}>
                    <SelectLabel>{tipo}</SelectLabel>
                    {subTipos.map((subTipo) => (
                      <SelectItem key={subTipo} value={`${tipo}${SEPARADOR_CLASIFICACION}${subTipo}`}>
                        {subTipo}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <Select value={carreraFiltro} onValueChange={setCarreraFiltro}>
              <SelectTrigger className="w-[190px] bg-background"><SelectValue placeholder="Carrera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todas las carreras</SelectItem>
                {carrerasDisponibles.map((carrera) => (
                  <SelectItem key={carrera} value={carrera}>{carrera}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={orden} onValueChange={(value) => setOrden(value as "recientes" | "antiguos")}>
              <SelectTrigger className="w-[170px] bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recientes">Más recientes</SelectItem>
                <SelectItem value="antiguos">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {cargando ? (
          <p className="text-muted-foreground">Cargando avisos...</p>
        ) : avisos.length === 0 && !error ? (
          <p className="text-muted-foreground">No hay avisos disponibles por el momento.</p>
        ) : avisosFiltrados.length === 0 ? (
          <p className="text-muted-foreground">Ningún aviso coincide con los filtros seleccionados.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {avisosFiltrados.map((aviso) => (
              <AvisoCard
                key={aviso.nroAviso}
                aviso={aviso}
                onSelect={() => handleSeleccionarAviso(aviso.nroAviso)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
