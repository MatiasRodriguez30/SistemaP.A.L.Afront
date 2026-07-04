import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function POST(request: Request, { params }: { params: Promise<{ avisoId: string }> }) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })
  const { avisoId } = await params
  const response = await fetch(`${API}/api/postulante/me/avisos/${avisoId}/cv-ia`, {
    method: "POST", headers: { Authorization: authorization }, cache: "no-store",
  })
  if (!response.ok) return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } })
  return new NextResponse(await response.arrayBuffer(), { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=cv-adaptado.pdf" } })
}
