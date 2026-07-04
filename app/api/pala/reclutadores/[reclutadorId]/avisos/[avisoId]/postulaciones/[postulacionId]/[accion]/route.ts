import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()
const acciones = new Set(["citar", "aceptar", "rechazar"])

export async function PATCH(request: Request, { params }: { params: Promise<{ reclutadorId: string; avisoId: string; postulacionId: string; accion: string }> }) {
  const { reclutadorId, avisoId, postulacionId, accion } = await params
  if (!acciones.has(accion)) return NextResponse.json({ mensaje: "Accion invalida" }, { status: 404 })
  const authorization = request.headers.get("authorization")
  const response = await fetch(`${API}/api/reclutadores/${reclutadorId}/avisos/${avisoId}/postulaciones/${postulacionId}/${accion}`, {
    method: "PATCH",
    headers: { ...(authorization ? { Authorization: authorization } : {}), "Content-Type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  })
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  })
}
