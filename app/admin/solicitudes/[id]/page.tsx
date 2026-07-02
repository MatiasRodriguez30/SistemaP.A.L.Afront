"use client"

import Link from "next/link"
import { use, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Clock3, History, Mail, Phone, UserRound } from "lucide-react"
import { sileo } from "sileo"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

  const cargar = useCallback(async (current: AuthResponse) => {
    const response = await fetch(`/api/pala/solicitudes-asociacion/${id}`, { headers: authHeader(current), cache: "no-store" })
    if (response.status === 401) {
      clearSession()
      router.replace("/login")
      throw new Error("La sesión venció. Iniciá sesión nuevamente.")
    }
    const data = await response.json()
    if (!response.ok) throw new Error(data.mensaje ?? "No se pudo cargar la solicitud")
    setSolicitud(data); setObservacion(data.observacionesInternas ?? "")
  }, [id])

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some(r => r.toUpperCase() === "ADMINISTRADOR")) { router.replace("/login"); return }
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

  if (!session || !solicitud) return error && session ? <AdminShell mail={session.mailUsuario}><p className="text-rose-600">{error}</p></AdminShell> : null
  const finalizada = ["ACEPTADA", "RECHAZADA", "RESUELTA"].includes(solicitud.codigoEstado)

  return <AdminShell mail={session.mailUsuario}>
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" className="mb-5 -ml-3 gap-2"><Link href="/admin/solicitudes"><ArrowLeft className="h-4 w-4" />Volver a solicitudes</Link></Button>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-violet-600">Solicitud #{solicitud.id}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Detalle de asociación</h1><p className="mt-2 text-sm text-slate-500">Enviada el {fmt.format(new Date(solicitud.fechaEnvio))}</p></div>
        <EstadoBadge codigo={solicitud.codigoEstado} nombre={solicitud.estado} />
      </header>
      {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-violet-600" />Datos del reclutador</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <Dato label="Nombre" value={solicitud.reclutador.nombre} /><Dato label="CUIL" value={solicitud.reclutador.cuil} /><Dato label="Mail" value={solicitud.reclutador.mail} className="sm:col-span-2" /><Dato label="Descripción" value={solicitud.reclutador.descripcion || "Sin descripción"} className="sm:col-span-2" />
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-violet-600" />Empresa solicitada</CardTitle><span className={`rounded-full px-3 py-1 text-xs font-medium ${solicitud.empresa.existente ? "bg-emerald-100 text-emerald-800" : "bg-violet-100 text-violet-800"}`}>{solicitud.empresa.existente ? "Empresa existente" : "Empresa propuesta"}</span></div></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          <Dato label="Razón social" value={solicitud.empresa.razonSocial} /><Dato label="CUIT" value={solicitud.empresa.cuit} /><Dato label="Mail" value={solicitud.empresa.mail} icon={Mail} /><Dato label="Teléfono" value={solicitud.empresa.telefono} icon={Phone} />
        </CardContent></Card>
      </div>

      <Card className="mt-5 border-0 shadow-sm"><CardHeader><CardTitle>Gestión de la solicitud</CardTitle></CardHeader><CardContent className="space-y-5">
        <div><Label htmlFor="observaciones">Observaciones internas</Label><Textarea id="observaciones" className="mt-2 min-h-28" value={observacion} onChange={e => setObservacion(e.target.value)} disabled={finalizada} placeholder="Información interna sobre la validación de la empresa..." /></div>
        {solicitud.resueltaPor && <div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-medium">Resuelta por {solicitud.resueltaPor.nombre} {solicitud.resueltaPor.apellido}</p><p className="mt-1 text-slate-500">{solicitud.fechaResolucion ? fmt.format(new Date(solicitud.fechaResolucion)) : "Resolución pendiente"}</p></div>}
        <div className="flex flex-wrap gap-3">
          {solicitud.codigoEstado === "ENVIADA" && <Button onClick={() => ejecutar("tomar")} disabled={procesando}>Tomar solicitud</Button>}
          {solicitud.codigoEstado === "EN_EVALUACION" && <><Button onClick={() => ejecutar("aceptar")} disabled={procesando} className="bg-emerald-600 hover:bg-emerald-700">Aceptar</Button><Button onClick={() => ejecutar("rechazar")} disabled={procesando} variant="destructive">Rechazar</Button></>}
          <HistorialDialog solicitud={solicitud} />
          {finalizada && <span className="self-center text-sm text-slate-500">La solicitud está finalizada y disponible solo para consulta.</span>}
        </div>
      </CardContent></Card>
    </div>
  </AdminShell>
}

function Dato({ label, value, className = "", icon: Icon }: { label: string; value: string; className?: string; icon?: typeof Mail }) {
  return <div className={className}><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 flex items-center gap-2 text-sm font-medium">{Icon && <Icon className="h-4 w-4 text-slate-400" />}{value}</p></div>
}

function HistorialDialog({ solicitud }: { solicitud: SolicitudAsociacionAdmin }) {
  return <Dialog><DialogTrigger asChild><Button variant="outline" className="gap-2"><History className="h-4 w-4" />Ver historial</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Historial de estados</DialogTitle><DialogDescription>Transiciones registradas para la solicitud #{solicitud.id}.</DialogDescription></DialogHeader><div className="mt-3 space-y-4">
    {solicitud.historial.map((item, index) => <div key={`${item.codigo}-${index}`} className="flex gap-3"><span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"><Clock3 className="h-4 w-4" /></span><div><p className="font-medium">{item.estado}</p><p className="text-sm text-slate-500">Desde {fmt.format(new Date(item.fechaInicio))}</p>{item.fechaFin && <p className="text-sm text-slate-500">Hasta {fmt.format(new Date(item.fechaFin))}</p>}</div></div>)}
  </div></DialogContent></Dialog>
}
