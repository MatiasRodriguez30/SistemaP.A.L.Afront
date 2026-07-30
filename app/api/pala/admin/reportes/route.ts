import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })

  const response = await fetch(`${PALA_API_URL}/api/admin/reportes`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  })

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  })
}