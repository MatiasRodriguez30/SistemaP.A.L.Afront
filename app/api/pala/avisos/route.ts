import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization")

  try {
    const response = await fetch(`${PALA_API_URL}/api/avisos/disponibles`, {
      headers: authorization ? { Authorization: authorization } : {},
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
    console.error("[/api/pala/avisos] Error al contactar el backend:", err)
    return NextResponse.json(
      { mensaje: "No se pudo conectar con el servidor. Intente nuevamente mas tarde." },
      { status: 502 }
    )
  }
}
