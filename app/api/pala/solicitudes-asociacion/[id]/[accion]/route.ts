import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()
const ACCIONES = new Set(["tomar", "aceptar", "rechazar"])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; accion: string }> }
) {
  const { id, accion } = await params
  if (!ACCIONES.has(accion)) return NextResponse.json({ mensaje: "Accion invalida." }, { status: 404 })
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "Sesion no autenticada." }, { status: 401 })

  try {
    const body = await request.text()
    const response = await fetch(`${PALA_API_URL}/api/solicitudes-asociacion/${id}/${accion}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: authorization },
      body: body || "{}",
      cache: "no-store",
    })
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el backend." }, { status: 502 })
  }
}
