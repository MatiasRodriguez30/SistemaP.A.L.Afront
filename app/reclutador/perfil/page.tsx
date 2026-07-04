"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { UserCog } from "lucide-react"
import { ReclutadorShell } from "@/components/reclutador-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { ReclutadorActual } from "@/types/aviso-form"

export default function PerfilReclutadorPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [perfil, setPerfil] = useState<ReclutadorActual | null>(null)
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "RECLUTADOR")) { router.replace("/login"); return }
    setSession(current)
    fetch("/api/pala/reclutador/me", { headers: authHeader(current), cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) { clearSession(); router.replace("/login"); return null }
        const body = await response.json()
        if (!response.ok) throw new Error(body.mensaje ?? "No se pudo cargar el perfil")
        return body as ReclutadorActual
      })
      .then((body) => { if (body) { setPerfil(body); setNombre(body.nombre); setApellido(body.apellido ?? ""); setDescripcion(body.descripcion ?? "") } })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudo cargar el perfil"))
  }, [router])

  async function guardar(event: React.FormEvent) {
    event.preventDefault()
    if (!session) return
    setGuardando(true); setError(""); setMensaje("")
    try {
      const response = await fetch("/api/pala/reclutador/me", { method: "PATCH", headers: { ...authHeader(session), "Content-Type": "application/json" }, body: JSON.stringify({ nombre, apellido, descripcion }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.mensaje ?? "No se pudo actualizar el perfil")
      setPerfil(body); setMensaje("Perfil actualizado correctamente")
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No se pudo actualizar el perfil") }
    finally { setGuardando(false) }
  }

  if (!session) return null
  return <ReclutadorShell mail={session.mailUsuario}>
    <header className="mb-8"><p className="text-sm font-medium text-violet-600">Datos personales</p><h1 className="mt-1 text-3xl font-semibold">Mi perfil</h1><p className="mt-2 text-sm text-slate-500">Mantené actualizados tus datos de identificación y contacto.</p></header>
    {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    {mensaje && <p className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{mensaje}</p>}
    <Card className="max-w-3xl shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5 text-violet-600"/>Información del reclutador</CardTitle></CardHeader><CardContent><form className="grid gap-5 md:grid-cols-2" onSubmit={guardar}><div className="space-y-2"><Label htmlFor="nombre">Nombre</Label><Input id="nombre" value={nombre} onChange={(e)=>setNombre(e.target.value)} required/></div><div className="space-y-2"><Label htmlFor="apellido">Apellido</Label><Input id="apellido" value={apellido} onChange={(e)=>setApellido(e.target.value)} required/></div><div className="space-y-2"><Label>Mail</Label><Input value={perfil?.mail??session.mailUsuario} disabled/></div><div className="space-y-2"><Label>CUIL</Label><Input value={perfil?.cuil??""} disabled/></div><div className="space-y-2 md:col-span-2"><Label htmlFor="descripcion">Descripción profesional</Label><Textarea id="descripcion" className="min-h-32" value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} maxLength={1000}/></div><div className="md:col-span-2"><Button disabled={guardando||!nombre.trim()||!apellido.trim()}>{guardando?"Guardando...":"Guardar cambios"}</Button></div></form></CardContent></Card>
  </ReclutadorShell>
}
