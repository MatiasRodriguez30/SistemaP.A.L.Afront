import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tipo: string; id: string }> },
) {
  const { tipo, id } = await params
  const authorization = request.headers.get("authorization")
  const response = await fetch(`${API}/api/admin/usuarios/${tipo}/${id}/estado`, {
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
