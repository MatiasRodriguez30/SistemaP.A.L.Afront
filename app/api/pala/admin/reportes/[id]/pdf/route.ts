import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authorization = request.headers.get("authorization")
  if (!authorization) return NextResponse.json({ mensaje: "No autenticado" }, { status: 401 })

  const response = await fetch(`${PALA_API_URL}/api/admin/reportes/${id}/pdf`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  })

  if (!response.ok) return new NextResponse(await response.text(), { status: response.status })

  return new NextResponse(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": response.headers.get("content-disposition") ?? `attachment; filename="reporte_${id}.pdf"`,
    },
  })
}