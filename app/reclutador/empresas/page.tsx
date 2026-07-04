"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, FilePlus2, Link2, Unlink } from "lucide-react"
import { ReclutadorShell } from "@/components/reclutador-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { AvisoFormularioSoporte, ReclutadorActual } from "@/types/aviso-form"

export default function MisEmpresasPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [empresas, setEmpresas] = useState<AvisoFormularioSoporte["empresasActivas"]>([])
  const [reclutadorId, setReclutadorId] = useState<number | null>(null)
  const [desvinculando, setDesvinculando] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "RECLUTADOR")) { router.replace("/login"); return }
    setSession(current)
    fetch("/api/pala/reclutador/me", { headers: authHeader(current), cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) { clearSession(); router.replace("/login"); throw new Error("La sesión venció") }
        const body = await response.json() as ReclutadorActual & { mensaje?: string }
        if (!response.ok) throw new Error(body.mensaje ?? "No se pudo resolver el perfil")
        setReclutadorId(body.id)
        return fetch(`/api/pala/reclutadores/${body.id}/avisos/soporte/empresas-activas`, { headers: authHeader(current), cache: "no-store" })
      })
      .then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.mensaje ?? "No se pudieron cargar las empresas"); setEmpresas(body) })
      .catch((reason) => setError(reason.message))
      .finally(() => setCargando(false))
  }, [router])

  async function desvincular(empresaId: number, razonSocial: string) {
    if (!session || !reclutadorId || !window.confirm(`¿Querés desvincularte de ${razonSocial}? Ya no podrás crear avisos nuevos para esta empresa.`)) return
    setDesvinculando(empresaId)
    setError("")
    try {
      const response = await fetch(`/api/pala/reclutadores/${reclutadorId}/empresas/${empresaId}`, {
        method: "DELETE",
        headers: authHeader(session),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { mensaje?: string }
        throw new Error(body.mensaje ?? "No se pudo finalizar la asociación")
      }
      setEmpresas((actuales) => actuales.filter((empresa) => empresa.id !== empresaId))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo finalizar la asociación")
    } finally {
      setDesvinculando(null)
    }
  }

  if (!session) return null
  return <ReclutadorShell mail={session.mailUsuario}>
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-violet-600">Empresas asociadas</p><h1 className="mt-1 text-3xl font-semibold">Mis empresas</h1><p className="mt-2 text-sm text-slate-500">Empresas para las que actualmente estás autorizado a publicar avisos.</p></div><Button asChild className="gap-2"><Link href="/solicitar-asociacion"><Link2 className="h-4 w-4" />Solicitar asociación</Link></Button></header>
    {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    {cargando ? <div className="grid gap-4 md:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-slate-200"/><div className="h-40 animate-pulse rounded-2xl bg-slate-200"/></div> : empresas.length === 0 ? <Card className="border-dashed shadow-none"><CardContent className="py-14 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300"/><h2 className="mt-4 font-semibold">No tenés empresas asociadas</h2><p className="mt-2 text-sm text-slate-500">Cuando una solicitud sea aceptada, la empresa aparecerá aquí.</p><Button asChild className="mt-5"><Link href="/solicitar-asociacion">Iniciar solicitud</Link></Button></CardContent></Card> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{empresas.map((empresa) => <Card key={empresa.id} className="border-slate-200 shadow-sm"><CardContent className="p-6"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><Building2 className="h-5 w-5"/></span><Badge className="border-0 bg-emerald-100 text-emerald-800">Asociación activa</Badge></div><h2 className="mt-5 text-lg font-semibold">{empresa.razonSocialEmpresa}</h2><p className="mt-1 text-sm text-slate-500">CUIT {empresa.cuitEmpresa}</p><div className="mt-6 grid gap-2"><Button asChild variant="outline" className="w-full gap-2"><Link href="/reclutador/avisos/nuevo"><FilePlus2 className="h-4 w-4"/>Crear aviso</Link></Button><Button type="button" variant="ghost" className="w-full gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700" disabled={desvinculando===empresa.id} onClick={()=>desvincular(empresa.id,empresa.razonSocialEmpresa)}><Unlink className="h-4 w-4"/>{desvinculando===empresa.id?"Desvinculando...":"Desvincularme"}</Button></div></CardContent></Card>)}</div>}
  </ReclutadorShell>
}
