"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, FileText, Loader2, Plus } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { Reporte } from "@/types/reportes"

const fechaFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" })

export default function ReportesAdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login")
      return
    }
    if (!current.permisos.includes("VISUALIZAR_REPORTES")) {
      setSession(current)
      setError("No tenés el permiso VISUALIZAR_REPORTES.")
      setCargando(false)
      return
    }
    setSession(current)
    fetch("/api/pala/admin/reportes", { headers: authHeader(current), cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) { clearSession(); router.replace("/login"); return [] }
        const body = await response.json()
        if (!response.ok) throw new Error(body.mensaje ?? "No se pudieron cargar los reportes")
        return body as Reporte[]
      })
      .then(setReportes)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudieron cargar los reportes"))
      .finally(() => setCargando(false))
  }, [router])

  async function generarReporte() {
    if (!session?.usuarioId) return
    setGenerando(true)
    setError("")
    try {
      const response = await fetch(`/api/pala/admin/reportes/generar?nroAdministrador=${session.usuarioId}`, {
        method: "POST",
        headers: authHeader(session),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.mensaje ?? "No se pudo generar el reporte")
      const nuevo = body as Reporte
      router.push(`/admin/reportes/${nuevo.idReporte}`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo generar el reporte")
      setGenerando(false)
    }
  }

  if (!session) return null

  return (
    <AdminShell mail={session.mailUsuario}>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reportes y estadísticas</h1>
            <p className="mt-1 text-sm text-slate-500">Historial de reportes generados en la plataforma.</p>
          </div>
        </div>
        <Button onClick={generarReporte} disabled={generando}>
          {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Generar nuevo reporte
        </Button>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {cargando ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
        </div>
      ) : reportes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-slate-500">
            No se han generado reportes en el sistema hasta el momento. ¿Querés generar el primero?
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reportes.map((reporte) => (
            <Link key={reporte.idReporte} href={`/admin/reportes/${reporte.idReporte}`}>
              <Card className="border-slate-200 shadow-sm transition-colors hover:border-violet-300">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-600">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Reporte N° {reporte.idReporte}</p>
                    <p className="text-xs text-slate-500">{fechaFormat.format(new Date(reporte.fechaHora))}</p>
                  </div>
                  <p className="text-xs text-slate-400">Generado por {reporte.administradorGenerador}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  )
}