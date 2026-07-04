import { NextResponse } from "next/server"

const API = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

async function proxy(request: Request, params: Promise<{ path: string[] }>) {
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })
  const { path } = await params
  const response = await fetch(`${API}/api/admin/catalogos/${path.join("/")}`, {
    method: request.method,
    headers: { Authorization: authorization, "Content-Type": "application/json" },
    body: request.method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  })
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } })
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return proxy(request, params) }
export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return proxy(request, params) }
export async function PATCH(request: Request, { params }: { params: Promise<{ path: string[] }> }) { return proxy(request, params) }
