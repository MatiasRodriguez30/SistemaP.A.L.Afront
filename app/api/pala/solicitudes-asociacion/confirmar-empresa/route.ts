import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")
  if (!token) return NextResponse.json({ mensaje: "Token requerido" }, { status: 400 })
  try {
    const response = await fetch(`${API}/api/solicitudes-asociacion/confirmar-empresa?token=${encodeURIComponent(token)}`, { cache: "no-store" })
    return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" } })
  } catch {
    return NextResponse.json({ mensaje: "No se pudo conectar con PALA" }, { status: 502 })
  }
}
