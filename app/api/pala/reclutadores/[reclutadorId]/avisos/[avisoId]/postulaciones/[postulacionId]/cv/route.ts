import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request, { params }: { params: Promise<{ reclutadorId: string; avisoId: string; postulacionId: string }> }) {
  const { reclutadorId, avisoId, postulacionId } = await params
  const authorization = request.headers.get("authorization")
  const response = await fetch(`${API}/api/reclutadores/${reclutadorId}/avisos/${avisoId}/postulaciones/${postulacionId}/cv`, {
    headers: authorization ? { Authorization: authorization } : {},
    cache: "no-store",
  })
  if (!response.ok) return new NextResponse(await response.text(), { status: response.status })
  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": response.headers.get("content-disposition") ?? "inline",
    },
  })
}
