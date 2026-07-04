"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"

function Confirmacion() {
  const params = useSearchParams()
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando")
  const [mensaje, setMensaje] = useState("")
  useEffect(() => {
    const token = params.get("token")
    if (!token) { setEstado("error"); setMensaje("El enlace no contiene un token valido."); return }
    fetch(`/api/pala/solicitudes-asociacion/confirmar-empresa?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => { if (!response.ok) { const body = await response.json().catch(()=>({})); throw new Error(body.mensaje??"No se pudo confirmar la autorizacion") } setEstado("ok") })
      .catch((reason) => { setEstado("error"); setMensaje(reason instanceof Error?reason.message:"No se pudo confirmar") })
  }, [params])
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-sm">{estado==="cargando"?<><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"/><h1 className="mt-5 text-2xl font-semibold">Confirmando autorización...</h1></>:estado==="ok"?<><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600"/><h1 className="mt-5 text-2xl font-semibold">Autorización confirmada</h1><p className="mt-3 text-slate-600">El reclutador ya quedó asociado a la empresa en PALA. Este enlace no puede volver a utilizarse.</p></>:<><XCircle className="mx-auto h-14 w-14 text-rose-600"/><h1 className="mt-5 text-2xl font-semibold">No se pudo confirmar</h1><p className="mt-3 text-slate-600">{mensaje}</p></>}</div></main>
}

export default function Page(){return <Suspense fallback={null}><Confirmacion/></Suspense>}
