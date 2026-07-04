"use client"
import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authHeader, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"

type Conexion = { id: number; nombre: string; url: string; fechaCreacion: string; ultimaSincronizacion: string | null; fechaBaja: string | null; cantidadCarreras: number; creadaPorId: number | null; creadaPorNombre: string | null }
const fecha = (valor: string | null) => valor ? new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor)) : "Nunca"

export default function ConexionesPage() {
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [conexiones, setConexiones] = useState<Conexion[]>([])
  const [nombre, setNombre] = useState("")
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  async function cargar(current: AuthResponse) {
    try {
      const response = await fetch("/api/pala/conexiones-carrera", { headers: authHeader(current), cache: "no-store" })
      const body = await response.json()
      if (!response.ok) throw new Error(body.mensaje ?? "No se pudieron cargar las conexiones")
      setConexiones(Array.isArray(body) ? body : [])
    } catch (err) {
      setConexiones([])
      setError(err instanceof Error ? err.message : "No se pudieron cargar las conexiones")
    }
  }

  useEffect(() => { const current = getSession(); setSession(current); if (current) void cargar(current) }, [])
  if (!session) return null

  return <AdminShell mail={session.mailUsuario}>
    <h1 className="text-3xl font-semibold">Conexiones de carreras</h1>
    {error && <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    <div className="my-6 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
      <Input placeholder="Nombre" value={nombre} onChange={event => setNombre(event.target.value)} />
      <Input placeholder="URL oficial UTN" value={url} onChange={event => setUrl(event.target.value)} />
      <Button onClick={async () => { const response = await fetch("/api/pala/conexiones-carrera", { method: "POST", headers: { ...authHeader(session), "Content-Type": "application/json" }, body: JSON.stringify({ nombre, url }) }); const body = await response.json(); if (!response.ok) { setError(body.mensaje ?? "No se pudo crear"); return } setNombre(""); setUrl(""); await cargar(session) }}>Crear conexión</Button>
    </div>
    <div className="space-y-3">{conexiones.map(conexion => <div className="rounded-xl bg-white p-5 shadow-sm" key={conexion.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><b>{conexion.nombre}</b><span className={`rounded-full px-2 py-1 text-xs ${conexion.fechaBaja ? "bg-slate-200" : "bg-emerald-100 text-emerald-800"}`}>{conexion.fechaBaja ? "Inactiva" : "Activa"}</span></div><p className="text-sm text-slate-500">{conexion.url}</p><div className="mt-3 flex flex-wrap gap-5 text-xs text-slate-500"><span>Creada: {fecha(conexion.fechaCreacion)}</span><span>Creada por: {conexion.creadaPorNombre??"Registro histórico"}</span><span>Última sincronización: {fecha(conexion.ultimaSincronizacion)}</span><span>{conexion.cantidadCarreras} carreras vinculadas</span></div></div><div className="flex gap-2">{!conexion.fechaBaja&&<Button onClick={async () => { const response = await fetch(`/api/pala/conexiones-carrera/${conexion.id}/sincronizar`, { method: "POST", headers: authHeader(session) }); const body = await response.json(); if (!response.ok) setError(body.mensaje ?? "No se pudo sincronizar"); else await cargar(session) }}>Sincronizar</Button>}<Button variant="outline" onClick={async()=>{await fetch(`/api/pala/conexiones-carrera/${conexion.id}`,{method:"DELETE",headers:authHeader(session)});await cargar(session)}}>{conexion.fechaBaja?"Inactiva":"Dar de baja"}</Button></div></div></div>)}</div>
  </AdminShell>
}
