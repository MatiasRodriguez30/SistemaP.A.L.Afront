import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })
  const { id } = await params
  const response = await fetch(`${API}/api/admin/estados/solicitudes-asociacion/${id}`, {
    method: "PATCH", headers: { Authorization: authorization, "Content-Type": "application/json" }, body: await request.text(),
  })
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } })
}
