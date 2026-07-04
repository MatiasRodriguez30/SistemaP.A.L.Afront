import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ reclutadorId: string; empresaId: string }> },
) {
  const { reclutadorId, empresaId } = await params
  const authorization = request.headers.get("authorization")
  const response = await fetch(`${API}/api/reclutadores/${reclutadorId}/empresas/${empresaId}`, {
    method: "DELETE",
    headers: authorization ? { Authorization: authorization } : {},
    cache: "no-store",
  })

  return new NextResponse(response.status === 204 ? null : await response.text(), {
    status: response.status,
    headers: response.status === 204 ? undefined : { "Content-Type": "application/json" },
  })
}
