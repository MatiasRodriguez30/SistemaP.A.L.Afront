"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ShieldCheck, UserCheck, UserX, Users } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { UsuarioAdmin } from "@/types/usuario-admin"

export default function UsuariosAdminPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [tipo, setTipo] = useState("TODOS")
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login")
      return
    }
    setSession(current)
    fetch("/api/pala/admin/usuarios", { headers: authHeader(current), cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) { clearSession(); router.replace("/login"); return [] }
        const body = await response.json()
        if (!response.ok) throw new Error(body.mensaje ?? "No se pudieron cargar los usuarios")
        return body as UsuarioAdmin[]
      })
      .then(setUsuarios)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudieron cargar los usuarios"))
      .finally(() => setCargando(false))
  }, [router])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return usuarios.filter((usuario) =>
      (tipo === "TODOS" || usuario.tipo === tipo) &&
      (!texto || `${usuario.nombre} ${usuario.mail}`.toLowerCase().includes(texto)),
    )
  }, [busqueda, tipo, usuarios])

  async function cambiarEstado(usuario: UsuarioAdmin) {
    if (!session) return
    const activar = !usuario.activo
    const accion = activar ? "reactivar" : "restringir"
    if (!window.confirm(`¿Querés ${accion} el acceso de ${usuario.nombre}?`)) return
    const clave = `${usuario.tipo}-${usuario.id}`
    setProcesando(clave)
    setError("")
    try {
      const response = await fetch(`/api/pala/admin/usuarios/${usuario.tipo}/${usuario.id}/estado`, {
        method: "PATCH",
        headers: { ...authHeader(session), "Content-Type": "application/json" },
        body: JSON.stringify({ activo: activar }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.mensaje ?? "No se pudo actualizar el acceso")
      setUsuarios((actuales) => actuales.map((item) => item.tipo === usuario.tipo && item.id === usuario.id ? body : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el acceso")
    } finally {
      setProcesando(null)
    }
  }

  if (!session) return null
  return <AdminShell mail={session.mailUsuario}>
    <header className="mb-8"><p className="text-sm font-medium text-violet-600">Control de acceso local</p><h1 className="mt-1 text-3xl font-semibold">Usuarios</h1><p className="mt-2 text-sm text-slate-500">Restringí o reactivá el acceso a PALA sin eliminar usuarios del subsistema de seguridad.</p></header>
    {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input className="bg-white pl-9" placeholder="Buscar por nombre o correo" value={busqueda} onChange={(event)=>setBusqueda(event.target.value)}/></div><select className="h-10 rounded-md border bg-white px-3 text-sm" value={tipo} onChange={(event)=>setTipo(event.target.value)}><option value="TODOS">Todos los tipos</option><option value="ADMINISTRADOR">Administradores</option><option value="RECLUTADOR">Reclutadores</option><option value="POSTULANTE">Postulantes</option></select></div>
    {cargando ? <div className="h-48 animate-pulse rounded-2xl bg-slate-200"/> : filtrados.length === 0 ? <Card className="border-dashed"><CardContent className="py-14 text-center text-slate-500"><Users className="mx-auto mb-3 h-9 w-9 text-slate-300"/>No hay usuarios para mostrar.</CardContent></Card> : <div className="space-y-3">{filtrados.map((usuario)=>{const clave=`${usuario.tipo}-${usuario.id}`;return <Card key={clave} className="shadow-sm"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-4"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${usuario.activo?"bg-emerald-50 text-emerald-600":"bg-slate-100 text-slate-500"}`}>{usuario.activo?<UserCheck className="h-5 w-5"/>:<UserX className="h-5 w-5"/>}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-semibold">{usuario.nombre}</h2><Badge variant="outline">{usuario.tipo}</Badge><Badge className={usuario.activo?"border-0 bg-emerald-100 text-emerald-800":"border-0 bg-rose-100 text-rose-800"}>{usuario.activo?"Activo":"Restringido"}</Badge></div><p className="mt-1 truncate text-sm text-slate-500">{usuario.mail}</p></div></div><Button variant={usuario.activo?"outline":"default"} className={usuario.activo?"text-rose-600 hover:bg-rose-50 hover:text-rose-700":""} disabled={procesando===clave} onClick={()=>cambiarEstado(usuario)}>{procesando===clave?"Guardando...":usuario.activo?"Restringir acceso":"Reactivar acceso"}</Button></CardContent></Card>})}</div>}
  </AdminShell>
}
