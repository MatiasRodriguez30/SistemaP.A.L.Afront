import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authorization = request.headers.get("authorization")
  const response = await fetch(`${PALA_API_URL}/api/notificaciones/${id}/leer`, {
    method: "PATCH",
    headers: authorization ? { Authorization: authorization } : {},
    cache: "no-store",
  })
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  })
}
