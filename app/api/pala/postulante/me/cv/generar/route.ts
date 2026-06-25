import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization")

  const response = await fetch(`${PALA_API_URL}/api/postulante/me/cv/generar`, {
    method: "POST",
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
}
