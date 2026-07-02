"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Pencil, Plus, Power, PowerOff, Search } from "lucide-react"
import { sileo } from "sileo"
import { AdminShell } from "@/components/admin-shell"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { EmpresaAdmin, EmpresaForm } from "@/types/empresa-admin"

const VACIO: EmpresaForm = { cuitEmpresa: "", razonSocialEmpresa: "", mailEmpresa: "", telefonoEmpresa: "", descripcionEmpresa: "", direccionEmpresa: "" }
const POR_PAGINA = 8

export default function EmpresasAdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState("TODAS")
  const [pagina, setPagina] = useState(1)
  const [dialogo, setDialogo] = useState(false)
  const [editando, setEditando] = useState<EmpresaAdmin | null>(null)
  const [form, setForm] = useState<EmpresaForm>(VACIO)
  const [baja, setBaja] = useState<EmpresaAdmin | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some(role => role.toUpperCase() === "ADMINISTRADOR")) { router.replace("/login"); return }
    if (!current.permisos.includes("ABM_EMPRESA")) { setSession(current); setError("No tenés el permiso ABM_EMPRESA."); return }
    setSession(current)
    fetch("/api/pala/empresas", { headers: authHeader(current), cache: "no-store" })
      .then(async response => {
        if (response.status === 401) { clearSession(); router.replace("/login"); return [] }
        const data = await response.json()
        if (!response.ok) throw new Error(data.mensaje ?? "No se pudieron cargar las empresas")
        return data
      })
      .then(setEmpresas)
      .catch(err => setError(err.message))
  }, [router])

  const filtradas = useMemo(() => empresas.filter(empresa => {
    const q = busqueda.trim().toLowerCase()
    const coincide = !q || `${empresa.razonSocialEmpresa} ${empresa.cuitEmpresa} ${empresa.mailEmpresa}`.toLowerCase().includes(q)
    const coincideEstado = estado === "TODAS" || (estado === "ACTIVAS" ? !empresa.fechaBajaEmpresa : Boolean(empresa.fechaBajaEmpresa))
    return coincide && coincideEstado
  }), [empresas, busqueda, estado])

  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const visibles = filtradas.slice((Math.min(pagina, paginas) - 1) * POR_PAGINA, Math.min(pagina, paginas) * POR_PAGINA)

  function abrirNueva() { setEditando(null); setForm(VACIO); setDialogo(true) }
  function abrirEdicion(empresa: EmpresaAdmin) {
    setEditando(empresa)
    setForm({ cuitEmpresa: empresa.cuitEmpresa, razonSocialEmpresa: empresa.razonSocialEmpresa, mailEmpresa: empresa.mailEmpresa, telefonoEmpresa: empresa.telefonoEmpresa ?? "", descripcionEmpresa: empresa.descripcionEmpresa ?? "", direccionEmpresa: empresa.direccionEmpresa ?? "" })
    setDialogo(true)
  }

  async function guardar() {
    if (!session) return
    setProcesando(true); setError("")
    try {
      const response = await fetch(editando ? `/api/pala/empresas/${editando.id}` : "/api/pala/empresas", {
        method: editando ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeader(session) },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.mensaje ?? "No se pudo guardar la empresa")
      setEmpresas(prev => editando ? prev.map(item => item.id === data.id ? data : item) : [...prev, data].sort((a, b) => a.razonSocialEmpresa.localeCompare(b.razonSocialEmpresa)))
      setDialogo(false)
      sileo.success({ title: editando ? "Empresa actualizada" : "Empresa creada" })
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo guardar la empresa") }
    finally { setProcesando(false) }
  }

  async function cambiarEstado(empresa: EmpresaAdmin, reactivar: boolean) {
    if (!session) return
    setProcesando(true); setError("")
    try {
      const response = await fetch(`/api/pala/empresas/${empresa.id}${reactivar ? "/reactivar" : ""}`, {
        method: reactivar ? "PATCH" : "DELETE", headers: authHeader(session),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.mensaje ?? "No se pudo actualizar el estado")
      setEmpresas(prev => prev.map(item => item.id === data.id ? data : item))
      setBaja(null)
      sileo.success({ title: reactivar ? "Empresa reactivada" : "Empresa dada de baja" })
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo actualizar la empresa") }
    finally { setProcesando(false) }
  }

  if (!session) return null
  return <AdminShell mail={session.mailUsuario}>
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium text-violet-600">Administración</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Empresas</h1><p className="mt-2 text-sm text-slate-500">Alta, modificación y baja lógica de empresas registradas.</p></div>
      {session.permisos.includes("ABM_EMPRESA") && <Button onClick={abrirNueva} className="gap-2"><Plus className="h-4 w-4" />Nueva empresa</Button>}
    </header>
    {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

    <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-violet-600" />Empresas registradas</CardTitle></CardHeader><CardContent>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_190px]">
        <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input value={busqueda} onChange={event => { setBusqueda(event.target.value); setPagina(1) }} className="pl-9" placeholder="Razón social, CUIT o mail" /></div>
        <Select value={estado} onValueChange={value => { setEstado(value); setPagina(1) }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TODAS">Todas</SelectItem><SelectItem value="ACTIVAS">Activas</SelectItem><SelectItem value="INACTIVAS">Inactivas</SelectItem></SelectContent></Select>
      </div>
      <div className="overflow-x-auto rounded-xl border"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Razón social", "CUIT", "Mail", "Teléfono", "Estado", "Acciones"].map(item => <th key={item} className="px-4 py-3 font-medium">{item}</th>)}</tr></thead><tbody className="divide-y">
        {visibles.map(empresa => <tr key={empresa.id} className="hover:bg-slate-50/70"><td className="px-4 py-4 font-medium">{empresa.razonSocialEmpresa}</td><td className="px-4 py-4 text-slate-600">{empresa.cuitEmpresa}</td><td className="px-4 py-4 text-slate-600">{empresa.mailEmpresa}</td><td className="px-4 py-4 text-slate-600">{empresa.telefonoEmpresa || "—"}</td><td className="px-4 py-4"><Badge className={empresa.fechaBajaEmpresa ? "border-0 bg-slate-200 text-slate-700" : "border-0 bg-emerald-100 text-emerald-800"}>{empresa.fechaBajaEmpresa ? "Inactiva" : "Activa"}</Badge></td><td className="px-4 py-4"><div className="flex gap-2"><Button size="sm" variant="outline" className="gap-1.5" onClick={() => abrirEdicion(empresa)}><Pencil className="h-3.5 w-3.5" />Editar</Button>{empresa.fechaBajaEmpresa ? <Button size="sm" variant="outline" className="gap-1.5 text-emerald-700" onClick={() => cambiarEstado(empresa, true)}><Power className="h-3.5 w-3.5" />Reactivar</Button> : <Button size="sm" variant="outline" className="gap-1.5 text-rose-700" onClick={() => setBaja(empresa)}><PowerOff className="h-3.5 w-3.5" />Dar de baja</Button>}</div></td></tr>)}
      </tbody></table>{!visibles.length && <p className="p-10 text-center text-sm text-slate-500">No hay empresas que coincidan con los filtros.</p>}</div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500"><span>{filtradas.length} empresa{filtradas.length === 1 ? "" : "s"}</span><div className="flex items-center gap-3"><Button size="sm" variant="outline" disabled={pagina <= 1} onClick={() => setPagina(prev => prev - 1)}>Anterior</Button><span>Página {Math.min(pagina, paginas)} de {paginas}</span><Button size="sm" variant="outline" disabled={pagina >= paginas} onClick={() => setPagina(prev => prev + 1)}>Siguiente</Button></div></div>
    </CardContent></Card>

    <EmpresaDialog abierto={dialogo} setAbierto={setDialogo} editando={editando} form={form} setForm={setForm} guardar={guardar} procesando={procesando} />
    <AlertDialog open={Boolean(baja)} onOpenChange={open => !open && setBaja(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Dar de baja la empresa?</AlertDialogTitle><AlertDialogDescription>{baja?.razonSocialEmpresa} dejará de aparecer como empresa activa. Sus datos y su historial se conservarán.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-rose-600 hover:bg-rose-700" disabled={procesando} onClick={() => baja && cambiarEstado(baja, false)}>Dar de baja</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </AdminShell>
}

function EmpresaDialog({ abierto, setAbierto, editando, form, setForm, guardar, procesando }: { abierto: boolean; setAbierto: (value: boolean) => void; editando: EmpresaAdmin | null; form: EmpresaForm; setForm: React.Dispatch<React.SetStateAction<EmpresaForm>>; guardar: () => void; procesando: boolean }) {
  const campo = (key: keyof EmpresaForm, value: string) => setForm(prev => ({ ...prev, [key]: value }))
  return <Dialog open={abierto} onOpenChange={setAbierto}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>{editando ? "Editar empresa" : "Nueva empresa"}</DialogTitle><DialogDescription>Completá los datos de la empresa que se utilizarán en PALA.</DialogDescription></DialogHeader><div className="grid gap-4 py-2 sm:grid-cols-2">
    <Campo label="Razón social" value={form.razonSocialEmpresa} onChange={value => campo("razonSocialEmpresa", value)} /><Campo label="CUIT" value={form.cuitEmpresa} onChange={value => campo("cuitEmpresa", value)} /><Campo label="Mail" type="email" value={form.mailEmpresa} onChange={value => campo("mailEmpresa", value)} /><Campo label="Teléfono" value={form.telefonoEmpresa} onChange={value => campo("telefonoEmpresa", value)} /><Campo label="Dirección" value={form.direccionEmpresa} onChange={value => campo("direccionEmpresa", value)} className="sm:col-span-2" /><div className="sm:col-span-2"><Label htmlFor="empresa-descripcion">Descripción</Label><Textarea id="empresa-descripcion" className="mt-2" value={form.descripcionEmpresa} onChange={event => campo("descripcionEmpresa", event.target.value)} /></div>
  </div><Button onClick={guardar} disabled={procesando || !form.razonSocialEmpresa.trim() || !form.cuitEmpresa.trim() || !form.mailEmpresa.trim()}>{procesando ? "Guardando..." : "Guardar empresa"}</Button></DialogContent></Dialog>
}

function Campo({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; className?: string }) {
  const id = `abm-${label.toLowerCase().replaceAll(" ", "-")}`
  return <div className={className}><Label htmlFor={id}>{label}</Label><Input id={id} type={type} className="mt-2" value={value} onChange={event => onChange(event.target.value)} /></div>
}
