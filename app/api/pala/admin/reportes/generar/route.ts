import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const nroAdministrador = searchParams.get("nroAdministrador")
  if (!nroAdministrador) {
    return NextResponse.json({ mensaje: "Falta el parámetro nroAdministrador" }, { status: 400 })
  }

  const response = await fetch(
    `${PALA_API_URL}/api/admin/reportes/generar?nroAdministrador=${nroAdministrador}`,
    { method: "POST", headers: { Authorization: authorization }, cache: "no-store" },
  )

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  })
}