import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const response = await fetch(`${PALA_API_URL}/api/avisos/recomendados/${id}`, {
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
    console.error(`[/api/pala/avisos/recomendados/${id}] Error al contactar el backend:`, err)
    return NextResponse.json(
      { mensaje: "No se pudo conectar con el servidor. Intente nuevamente mas tarde." },
      { status: 502 }
    )
  }
}
