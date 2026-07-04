"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Pencil, Plus, Search, Tags } from "lucide-react"
import { sileo } from "sileo"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { SubtipoAvisoAdmin, TipoAvisoAdmin } from "@/types/catalogos"

type DialogoTipo = { tipo: TipoAvisoAdmin | null } | undefined
type DialogoSubtipo = { tipo: TipoAvisoAdmin; subtipo: SubtipoAvisoAdmin | null } | undefined

export default function TiposAvisoPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [tipos, setTipos] = useState<TipoAvisoAdmin[]>([])
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [dialogoTipo, setDialogoTipo] = useState<DialogoTipo>()
  const [dialogoSubtipo, setDialogoSubtipo] = useState<DialogoSubtipo>()
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [error, setError] = useState("")

  const cargar = useCallback(async (current: AuthResponse) => {
    const response = await fetch("/api/pala/admin/catalogos/tipos-aviso", { headers: authHeader(current), cache: "no-store" })
    if (response.status === 401) { clearSession(); router.replace("/login"); return }
    const body = await response.json()
    if (!response.ok) throw new Error(body.mensaje ?? "No se pudo cargar el catálogo")
    setTipos(body)
    setSeleccionadoId((actual) => actual && body.some((tipo: TipoAvisoAdmin) => tipo.id === actual) ? actual : body[0]?.id ?? null)
  }, [router])

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) { router.replace("/login"); return }
    setSession(current)
    cargar(current).catch((reason) => setError(reason.message))
  }, [cargar, router])

  const filtrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase()
    return tipos.filter((tipo) => !query || `${tipo.nombre} ${tipo.descripcion ?? ""}`.toLowerCase().includes(query))
  }, [tipos, busqueda])
  const seleccionado = tipos.find((tipo) => tipo.id === seleccionadoId) ?? null

  async function request(url: string, method: string, body: unknown, success: string) {
    if (!session) return false
    const response = await fetch(url, { method, headers: { ...authHeader(session), "Content-Type": "application/json" }, body: JSON.stringify(body) })
    const result = await response.json()
    if (!response.ok) { sileo.error({ title: "No se pudo completar la acción", description: result.mensaje }); return false }
    sileo.success({ title: success })
    await cargar(session)
    return true
  }

  async function guardarTipo() {
    if (!dialogoTipo) return
    const editando = dialogoTipo.tipo
    const ok = await request(editando ? `/api/pala/admin/catalogos/tipos-aviso/${editando.id}` : "/api/pala/admin/catalogos/tipos-aviso", editando ? "PATCH" : "POST", { nombre, descripcion }, editando ? "Tipo actualizado" : "Tipo creado")
    if (ok) setDialogoTipo(undefined)
  }
  async function guardarSubtipo() {
    if (!dialogoSubtipo) return
    const { tipo, subtipo } = dialogoSubtipo
    const ok = await request(subtipo ? `/api/pala/admin/catalogos/tipos-aviso/${tipo.id}/subtipos/${subtipo.id}` : `/api/pala/admin/catalogos/tipos-aviso/${tipo.id}/subtipos`, subtipo ? "PATCH" : "POST", { nombre }, subtipo ? "Subtipo actualizado" : "Subtipo creado")
    if (ok) setDialogoSubtipo(undefined)
  }

  if (!session) return null
  return <AdminShell mail={session.mailUsuario}>
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><Link href="/admin/catalogos" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600"><ArrowLeft className="h-4 w-4" />Volver a catálogos</Link><h1 className="text-3xl font-semibold">Tipos y subtipos de aviso</h1><p className="mt-2 text-sm text-slate-500">Seleccioná un tipo para configurar sus subtipos.</p></div>
      <Button className="gap-2" onClick={() => { setDialogoTipo({ tipo: null }); setNombre(""); setDescripcion("") }}><Plus className="h-4 w-4" />Nuevo tipo</Button>
    </header>
    {error && <p className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

    <div className="grid min-h-[560px] overflow-hidden rounded-2xl border bg-white shadow-sm lg:grid-cols-[340px_1fr]">
      <aside className="border-b bg-slate-50/60 lg:border-b-0 lg:border-r">
        <div className="border-b p-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="bg-white pl-9" placeholder="Buscar tipo de aviso" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} /></div><p className="mt-3 text-xs text-slate-500">{filtrados.length} tipos encontrados</p></div>
        <div className="max-h-[510px] overflow-y-auto p-2">
          {filtrados.map((tipo) => <button key={tipo.id} onClick={() => setSeleccionadoId(tipo.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${seleccionadoId === tipo.id ? "bg-violet-600 text-white shadow-sm" : "hover:bg-white"}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${seleccionadoId === tipo.id ? "bg-white/15" : "bg-sky-50 text-sky-600"}`}><Tags className="h-4 w-4" /></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{tipo.nombre}</b><span className={`mt-0.5 block text-xs ${seleccionadoId === tipo.id ? "text-violet-100" : "text-slate-500"}`}>{tipo.subtipos.filter((sub) => !sub.fechaBaja).length} subtipos activos</span></span>{tipo.fechaBaja && <span className="h-2 w-2 rounded-full bg-slate-400" title="Inactivo" />}</button>)}
          {filtrados.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No se encontraron tipos.</p>}
        </div>
      </aside>

      <main className="min-w-0 p-5 sm:p-7">
        {!seleccionado ? <div className="grid h-full place-items-center text-sm text-slate-500">Seleccioná un tipo de aviso.</div> : <>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-6"><div><div className="flex items-center gap-3"><h2 className="text-2xl font-semibold">{seleccionado.nombre}</h2><Badge className={seleccionado.fechaBaja ? "border-0 bg-slate-200 text-slate-700" : "border-0 bg-emerald-100 text-emerald-800"}>{seleccionado.fechaBaja ? "Inactivo" : "Activo"}</Badge></div><p className="mt-2 max-w-2xl text-sm text-slate-500">{seleccionado.descripcion || "Sin descripción."}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => { setDialogoTipo({ tipo: seleccionado }); setNombre(seleccionado.nombre); setDescripcion(seleccionado.descripcion ?? "") }}><Pencil className="mr-2 h-4 w-4" />Editar</Button><Button variant="outline" onClick={() => request(`/api/pala/admin/catalogos/tipos-aviso/${seleccionado.id}/disponibilidad`, "PATCH", { activo: Boolean(seleccionado.fechaBaja) }, seleccionado.fechaBaja ? "Tipo reactivado" : "Tipo dado de baja")}>{seleccionado.fechaBaja ? "Reactivar" : "Dar de baja"}</Button></div></div>
          <div className="mt-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold">Subtipos</h3><p className="mt-1 text-xs text-slate-500">Opciones específicas dentro de {seleccionado.nombre}.</p></div><Button size="sm" onClick={() => { setDialogoSubtipo({ tipo: seleccionado, subtipo: null }); setNombre("") }}><Plus className="mr-1 h-4 w-4" />Agregar</Button></div>
            <div className="overflow-hidden rounded-xl border"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y">{seleccionado.subtipos.map((sub) => <tr key={sub.id}><td className="px-4 py-4 font-medium">{sub.nombre}</td><td className="px-4 py-4"><Badge className={sub.fechaBaja ? "border-0 bg-slate-200 text-slate-700" : "border-0 bg-emerald-100 text-emerald-800"}>{sub.fechaBaja ? "Inactivo" : "Activo"}</Badge></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => { setDialogoSubtipo({ tipo: seleccionado, subtipo: sub }); setNombre(sub.nombre) }}>Editar</Button><Button size="sm" variant="ghost" onClick={() => request(`/api/pala/admin/catalogos/tipos-aviso/${seleccionado.id}/subtipos/${sub.id}/disponibilidad`, "PATCH", { activo: Boolean(sub.fechaBaja) }, sub.fechaBaja ? "Subtipo reactivado" : "Subtipo dado de baja")}>{sub.fechaBaja ? "Reactivar" : "Dar de baja"}</Button></div></td></tr>)}{seleccionado.subtipos.length === 0 && <tr><td colSpan={3} className="p-10 text-center text-sm text-slate-500">Todavía no hay subtipos configurados.</td></tr>}</tbody></table></div>
          </div>
        </>}
      </main>
    </div>

    <Dialog open={Boolean(dialogoTipo)} onOpenChange={(open) => !open && setDialogoTipo(undefined)}><DialogContent><DialogHeader><DialogTitle>{dialogoTipo?.tipo ? "Editar tipo de aviso" : "Nuevo tipo de aviso"}</DialogTitle><DialogDescription>Definí el nombre general y una descripción opcional.</DialogDescription></DialogHeader><div><Label>Nombre</Label><Input className="mt-2" value={nombre} onChange={(event) => setNombre(event.target.value)} /></div><div><Label>Descripción</Label><Textarea className="mt-2" value={descripcion} onChange={(event) => setDescripcion(event.target.value)} /></div><Button disabled={!nombre.trim()} onClick={guardarTipo}>Guardar</Button></DialogContent></Dialog>
    <Dialog open={Boolean(dialogoSubtipo)} onOpenChange={(open) => !open && setDialogoSubtipo(undefined)}><DialogContent><DialogHeader><DialogTitle>{dialogoSubtipo?.subtipo ? "Editar subtipo" : "Nuevo subtipo"}</DialogTitle><DialogDescription>Se asociará al tipo {dialogoSubtipo?.tipo.nombre}.</DialogDescription></DialogHeader><div><Label>Nombre</Label><Input className="mt-2" value={nombre} onChange={(event) => setNombre(event.target.value)} /></div><Button disabled={!nombre.trim()} onClick={guardarSubtipo}>Guardar</Button></DialogContent></Dialog>
  </AdminShell>
}
