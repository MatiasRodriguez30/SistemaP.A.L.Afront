import { NextResponse } from "next/server"
const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()
export async function GET(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })
  const response = await fetch(`${API}/api/admin/estados/avisos`, { headers: { Authorization: authorization }, cache: "no-store" })
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } })
}
