"use client"

import Link from "next/link"
import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Clock3, ExternalLink, History, Mail, Phone, PlusCircle, UserRound } from "lucide-react"
import { sileo } from "sileo"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { SolicitudAsociacionAdmin } from "@/types/solicitudes-asociacion"
import { EstadoBadge } from "../page"

const fmt = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" })

export default function SolicitudDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [solicitud, setSolicitud] = useState<SolicitudAsociacionAdmin | null>(null)
  const [observacion, setObservacion] = useState("")
  const [error, setError] = useState("")
  const [procesando, setProcesando] = useState(false)
  const [crearEmpresaAbierto, setCrearEmpresaAbierto] = useState(false)
  const [empresaForm, setEmpresaForm] = useState({ descripcionEmpresa: "", direccionEmpresa: "" })

  const cargar = useCallback(async (current: AuthResponse) => {
    const response = await fetch(`/api/pala/solicitudes-asociacion/${id}`, { headers: authHeader(current), cache: "no-store" })
    if (response.status === 401) {
      clearSession(); router.replace("/login")
      throw new Error("La sesión venció. Iniciá sesión nuevamente.")
    }
    const data = await response.json()
    if (!response.ok) throw new Error(data.mensaje ?? "No se pudo cargar la solicitud")
    setSolicitud(data); setObservacion(data.observacionesInternas ?? "")
  }, [id, router])

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some(role => role.toUpperCase() === "ADMINISTRADOR")) { router.replace("/login"); return }
    setSession(current); cargar(current).catch(err => setError(err.message))
  }, [cargar, router])

  async function ejecutar(accion: "tomar" | "aceptar" | "rechazar") {
    if (!session) return
    setProcesando(true); setError("")
    try {
      const response = await fetch(`/api/pala/solicitudes-asociacion/${id}/${accion}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify({ observacionesInternas: observacion }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.mensaje ?? "No se pudo actualizar la solicitud")
      setSolicitud(data)
      sileo.success({ title: accion === "tomar" ? "Solicitud tomada" : accion === "aceptar" ? "Solicitud aceptada" : "Solicitud rechazada" })
    } catch (err) { setError(err instanceof Error ? err.message : "Ocurrió un error") }
    finally { setProcesando(false) }
  }

  async function crearEmpresa() {
    if (!session || !solicitud) return
    setProcesando(true); setError("")
    try {
      const response = await fetch("/api/pala/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify({
          cuitEmpresa: solicitud.empresa.cuit,
          razonSocialEmpresa: solicitud.empresa.razonSocial,
          mailEmpresa: solicitud.empresa.mail,
          telefonoEmpresa: solicitud.empresa.telefono,
          ...empresaForm,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.mensaje ?? "No se pudo crear la empresa")
      setCrearEmpresaAbierto(false)
      await cargar(session)
      sileo.success({ title: "Empresa creada", description: "Ya podés aceptar la solicitud." })
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo crear la empresa") }
    finally { setProcesando(false) }
  }

  if (!session || !solicitud) return error && session ? <AdminShell mail={session.mailUsuario}><p className="text-rose-600">{error}</p></AdminShell> : null

  const finalizada = ["ACEPTADA", "RECHAZADA", "RESUELTA"].includes(solicitud.codigoEstado)
  const puedeCrearEmpresa = session.permisos.includes("ABM_EMPRESA")
  const asunto = encodeURIComponent(`Validación de solicitud de asociación #${solicitud.id}`)
  const cuerpo = encodeURIComponent(`Hola,\n\nNos comunicamos desde PALA para validar una solicitud de asociación con ${solicitud.empresa.razonSocial}.\n\nDatos del reclutador:\nNombre: ${solicitud.reclutador.nombre}\nMail: ${solicitud.reclutador.mail}\nCUIL: ${solicitud.reclutador.cuil}\n\n¿Podrían confirmarnos si esta persona pertenece o está autorizada para publicar avisos laborales en representación de la empresa?\n\nMuchas gracias.`)
  const mailto = `mailto:${solicitud.empresa.mail}?subject=${asunto}&body=${cuerpo}`

  return <AdminShell mail={session.mailUsuario}>
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" className="mb-5 -ml-3 gap-2"><Link href="/admin/solicitudes"><ArrowLeft className="h-4 w-4" />Volver a solicitudes</Link></Button>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-violet-600">Solicitud #{solicitud.id}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{finalizada ? "Detalle de asociación" : "Resolver solicitud"}</h1><p className="mt-2 text-sm text-slate-500">Enviada el {fmt.format(new Date(solicitud.fechaEnvio))}</p></div>
        <EstadoBadge codigo={solicitud.codigoEstado} nombre={solicitud.estado} />
      </header>
      {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-violet-600" />Datos del reclutador</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <Dato label="Nombre" value={solicitud.reclutador.nombre} /><Dato label="CUIL" value={solicitud.reclutador.cuil} /><Dato label="Mail" value={solicitud.reclutador.mail} className="sm:col-span-2" /><Dato label="Descripción" value={solicitud.reclutador.descripcion || "Sin descripción"} className="sm:col-span-2" />
        </CardContent></Card>

        <Card className="border-0 shadow-sm"><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-violet-600" />Empresa solicitada</CardTitle><span className={`rounded-full px-3 py-1 text-xs font-medium ${solicitud.empresa.existente ? "bg-emerald-100 text-emerald-800" : "bg-violet-100 text-violet-800"}`}>{solicitud.empresa.existente ? "Empresa registrada en PALA" : "Empresa propuesta"}</span></div></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <Dato label="Razón social" value={solicitud.empresa.razonSocial} /><Dato label="CUIT" value={solicitud.empresa.cuit} /><Dato label="Mail" value={solicitud.empresa.mail} icon={Mail} /><Dato label="Teléfono" value={solicitud.empresa.telefono} icon={Phone} />
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button asChild variant="outline" className="gap-2"><a href={mailto}><Mail className="h-4 w-4" />Contactar empresa<ExternalLink className="h-3.5 w-3.5" /></a></Button>
            {!solicitud.empresa.existente && puedeCrearEmpresa && <CrearEmpresaDialog abierto={crearEmpresaAbierto} setAbierto={setCrearEmpresaAbierto} solicitud={solicitud} form={empresaForm} setForm={setEmpresaForm} crear={crearEmpresa} procesando={procesando} />}
            {!solicitud.empresa.existente && !puedeCrearEmpresa && <p className="self-center text-xs text-amber-700">Necesitás el permiso ABM_EMPRESA para registrarla.</p>}
          </div>
        </CardContent></Card>
      </div>

      <Card className="mt-5 border-0 shadow-sm"><CardHeader><CardTitle>Gestión de la solicitud</CardTitle></CardHeader><CardContent className="space-y-5">
        <div><Label htmlFor="observaciones">Observaciones internas</Label><Textarea id="observaciones" className="mt-2 min-h-28" value={observacion} onChange={event => setObservacion(event.target.value)} disabled={finalizada} placeholder="Información interna sobre la validación de la empresa..." /></div>
        {solicitud.resueltaPor && <div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-medium">Resuelta por {solicitud.resueltaPor.nombre} {solicitud.resueltaPor.apellido}</p><p className="mt-1 text-slate-500">{solicitud.fechaResolucion ? fmt.format(new Date(solicitud.fechaResolucion)) : "Resolución pendiente"}</p></div>}
        <div className="flex flex-wrap gap-3">
          {solicitud.codigoEstado === "ENVIADA" && <Button onClick={() => ejecutar("tomar")} disabled={procesando}>Tomar solicitud</Button>}
          {solicitud.codigoEstado === "EN_EVALUACION" && <><Button onClick={() => ejecutar("aceptar")} disabled={procesando || !solicitud.empresa.existente} className="bg-emerald-600 hover:bg-emerald-700">Aceptar</Button><Button onClick={() => ejecutar("rechazar")} disabled={procesando} variant="destructive">Rechazar</Button></>}
          <HistorialDialog solicitud={solicitud} />
          {solicitud.codigoEstado === "EN_EVALUACION" && !solicitud.empresa.existente && <span className="self-center text-sm text-amber-700">Creá la empresa antes de aceptar.</span>}
          {finalizada && <span className="self-center text-sm text-slate-500">La solicitud está finalizada y disponible solo para consulta.</span>}
        </div>
      </CardContent></Card>
    </div>
  </AdminShell>
}

type EmpresaForm = { descripcionEmpresa: string; direccionEmpresa: string }

function CrearEmpresaDialog({ abierto, setAbierto, solicitud, form, setForm, crear, procesando }: { abierto: boolean; setAbierto: (value: boolean) => void; solicitud: SolicitudAsociacionAdmin; form: EmpresaForm; setForm: React.Dispatch<React.SetStateAction<EmpresaForm>>; crear: () => void; procesando: boolean }) {
  return <Dialog open={abierto} onOpenChange={setAbierto}><DialogTrigger asChild><Button className="gap-2"><PlusCircle className="h-4 w-4" />Crear empresa</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Crear empresa en PALA</DialogTitle><DialogDescription>Los datos provienen de la solicitud. Podés completar la información adicional.</DialogDescription></DialogHeader>
    <div className="grid gap-4 py-2 sm:grid-cols-2">
      <CampoEmpresa label="Razón social" value={solicitud.empresa.razonSocial} disabled /><CampoEmpresa label="CUIT" value={solicitud.empresa.cuit} disabled /><CampoEmpresa label="Mail" value={solicitud.empresa.mail} disabled /><CampoEmpresa label="Teléfono" value={solicitud.empresa.telefono} disabled />
      <CampoEmpresa label="Dirección" value={form.direccionEmpresa} onChange={value => setForm(prev => ({ ...prev, direccionEmpresa: value }))} className="sm:col-span-2" />
      <div className="sm:col-span-2"><Label htmlFor="descripcion-empresa">Descripción</Label><Textarea id="descripcion-empresa" value={form.descripcionEmpresa} onChange={event => setForm(prev => ({ ...prev, descripcionEmpresa: event.target.value }))} className="mt-2" /></div>
    </div>
    <Button onClick={crear} disabled={procesando}>{procesando ? "Creando..." : "Crear empresa"}</Button>
  </DialogContent></Dialog>
}

function CampoEmpresa({ label, value, disabled = false, className = "", onChange }: { label: string; value: string; disabled?: boolean; className?: string; onChange?: (value: string) => void }) {
  const id = `empresa-${label.toLowerCase().replaceAll(" ", "-")}`
  return <div className={className}><Label htmlFor={id}>{label}</Label><Input id={id} value={value} disabled={disabled} onChange={event => onChange?.(event.target.value)} className="mt-2" /></div>
}

function Dato({ label, value, className = "", icon: Icon }: { label: string; value: string; className?: string; icon?: typeof Mail }) {
  return <div className={className}><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 flex items-center gap-2 text-sm font-medium">{Icon && <Icon className="h-4 w-4 text-slate-400" />}{value}</p></div>
}

function HistorialDialog({ solicitud }: { solicitud: SolicitudAsociacionAdmin }) {
  return <Dialog><DialogTrigger asChild><Button variant="outline" className="gap-2"><History className="h-4 w-4" />Ver historial</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Historial de estados</DialogTitle><DialogDescription>Transiciones registradas para la solicitud #{solicitud.id}.</DialogDescription></DialogHeader><div className="mt-3 space-y-4">
    {solicitud.historial.map((item, index) => <div key={`${item.codigo}-${index}`} className="flex gap-3"><span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"><Clock3 className="h-4 w-4" /></span><div><p className="font-medium">{item.estado}</p><p className="text-sm text-slate-500">Desde {fmt.format(new Date(item.fechaInicio))}</p>{item.fechaFin && <p className="text-sm text-slate-500">Hasta {fmt.format(new Date(item.fechaFin))}</p>}</div></div>)}
  </div></DialogContent></Dialog>
}
