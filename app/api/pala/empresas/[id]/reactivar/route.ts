import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "Sesion no autenticada." }, { status: 401 })
  try {
    const response = await fetch(`${PALA_API_URL}/api/empresas/${(await params).id}/reactivar`, {
      method: "PATCH", headers: { Authorization: authorization }, cache: "no-store",
    })
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el backend." }, { status: 502 })
  }
}
