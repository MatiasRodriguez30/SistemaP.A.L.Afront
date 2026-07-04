import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request) {
  return proxy(request, "/api/admin/estados/postulaciones", "GET")
}

async function proxy(request: Request, path: string, method: string, body?: string) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: authorization, "Content-Type": "application/json" },
    body,
    cache: "no-store",
  })
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  })
}
