"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ClipboardCheck, FileText, GitBranch } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Card, CardContent } from "@/components/ui/card"
import { getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"

export default function EstadosPage() {
  const router = useRouter()
  const [session, setSession] = useState<AuthResponse | null>(null)

  useEffect(() => {
    const current = getSession()
    if (!current || !current.roles.some((rol) => rol.toUpperCase() === "ADMINISTRADOR")) {
      router.replace("/login")
      return
    }
    setSession(current)
  }, [router])

  if (!session) return null

  return (
    <AdminShell mail={session.mailUsuario}>
      <header className="mb-8">
        <p className="text-sm font-medium text-violet-600">Administración</p>
        <h1 className="mt-1 text-3xl font-semibold">Estados</h1>
        <p className="mt-2 text-sm text-slate-500">Seleccioná el catálogo que querés administrar.</p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/admin/estados/postulaciones" className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2">
          <Card className="h-full border-slate-200 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-violet-300 group-hover:shadow-md">
            <CardContent className="flex min-h-48 flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-600">
                <GitBranch className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">Estados de postulación</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">Gestioná los nombres visibles de los estados utilizados en el flujo de postulaciones.</p>
              <span className="mt-5 flex items-center gap-2 text-sm font-medium text-violet-600">
                Administrar catálogo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/estados/avisos" className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2">
          <Card className="h-full border-slate-200 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-sky-300 group-hover:shadow-md">
            <CardContent className="flex min-h-48 flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-sky-600"><FileText className="h-6 w-6" /></span>
              <h2 className="mt-5 text-lg font-semibold">Estados de aviso</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">Gestioná los nombres visibles de los estados utilizados en el flujo de avisos.</p>
              <span className="mt-5 flex items-center gap-2 text-sm font-medium text-sky-600">Administrar catálogo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/estados/solicitudes-asociacion" className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2">
          <Card className="h-full border-slate-200 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-emerald-300 group-hover:shadow-md">
            <CardContent className="flex min-h-48 flex-col p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><ClipboardCheck className="h-6 w-6" /></span>
              <h2 className="mt-5 text-lg font-semibold">Estados de solicitud de asociación</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">Gestioná los nombres visibles de los estados utilizados en las solicitudes de asociación.</p>
              <span className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-600">Administrar catálogo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </AdminShell>
  )
}
