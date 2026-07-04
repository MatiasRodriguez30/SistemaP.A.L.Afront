"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GitBranch, Pencil } from "lucide-react"
import { sileo } from "sileo"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authHeader, clearSession, getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"
import type { EstadoPostulacionAdmin } from "@/types/estado-postulacion"

export default function EstadosPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)
  const [estados, setEstados] = useState<EstadoPostulacionAdmin[]>([])
  const [editando, setEditando] = useState<EstadoPostulacionAdmin | null>(null)
  const [nombre, setNombre] = useState("")
  const [error, setError] = useState("")

  const cargar = useCallback(async (current: AuthResponse) => {
    const response = await fetch("/api/pala/admin/estados/postulaciones", { headers: authHeader(current), cache: "no-store" })
    if (response.status === 401) {
      clearSession()
      router.replace("/login")
      return
    }
    const body = await response.json()
    if (!response.ok) throw new Error(body.mensaje ?? "No se pudo cargar el catálogo")
    setEstados(body)
  }, [router])

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login")
      return
    }
    setSession(current)
    cargar(current).catch((reason) => setError(reason.message))
  }, [cargar, router])

  async function guardarNombre() {
    if (!session || !editando) return
    const response = await fetch(`/api/pala/admin/estados/postulaciones/${editando.id}`, {
      method: "PATCH",
      headers: { ...authHeader(session), "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    })
    const body = await response.json()
    if (!response.ok) {
      const mensaje = body.mensaje ?? "No se pudo actualizar el estado"
      setError(mensaje)
      sileo.error({ title: "No se pudo guardar", description: mensaje })
      return
    }
    setEditando(null)
    setError("")
    sileo.success({ title: "Nombre actualizado", description: `${editando.codigoInterno} ahora se muestra como ${body.nombre}.` })
    await cargar(session)
  }

  if (!session) return null

  return (
    <AdminShell mail={session.mailUsuario}>
      <header className="mb-8">
        <Link href="/admin/estados" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-violet-600">
          <ArrowLeft className="h-4 w-4" /> Volver a estados
        </Link>
        <p className="text-sm font-medium text-violet-600">Administración</p>
        <h1 className="mt-1 text-3xl font-semibold">Estados</h1>
        <p className="mt-2 text-sm text-slate-500">Catálogos utilizados por los flujos del sistema.</p>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><GitBranch className="h-5 w-5 text-violet-600" /> Estados de postulación</CardTitle>
          <p className="text-sm text-slate-500">El código interno define el flujo y no puede modificarse. El nombre es el texto que ve el usuario.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Código interno</th><th className="px-4 py-3">Postulaciones actuales</th><th className="px-4 py-3">Acciones</th></tr>
              </thead>
              <tbody className="divide-y">
                {estados.map((estado) => (
                  <tr key={estado.id}>
                    <td className="px-4 py-4 font-medium">{estado.nombre}</td>
                    <td className="px-4 py-4"><code className="rounded bg-slate-100 px-2 py-1 text-xs">{estado.codigoInterno}</code></td>
                    <td className="px-4 py-4 tabular-nums text-slate-600">{estado.postulacionesActuales}</td>
                    <td className="px-4 py-4">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => { setEditando(estado); setNombre(estado.nombre) }}><Pencil className="h-3.5 w-3" />Editar nombre</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editando)} onOpenChange={(open) => !open && setEditando(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar nombre visible</DialogTitle><DialogDescription>El código interno {editando?.codigoInterno} seguirá sin cambios.</DialogDescription></DialogHeader>
          <div><Label htmlFor="nombre-estado">Nombre</Label><Input id="nombre-estado" className="mt-2" value={nombre} onChange={(event) => setNombre(event.target.value)} /></div>
          <Button disabled={!nombre.trim()} onClick={guardarNombre}>Guardar cambios</Button>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
