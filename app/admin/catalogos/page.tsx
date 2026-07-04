"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, GraduationCap, Library, Tags } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Card, CardContent } from "@/components/ui/card"
import { getSession } from "@/lib/session"
import type { AuthResponse } from "@/types/auth"

export default function CatalogosPage() {
  const router = useRouter(); const [session, setSession] = useState<AuthResponse | null>(null)
  useEffect(() => { const s=getSession(); if(!s||!s.roles.some(r=>r.toUpperCase()==="ADMINISTRADOR")){router.replace("/login");return} setSession(s) },[router])
  if(!session)return null
  const items=[
    {href:"/admin/catalogos/tipos-estudiante",titulo:"Tipos de estudiante",texto:"Administrá las categorías académicas disponibles para los postulantes.",icon:GraduationCap,color:"violet"},
    {href:"/admin/catalogos/tipos-aviso",titulo:"Tipos y subtipos de aviso",texto:"Configurá la clasificación utilizada al crear y publicar avisos.",icon:Tags,color:"sky"},
  ]
  return <AdminShell mail={session.mailUsuario}><header className="mb-8"><p className="text-sm font-medium text-violet-600">Administración</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-semibold"><Library className="h-7 w-7"/>Catálogos</h1><p className="mt-2 text-sm text-slate-500">Seleccioná el catálogo que querés administrar.</p></header><div className="grid gap-5 md:grid-cols-2">{items.map(({href,titulo,texto,icon:Icon,color})=><Link key={href} href={href} className="group"><Card className="h-full border-slate-200 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md"><CardContent className="flex min-h-48 flex-col p-6"><span className={`grid h-12 w-12 place-items-center rounded-xl ${color==="sky"?"bg-sky-50 text-sky-600":"bg-violet-50 text-violet-600"}`}><Icon className="h-6 w-6"/></span><h2 className="mt-5 text-lg font-semibold">{titulo}</h2><p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{texto}</p><span className="mt-5 flex items-center gap-2 text-sm font-medium text-violet-600">Administrar catálogo <ArrowRight className="h-4 w-4 group-hover:translate-x-1"/></span></CardContent></Card></Link>)}</div></AdminShell>
}
