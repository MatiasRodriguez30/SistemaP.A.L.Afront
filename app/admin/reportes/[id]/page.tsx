"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, Download, GraduationCap, Lock, PauseCircle, Pencil, Trash2, Unlock, Users } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { authHeader, clearSession, getSession } from "@/lib/session"
import { agruparCompetencias, agruparPorNombre, mapConteoPorCarrera, valorUnico } from "@/lib/reportes-mapper"
import type { AuthResponse } from "@/types/auth"
import type { Reporte } from "@/types/reportes"

const numberFormat = new Intl.NumberFormat("es-AR")
const fechaFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" })
const COLORES = [
  "#7D3AED", // color principal
  "#400E95",
  "#B794F5",
  "#2E0A6B",
  "#9B6AF1",
  "#6316E9",
  "#D3BEF9",
  "#5112BF",
  "#EFE8FD",
]

const ESTADOS_AVISO = [
  { nombre: "Borrador", metrica: "AvisosBorradores", icon: Pencil, tone: "bg-yellow-50 text-yellow-600" },
  { nombre: "Abierto", metrica: "AvisosAbiertos", icon: Unlock, tone: "bg-emerald-50 text-emerald-600" },
  { nombre: "Pausado", metrica: "AvisosPausados", icon: PauseCircle, tone: "bg-violet-50 text-violet-600" },
  { nombre: "Cerrado", metrica: "AvisosCerrados", icon: Lock, tone: "bg-blue-50 text-blue-600" },
  { nombre: "Cancelado", metrica: "AvisosCancelados", icon: Trash2, tone: "bg-rose-50 text-rose-600" },
] as const

export default function ReporteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [error, setError] = useState("")
  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login")
      return
    }
    setSession(current)
    fetch(`/api/pala/admin/reportes/${id}`, { headers: authHeader(current), cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) { clearSession(); router.replace("/login"); return null }
        const body = await response.json()
        if (!response.ok) throw new Error(body.mensaje ?? "No se pudo cargar el reporte")
        return body as Reporte
      })
      .then(setReporte)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudo cargar el reporte"))
  }, [id, router])

  const grupos = useMemo(() => (reporte ? agruparPorNombre(reporte.metricas) : {}), [reporte])
  const postulantesPorCarrera = useMemo(() => mapConteoPorCarrera(grupos, "PostulantesPorCarrera"), [grupos])
  const aceptadosPorCarrera = useMemo(() => mapConteoPorCarrera(grupos, "AceptadosPorCarrera"), [grupos])
  const competencias = useMemo(() => agruparCompetencias(grupos), [grupos])
  const postulantesTotales = valorUnico(grupos, "PostulantesTotales")
  const totalUsuarios = valorUnico(grupos, "UsuariosTotales")
  const totalReclutadores = valorUnico(grupos, "ReclutadoresTotales")
  const maximoCarrera = Math.max(0, ...postulantesPorCarrera.map((item) => item.cantidad))
  const totalAvisos = useMemo(
    () => ESTADOS_AVISO.reduce((acc, { metrica }) => acc + valorUnico(grupos, metrica), 0),
    [grupos],
  )

  if (!session) return null

  const cards = [
    { 
      label: "Usuarios totales", 
      value: totalUsuarios, 
      porcentaje: 100,
      detail: "Reclutadores + postulantes",
      icon: Users, 
      tone: "bg-sky-50 text-sky-600" 
    },
    { 
      label: "Reclutadores", 
      value: totalReclutadores, 
      porcentaje: totalUsuarios > 0 ? Math.round((totalReclutadores / totalUsuarios) * 100) : 0,
      detail: "Solo los reclutadores que han sido validados en una Empresa la cual representan",
      icon: BriefcaseBusiness, 
      tone: "bg-amber-50 text-amber-600" 
    },
    { 
      label: "Postulantes", 
      value: postulantesTotales, 
      porcentaje: totalUsuarios > 0 ? Math.round((postulantesTotales / totalUsuarios) * 100) : 0,
      detail: "Estudiantes y graduados",
      icon: GraduationCap, 
      tone: "bg-violet-50 text-violet-600" 
    },
  ]

  const chartConfigAceptados: ChartConfig = Object.fromEntries(
    aceptadosPorCarrera.map((item, i) => [item.carrera, { label: item.carrera, color: COLORES[i % COLORES.length] }]),
  )

  return (
    <AdminShell mail={session.mailUsuario}>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link href="/admin/reportes" className="mb-2 flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600 print:hidden">
            <ArrowLeft className="h-4 w-4" /> Volver al historial
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {reporte ? `Reporte N° ${reporte.idReporte}` : "Cargando reporte..."}
          </h1>
          {reporte && (
            <p className="mt-1 text-sm text-slate-500">
              {fechaFormat.format(new Date(reporte.fechaHora))} · Generado por {reporte.administradorGenerador}
            </p>
          )}
        </div>
        <Button onClick={() => window.print()} disabled={!reporte} className="print:hidden">
          <Download className="h-4 w-4" /> Guardar PDF
        </Button>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {reporte && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-sm font-semibold">1. Cantidad de usuarios</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {cards.map(({ label, value, porcentaje, detail, icon: Icon, tone }) => (
                <Card key={label} className="border-slate-200 shadow-sm">
                  <CardContent className="flex items-start gap-4 p-6">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                    <div className="flex-1">
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                        {numberFormat.format(value)}
                        <span className="ml-2 text-base font-normal text-slate-500">({porcentaje}%)</span>
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{detail}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base">Postulantes por carrera</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              {postulantesPorCarrera.map((item, index) => {
                const porc = postulantesTotales > 0 ? Math.round((item.cantidad / postulantesTotales) * 100) : 0
                const colorBarra = COLORES[index % COLORES.length]
                return (
                  <div key={item.carrera}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{item.carrera}</span>
                      <span className="text-slate-500">
                        <b className="mr-1 font-semibold text-slate-800">{numberFormat.format(item.cantidad)}</b>
                        ({porc}%)
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div 
                        className="h-full rounded-full transition-[width]" 
                        style={{ 
                          width: `${maximoCarrera > 0 ? (item.cantidad / maximoCarrera) * 100 : 0}%`,
                          backgroundColor: colorBarra 
                        }} 
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-4 text-sm font-semibold">2. Avisos según estado</h2>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {ESTADOS_AVISO.map(({ nombre, metrica, icon: Icon, tone }) => {
                const cantidad = valorUnico(grupos, metrica)
                const porc = totalAvisos > 0 ? Math.round((cantidad / totalAvisos) * 100) : 0
                return (
                  <Card key={metrica} className="border-slate-200 shadow-sm">
                    <CardContent className="flex items-center gap-3.5 p-5">
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm text-slate-500">{nombre}</p>
                        <p className="mt-0.5 text-xl font-semibold tabular-nums">
                          {numberFormat.format(cantidad)}
                          {totalAvisos > 0 && <span className="ml-1.5 text-xs font-normal text-slate-500">({porc}%)</span>}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="text-base">Postulantes aceptados por carrera</CardTitle></CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfigAceptados} className="mx-auto max-h-80">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={aceptadosPorCarrera} dataKey="cantidad" nameKey="carrera" innerRadius={60} outerRadius={110}>
                    {aceptadosPorCarrera.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <section className="space-y-6">
            <h2 className="text-sm font-semibold">Competencias más buscadas</h2>
            {competencias.map((grupo) => (
              <Card key={grupo.tipoAviso} className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-base">{grupo.tipoAviso}</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={{ cantidad: { label: "Cantidad", color: "#7c3aed" } }} className="max-h-72 w-full">
                    <BarChart data={grupo.items}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="subTipo" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cantidad" radius={4}>
                        {grupo.items.map((_, i) => (
                          <Cell key={i} fill={COLORES[i % COLORES.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      )}
    </AdminShell>
  )
}