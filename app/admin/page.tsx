"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, BriefcaseBusiness, CalendarDays, GraduationCap, Users } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { DashboardAdmin } from "@/types/dashboard"

const numberFormat = new Intl.NumberFormat("es-AR")
const COLORES = [
  "#7D3AED",
  "#400E95",
  "#B794F5",
  "#2E0A6B",
  "#9B6AF1",
  "#6316E9",
  "#D3BEF9",
  "#5112BF",
  "#EFE8FD",
]

export default function AdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [dashboard, setDashboard] = useState<DashboardAdmin | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login")
      return
    }

    setSession(current)
    fetch("/api/pala/admin/dashboard", { headers: authHeader(current), cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          clearSession()
          router.replace("/login")
          throw new Error("La sesión venció. Iniciá sesión nuevamente.")
        }
        const body = await response.json()
        if (!response.ok) throw new Error(body.mensaje ?? "No se pudieron cargar los reportes")
        setDashboard(body)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudieron cargar los reportes"))
  }, [router])

  const maximo = useMemo(
    () => Math.max(0, ...(dashboard?.postulantesPorCarrera.map((item) => item.cantidad) ?? [])),
    [dashboard],
  )

  if (!session) return null

  const cards = [
    { label: "Usuarios totales", value: dashboard?.usuariosTotales, detail: "Reclutadores + postulantes", icon: Users, tone: "bg-sky-50 text-sky-600" },
    { label: "Reclutadores", value: dashboard?.reclutadores, detail: "Todos los reclutadores que se han registrado", icon: BriefcaseBusiness, tone: "bg-amber-50 text-amber-600" },
    { label: "Postulantes", value: dashboard?.postulantes, detail: "Estudiantes y graduados", icon: GraduationCap, tone: "bg-violet-50 text-violet-600" },
  ]

  return (
    <AdminShell mail={session.mailUsuario}>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Visualizar reportes</h1>
            <p className="mt-1 text-sm text-slate-500">Panel general de usuarios de la plataforma.</p>
          </div>
        </div>
        <span className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
          <CalendarDays className="h-4 w-4 text-violet-600" /> Datos actuales
        </span>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <section aria-labelledby="usuarios-heading">
        <h2 id="usuarios-heading" className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-600 text-[11px] text-white">1</span>
          Cantidad de usuarios
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(({ label, value, detail, icon: Icon, tone }) => (
            <Card key={label} className="border-slate-200 shadow-sm">
              <CardContent className="flex items-center gap-4 p-6">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums">{value === undefined ? "—" : numberFormat.format(value)}</p>
                  <p className="mt-1 text-xs text-slate-400">{detail}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="mt-8 border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-violet-600" /> Postulantes por carrera
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!dashboard ? (
            <div className="space-y-5" aria-label="Cargando estadísticas">
              {[72, 51, 64, 42].map((width) => <div key={width} className="h-10 animate-pulse rounded-lg bg-slate-100" style={{ width: `${width}%` }} />)}
            </div>
          ) : dashboard.postulantesPorCarrera.length === 0 ? (
            <div className="rounded-xl border border-dashed py-12 text-center text-sm text-slate-500">Todavía no hay postulantes asociados a carreras activas.</div>
          ) : (
            <div className="space-y-5">
              {dashboard.postulantesPorCarrera.map((item, index) => {
                const porcentaje = dashboard.postulantes > 0 ? Math.round((item.cantidad / dashboard.postulantes) * 100) : 0
                const ancho = maximo > 0 ? Math.max(2, (item.cantidad / maximo) * 100) : 0
                const colorBarra = COLORES[index % COLORES.length]
                return (
                  <div key={item.carrera}>
                    <div className="mb-2 flex items-end justify-between gap-4 text-sm">
                      <span className="font-medium text-slate-700">{item.carrera}</span>
                      <span className="shrink-0 text-xs text-slate-500"><b className="mr-2 text-slate-800">{numberFormat.format(item.cantidad)}</b>{porcentaje}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full transition-[width]" style={{ width: `${ancho}%`, backgroundColor: colorBarra }} />
                    </div>
                  </div>
                )
              })}
              <p className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                {dashboard.postulantesPorCarrera.length} carreras con postulantes activos. Una persona puede estar asociada a más de una carrera.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  )
}
