import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization")
  const contentType = request.headers.get("content-type") ?? ""
  const multipart = contentType.includes("multipart/form-data")
  const response = await fetch(`${PALA_API_URL}/api/postulante/me/postulaciones`, {
    method: "POST",
    headers: authorization ? { Authorization: authorization } : {},
    body: multipart ? await request.formData() : await request.text(),
    cache: "no-store",
  })
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  })
}
