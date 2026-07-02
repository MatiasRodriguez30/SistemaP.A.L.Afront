import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxy(request, `/api/solicitudes-asociacion/${id}`)
}

async function proxy(request: Request, path: string, init?: RequestInit) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "Sesion no autenticada." }, { status: 401 })
  try {
    const response = await fetch(`${PALA_API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: authorization },
      cache: "no-store",
    })
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    })
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con el backend." }, { status: 502 })
  }
}

export { proxy }
