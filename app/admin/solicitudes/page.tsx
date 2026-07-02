"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, CheckCircle2, Clock3, Search, XCircle } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { SolicitudAsociacionAdmin } from "@/types/solicitudes-asociacion"

const fmt = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" })

export default function SolicitudesAdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [solicitudes, setSolicitudes] = useState<SolicitudAsociacionAdmin[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState("TODOS")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some(r => r.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login"); return
    }
    setSession(current)
    fetch("/api/pala/solicitudes-asociacion", { headers: authHeader(current), cache: "no-store" })
      .then(async response => {
        if (response.status === 401) {
          clearSession()
          router.replace("/login")
          throw new Error("La sesión venció. Iniciá sesión nuevamente.")
        }
        const data = await response.json()
        if (!response.ok) throw new Error(data.mensaje ?? "No se pudieron cargar las solicitudes")
        setSolicitudes(data)
      })
      .catch(err => setError(err.message))
  }, [router])

  const filtradas = useMemo(() => solicitudes.filter(item => {
    const q = busqueda.trim().toLowerCase()
    const coincide = !q || `${item.id} ${item.reclutador.nombre} ${item.empresa.razonSocial} ${item.empresa.cuit}`.toLowerCase().includes(q)
    const fecha = new Date(item.fechaEnvio).getTime()
    return coincide && (estado === "TODOS" || item.codigoEstado === estado)
      && (!desde || fecha >= new Date(`${desde}T00:00:00`).getTime())
      && (!hasta || fecha <= new Date(`${hasta}T23:59:59`).getTime())
  }), [solicitudes, busqueda, estado, desde, hasta])

  if (!session) return null
  const cards = [
    ["Pendientes", solicitudes.filter(s => s.codigoEstado === "ENVIADA").length, Clock3, "text-amber-600", "bg-amber-50"],
    ["En evaluación", solicitudes.filter(s => s.codigoEstado === "EN_EVALUACION").length, CalendarDays, "text-blue-600", "bg-blue-50"],
    ["Aceptadas", solicitudes.filter(s => s.codigoEstado === "ACEPTADA").length, CheckCircle2, "text-emerald-600", "bg-emerald-50"],
    ["Rechazadas", solicitudes.filter(s => s.codigoEstado === "RECHAZADA").length, XCircle, "text-rose-600", "bg-rose-50"],
  ] as const

  return <AdminShell mail={session.mailUsuario}>
    <header className="mb-8">
      <p className="text-sm font-medium text-violet-600">Gestión administrativa</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Solicitudes de asociación</h1>
      <p className="mt-2 text-sm text-slate-500">Revisá las solicitudes de los reclutadores y su estado actual.</p>
    </header>

    {error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon, color, bg]) => <Card key={label} className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold">{value}</p></div>
          <span className={`rounded-2xl p-3 ${bg} ${color}`}><Icon className="h-5 w-5" /></span>
        </CardContent>
      </Card>)}
    </section>

    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle>Solicitudes recientes</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_190px_160px_160px]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input value={busqueda} onChange={e => setBusqueda(e.target.value)} className="pl-9" placeholder="Reclutador, empresa, CUIT o número" /></div>
          <Select value={estado} onValueChange={setEstado}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem><SelectItem value="ENVIADA">Enviada</SelectItem><SelectItem value="EN_EVALUACION">En evaluación</SelectItem><SelectItem value="ACEPTADA">Aceptada</SelectItem><SelectItem value="RECHAZADA">Rechazada</SelectItem><SelectItem value="RESUELTA">Resuelta</SelectItem>
          </SelectContent></Select>
          <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} aria-label="Fecha desde" />
          <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} aria-label="Fecha hasta" />
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["N.º", "Fecha de envío", "Reclutador", "Empresa", "CUIT", "Estado", "Acción"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y">{filtradas.map(s => <tr key={s.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-4 font-semibold">#{s.id}</td><td className="px-4 py-4 text-slate-600">{fmt.format(new Date(s.fechaEnvio))}</td><td className="px-4 py-4">{s.reclutador.nombre}</td><td className="px-4 py-4">{s.empresa.razonSocial}</td><td className="px-4 py-4 text-slate-600">{s.empresa.cuit}</td><td className="px-4 py-4"><EstadoBadge codigo={s.codigoEstado} nombre={s.estado} /></td>
              <td className="px-4 py-4"><Button asChild size="sm" variant="outline"><Link href={`/admin/solicitudes/${s.id}`}>Ver detalle</Link></Button></td>
            </tr>)}</tbody>
          </table>
          {!filtradas.length && <p className="p-10 text-center text-sm text-slate-500">No hay solicitudes que coincidan con los filtros.</p>}
        </div>
      </CardContent>
    </Card>
  </AdminShell>
}

export function EstadoBadge({ codigo, nombre }: { codigo: string; nombre: string }) {
  const styles: Record<string, string> = { ENVIADA: "bg-amber-100 text-amber-800", EN_EVALUACION: "bg-blue-100 text-blue-800", ACEPTADA: "bg-emerald-100 text-emerald-800", RECHAZADA: "bg-rose-100 text-rose-800", RESUELTA: "bg-slate-200 text-slate-700" }
  return <Badge className={`${styles[codigo] ?? styles.RESUELTA} border-0`}>{nombre}</Badge>
}
