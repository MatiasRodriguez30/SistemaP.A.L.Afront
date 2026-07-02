import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "Sesion no autenticada." }, { status: 401 })

  try {
    const response = await fetch(`${PALA_API_URL}/api/solicitudes-asociacion`, {
      headers: { Authorization: authorization },
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

export async function POST(request: Request) {
  const payload = await request.json()
  const authorization = request.headers.get("authorization")

  if (!authorization) {
    return NextResponse.json(
      { mensaje: "No llego el Authorization al proxy de PALA." },
      { status: 401 }
    )
  }

  try {
    const response = await fetch(`${PALA_API_URL}/api/solicitudes-asociacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const text = await response.text()

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (err) {
    console.error("[/api/pala/solicitudes-asociacion] Error al contactar el backend:", err)
    return NextResponse.json(
      { mensaje: "No se pudo conectar con el servidor. Intente nuevamente mas tarde." },
      { status: 502 }
    )
  }
}
