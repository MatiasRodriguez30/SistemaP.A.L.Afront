import { NextResponse } from "next/server"

// Este endpoint consulta el sistema PALA, no el subsistema de seguridad.
const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET() {
  const response = await fetch(`${PALA_API_URL}/api/auth/soporte/tipos-estudiante`, {
    cache: "no-store",
  })

  const text = await response.text()

  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  })
}
