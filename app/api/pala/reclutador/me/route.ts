import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

async function proxy(request: Request, method: "GET" | "PATCH") {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })
  try {
    const response = await fetch(`${API}/api/reclutador/me`, {
      method,
      headers: { Authorization: authorization, ...(method === "PATCH" ? { "Content-Type": "application/json" } : {}) },
      body: method === "PATCH" ? await request.text() : undefined,
      cache: "no-store",
    })
    const text = await response.text()
    return text ? new NextResponse(text, { status: response.status, headers: { "Content-Type": "application/json" } }) : new NextResponse(null, { status: response.status })
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el backend de PALA" }, { status: 503 })
  }
}

export async function GET(request: Request) { return proxy(request, "GET") }
export async function PATCH(request: Request) { return proxy(request, "PATCH") }
