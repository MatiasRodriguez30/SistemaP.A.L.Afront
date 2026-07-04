import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function PATCH(request: Request) {
  const authorization = request.headers.get("authorization")
  const response = await fetch(`${PALA_API_URL}/api/notificaciones/leer-todas`, {
    method: "PATCH",
    headers: authorization ? { Authorization: authorization } : {},
    cache: "no-store",
  })
  const text = await response.text()
  return new NextResponse(text || null, { status: response.status })
}
