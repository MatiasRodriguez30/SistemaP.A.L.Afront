"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BriefcaseBusiness, Building2, FilePlus2, Files, Home, Link2, LogOut, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { clearSession } from "@/lib/session"
import { cn } from "@/lib/utils"

export function ReclutadorShell({children,mail}:{children:React.ReactNode;mail:string}){
 const pathname=usePathname(),router=useRouter();const items=[{href:"/reclutador",label:"Panel",icon:BriefcaseBusiness},{href:"/reclutador/avisos",label:"Mis avisos",icon:Files},{href:"/reclutador/avisos/nuevo",label:"Crear aviso",icon:FilePlus2},{href:"/reclutador/empresas",label:"Mis empresas",icon:Building2},{href:"/solicitar-asociacion",label:"Solicitar asociación",icon:Link2},{href:"/avisos",label:"Ver avisos",icon:Home},{href:"/reclutador/perfil",label:"Mi perfil",icon:UserCog}]
 return <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[260px_1fr]"><aside className="border-b bg-slate-950 px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen"><div className="mb-8 px-3"><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Sistema PALA</p><p className="mt-2 text-xl font-semibold">Reclutador</p></div><nav className="grid gap-2">{items.map(({href,label,icon:Icon})=>{const active=href==="/reclutador"?pathname===href:href==="/reclutador/avisos"?pathname===href:pathname.startsWith(href);return <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm",active?"bg-violet-600 text-white":"text-slate-300 hover:bg-white/10 hover:text-white")}><Icon className="h-4 w-4"/>{label}</Link>})}</nav><div className="mt-8 border-t border-white/10 pt-5 lg:absolute lg:bottom-6 lg:left-5 lg:right-5"><p className="truncate px-3 text-xs text-slate-400">{mail}</p><Button variant="ghost" className="mt-2 w-full justify-start gap-3 text-slate-300 hover:bg-white/10 hover:text-white" onClick={()=>{clearSession();router.replace("/login")}}><LogOut className="h-4 w-4"/>Cerrar sesión</Button></div></aside><main className="min-w-0 p-5 sm:p-8 lg:p-10">{children}</main></div>
}
