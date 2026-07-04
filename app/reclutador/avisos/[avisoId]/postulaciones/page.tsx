"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CalendarClock, CalendarRange, Check, FileText, Mail, Search, UserCheck, Users, Video, XCircle } from "lucide-react"
import { sileo } from "sileo"
import { ReclutadorShell } from "@/components/reclutador-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { AvisoGestion } from "@/types/aviso-gestion"
import type { ReclutadorActual } from "@/types/aviso-form"
import type { PostulacionReclutador } from "@/types/postulacion-reclutador"

const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" })
function esEnlaceHttpValido(valor: string) {
  try {
    const url = new URL(valor)
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname)
  } catch {
    return false
  }
}

const tonos: Record<string, string> = {
  ENVIADO: "bg-blue-100 text-blue-800",
  CITADO: "bg-amber-100 text-amber-800",
  ACEPTADO: "bg-emerald-100 text-emerald-800",
  RECHAZADO: "bg-rose-100 text-rose-800",
  CANCELADO: "bg-slate-200 text-slate-700",
}

export default function PostulacionesAvisoPage() {
  const router = useRouter()
  const { avisoId } = useParams<{ avisoId: string }>()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [reclutador, setReclutador] = useState<ReclutadorActual | null>(null)
  const [aviso, setAviso] = useState<AvisoGestion | null>(null)
  const [postulaciones, setPostulaciones] = useState<PostulacionReclutador[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState("TODOS")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")
  const [revision, setRevision] = useState<PostulacionReclutador | null>(null)
  const [cvUrl, setCvUrl] = useState("")
  const [cargandoCv, setCargandoCv] = useState(false)
  const [accion, setAccion] = useState<"citar"|"aceptar"|"rechazar"|null>(null)
  const [fechaReunion, setFechaReunion] = useState("")
  const [enlaceReunion, setEnlaceReunion] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [resolviendo, setResolviendo] = useState(false)

  useEffect(() => {
    const actual = getSession()
    if (!actual || !actual.permisos.includes("VER_POSTULACIONES_AVISO")) {
      router.replace("/reclutador/avisos")
      return
    }
    setSession(actual)
    ;(async () => {
      try {
        const meResponse = await fetch("/api/pala/reclutador/me", { headers: authHeader(actual), cache: "no-store" })
        if (meResponse.status === 401) {
          clearSession()
          router.replace("/login")
          return
        }
        const me = await meResponse.json() as ReclutadorActual
        if (!meResponse.ok) throw new Error("No se pudo identificar al reclutador")
        setReclutador(me)
        const [avisoResponse, postulacionesResponse] = await Promise.all([
          fetch(`/api/pala/reclutadores/${me.id}/avisos/${avisoId}`, { headers: authHeader(actual), cache: "no-store" }),
          fetch(`/api/pala/reclutadores/${me.id}/avisos/${avisoId}/postulaciones`, { headers: authHeader(actual), cache: "no-store" }),
        ])
        const avisoText = await avisoResponse.text()
        const postulacionesText = await postulacionesResponse.text()
        const avisoBody = avisoText && avisoResponse.headers.get("content-type")?.includes("application/json")
          ? JSON.parse(avisoText) : {}
        const postulacionesBody = postulacionesText && postulacionesResponse.headers.get("content-type")?.includes("application/json")
          ? JSON.parse(postulacionesText) : []
        if (!avisoResponse.ok) throw new Error(avisoBody.mensaje ?? "No se pudo cargar el aviso")
        if (!postulacionesResponse.ok) throw new Error(postulacionesBody.mensaje ?? "No se pudieron cargar las postulaciones")
        setAviso(avisoBody)
        setPostulaciones(postulacionesBody)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "No se pudo cargar la información")
      } finally {
        setCargando(false)
      }
    })()
  }, [avisoId, router])

  const filtradas = useMemo(() => postulaciones.filter(postulacion => {
    const dia = postulacion.fechaPostulacion.slice(0, 10)
    const texto = `${postulacion.nombrePostulante} ${postulacion.apellidoPostulante} ${postulacion.mailPostulante}`.toLowerCase()
    return (estado === "TODOS" || postulacion.codigoEstado === estado)
      && (!desde || dia >= desde) && (!hasta || dia <= hasta)
      && (!busqueda.trim() || texto.includes(busqueda.toLowerCase()))
  }), [postulaciones, estado, desde, hasta, busqueda])

  const metricas = useMemo(() => ({
    total: postulaciones.length,
    enviadas: postulaciones.filter(p => p.codigoEstado === "ENVIADO").length,
    citadas: postulaciones.filter(p => p.codigoEstado === "CITADO").length,
    aceptadas: postulaciones.filter(p => p.codigoEstado === "ACEPTADO").length,
  }), [postulaciones])

  async function revisar(postulacion: PostulacionReclutador) {
    if (!session || !reclutador) return
    if (cvUrl) URL.revokeObjectURL(cvUrl)
    setCvUrl("")
    setRevision(postulacion)
    setCargandoCv(true)
    const response = await fetch(
      `/api/pala/reclutadores/${reclutador.id}/avisos/${avisoId}/postulaciones/${postulacion.id}/cv`,
      { headers: authHeader(session) },
    )
    if (!response.ok) {
      sileo.error({ title: "No se pudo abrir el CV" })
      setCargandoCv(false)
      return
    }
    setCvUrl(URL.createObjectURL(await response.blob()))
    setCargandoCv(false)
  }

  function cerrarRevision() {
    if (cvUrl) URL.revokeObjectURL(cvUrl)
    setCvUrl("")
    setRevision(null)
  }

  function iniciarAccion(nuevaAccion:"citar"|"aceptar"|"rechazar") {
    setAccion(nuevaAccion); setFechaReunion(""); setEnlaceReunion(""); setMensaje("")
  }

  async function resolverPostulacion() {
    if (!session || !reclutador || !revision || !accion) return
    setResolviendo(true)
    try {
      const body = accion === "citar"
        ? { fechaReunion: new Date(fechaReunion).toISOString(), enlaceReunion, mensaje }
        : { mensaje }
      const response = await fetch(`/api/pala/reclutadores/${reclutador.id}/avisos/${avisoId}/postulaciones/${revision.id}/${accion}`, {
        method:"PATCH", headers:{...authHeader(session),"Content-Type":"application/json"}, body:JSON.stringify(body),
      })
      const text=await response.text(), resultado=text?JSON.parse(text):{}
      if(!response.ok) throw new Error(resultado.mensaje??"No se pudo actualizar la postulacion")
      setPostulaciones(actuales=>actuales.map(item=>item.id===resultado.id?resultado:item))
      setRevision(resultado); setAccion(null)
      sileo.success({title:accion==="citar"?"Entrevista solicitada":accion==="aceptar"?"Postulacion aceptada":"Postulacion rechazada",description:"El cambio quedo registrado y se preparo la notificacion por correo."})
    } catch(reason) {
      sileo.error({title:"No se pudo resolver la postulacion",description:reason instanceof Error?reason.message:"Intente nuevamente"})
    } finally { setResolviendo(false) }
  }

  if (!session) return null
  return <ReclutadorShell mail={session.mailUsuario}>
    <Button asChild variant="ghost" className="mb-5 -ml-3"><Link href="/reclutador/avisos"><ArrowLeft className="mr-2 h-4 w-4"/>Volver a mis avisos</Link></Button>
    <header className="mb-7"><p className="text-sm font-medium text-violet-600">Postulaciones recibidas</p><h1 className="mt-1 text-3xl font-semibold">{aviso?.nombreAviso ?? "Aviso"}</h1><p className="mt-2 text-sm text-slate-500">Revisá las personas interesadas y el CV enviado en cada postulación.</p></header>
    {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{label:"Total",value:metricas.total,Icon:Users,color:"text-violet-600"},{label:"Nuevas",value:metricas.enviadas,Icon:Mail,color:"text-blue-600"},{label:"Citadas",value:metricas.citadas,Icon:CalendarRange,color:"text-amber-600"},{label:"Aceptadas",value:metricas.aceptadas,Icon:UserCheck,color:"text-emerald-600"}].map(({label,value,Icon,color})=><Card key={label} className="shadow-none"><CardContent className="flex items-center gap-3 p-4"><Icon className={`h-5 w-5 ${color}`}/><div><p className="text-2xl font-semibold">{value}</p><p className="text-xs text-slate-500">{label}</p></div></CardContent></Card>)}
    </div>
    <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_170px_170px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input className="bg-white pl-9" placeholder="Buscar por nombre o correo" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div><Select value={estado} onValueChange={setEstado}><SelectTrigger className="bg-white"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="TODOS">Todos los estados</SelectItem>{["ENVIADO","CITADO","ACEPTADO","RECHAZADO","CANCELADO"].map(item=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Input type="date" aria-label="Postulaciones desde" className="bg-white" value={desde} onChange={e=>setDesde(e.target.value)}/><Input type="date" aria-label="Postulaciones hasta" className="bg-white" min={desde||undefined} value={hasta} onChange={e=>setHasta(e.target.value)}/></div>
    {cargando ? <div className="h-48 animate-pulse rounded-2xl bg-slate-200"/> : filtradas.length === 0 ? <Card className="border-dashed shadow-none"><CardContent className="py-14 text-center"><Users className="mx-auto h-8 w-8 text-slate-300"/><h2 className="mt-3 font-semibold">No hay postulaciones para mostrar</h2><p className="mt-1 text-sm text-slate-500">Todavía no se recibieron postulaciones o ninguna coincide con los filtros.</p></CardContent></Card> : <div className="space-y-3">{filtradas.map(postulacion=><Card key={postulacion.id} className="shadow-sm"><CardContent className="grid items-center gap-4 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(260px,1.5fr)_150px_140px]"><div className="min-w-0"><h2 className="truncate font-semibold">{postulacion.nombrePostulante} {postulacion.apellidoPostulante}</h2><p className="mt-1 truncate text-sm text-slate-500">{postulacion.mailPostulante}</p></div><p className="line-clamp-2 text-sm leading-5 text-slate-600">{postulacion.descripcionPostulacion}</p><div><p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado actual</p><Badge className={`border-0 ${tonos[postulacion.codigoEstado]??tonos.CANCELADO}`}>{postulacion.nombreEstado}</Badge></div><div className="flex items-center justify-between gap-3 md:justify-end"><span className="whitespace-nowrap text-xs text-slate-500">{fecha.format(new Date(postulacion.fechaPostulacion))}</span><Button size="sm" onClick={()=>revisar(postulacion)}>Revisar</Button></div></CardContent></Card>)}</div>}
    <Dialog open={Boolean(revision)} onOpenChange={open=>!open&&cerrarRevision()}><DialogContent className="h-[88vh] max-w-[95vw] overflow-hidden p-0 sm:max-w-6xl"><div className="grid h-full min-h-0 lg:grid-cols-[340px_1fr]"><aside className="flex min-h-0 flex-col overflow-y-auto border-r bg-slate-50 p-6"><DialogHeader><div><p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Estado actual</p><Badge className={`border-0 ${tonos[revision?.codigoEstado??"CANCELADO"]}`}>{revision?.nombreEstado}</Badge></div><DialogTitle className="pt-4 text-xl">{revision?.nombrePostulante} {revision?.apellidoPostulante}</DialogTitle><DialogDescription>{revision?.mailPostulante}</DialogDescription></DialogHeader><div className="mt-6 space-y-5"><section><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Presentación</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{revision?.descripcionPostulacion}</p></section><section className="border-t pt-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Fecha de postulación</p><p className="mt-2 text-sm">{revision&&fecha.format(new Date(revision.fechaPostulacion))}</p></section><section className="border-t pt-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">Archivo enviado</p><p className="mt-2 break-all text-sm">{revision?.nombreCv}</p></section></div><div className="mt-auto flex gap-2 border-t pt-4">{revision?.codigoEstado==="ENVIADO"&&session.permisos.includes("CITAR_POSTULACION")&&<Button className="flex-1" onClick={()=>iniciarAccion("citar")}><CalendarClock className="mr-2 h-4 w-4"/>Citar</Button>}{revision?.codigoEstado==="CITADO"&&session.permisos.includes("ACEPTAR_POSTULACION")&&<Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={()=>iniciarAccion("aceptar")}><Check className="mr-2 h-4 w-4"/>Aceptar</Button>}{["ENVIADO","CITADO"].includes(revision?.codigoEstado??"")&&session.permisos.includes("RECHAZAR_POSTULACION")&&<Button variant="outline" className="flex-1 text-rose-600" onClick={()=>iniciarAccion("rechazar")}><XCircle className="mr-2 h-4 w-4"/>Rechazar</Button>}</div></aside><main className="min-h-0 bg-slate-200 p-4"><div className="h-full overflow-hidden rounded-lg bg-white shadow-sm">{cargandoCv?<div className="flex h-full items-center justify-center text-sm text-slate-500">Cargando vista previa del CV...</div>:cvUrl?<iframe src={cvUrl} title={`CV de ${revision?.nombrePostulante}`} className="h-full w-full"/>:<div className="flex h-full items-center justify-center text-sm text-slate-500"><FileText className="mr-2 h-5 w-5"/>No se pudo mostrar el CV</div>}</div></main></div></DialogContent></Dialog>
    <Dialog open={Boolean(accion)} onOpenChange={open=>!open&&setAccion(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{accion==="citar"?"Solicitar entrevista":accion==="aceptar"?"Aceptar postulación":"Rechazar postulación"}</DialogTitle><DialogDescription>{accion==="citar"?"Ingresá los datos que recibirá el postulante por correo.":"Podés agregar un mensaje personalizado para el postulante."}</DialogDescription></DialogHeader><div className="space-y-4">{accion==="citar"&&<><div className="space-y-2"><Label htmlFor="fecha-reunion">Fecha y hora</Label><Input id="fecha-reunion" type="datetime-local" min={new Date().toISOString().slice(0,16)} value={fechaReunion} onChange={e=>setFechaReunion(e.target.value)}/></div><div className="space-y-2"><Label htmlFor="enlace-reunion">Enlace de reunión</Label><div className="relative"><Video className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input id="enlace-reunion" className="pl-9" type="url" placeholder="https://meet.google.com/..." value={enlaceReunion} onChange={e=>setEnlaceReunion(e.target.value)}/></div>{enlaceReunion&&!esEnlaceHttpValido(enlaceReunion)&&<p className="text-sm text-rose-600">Ingresá un enlace completo, por ejemplo https://meet.google.com/abc-defg-hij</p>}</div></>}<div className="space-y-2"><Label htmlFor="mensaje-resolucion">Mensaje del reclutador {accion==="citar"?"(opcional)":""}</Label><Textarea id="mensaje-resolucion" className="min-h-28" maxLength={2000} placeholder={accion==="rechazar"?"Agradecemos tu interés...":"Información adicional para el postulante..."} value={mensaje} onChange={e=>setMensaje(e.target.value)}/><p className="text-right text-xs text-slate-400">{mensaje.length}/2000</p></div></div><DialogFooter><Button variant="outline" onClick={()=>setAccion(null)} disabled={resolviendo}>Cancelar</Button><Button onClick={resolverPostulacion} disabled={resolviendo||(accion==="citar"&&(!fechaReunion||!esEnlaceHttpValido(enlaceReunion)))} className={accion==="rechazar"?"bg-rose-600 hover:bg-rose-700":""}>{resolviendo?"Procesando...":accion==="citar"?"Enviar citación":accion==="aceptar"?"Confirmar aceptación":"Confirmar rechazo"}</Button></DialogFooter></DialogContent></Dialog>
  </ReclutadorShell>
}
