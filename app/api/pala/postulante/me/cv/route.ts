import { NextResponse } from "next/server"

const PALA_API_URL = (process.env.PALA_API_URL ?? "http://localhost:8082").trim()

export async function POST(request: Request) {
  const formData = await request.formData()
  const authorization = request.headers.get("authorization")

  const response = await fetch(`${PALA_API_URL}/api/postulante/me/cv`, {
    method: "POST",
    headers: authorization ? { Authorization: authorization } : {},
    body: formData,
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

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization")

  const response = await fetch(`${PALA_API_URL}/api/postulante/me/cv`, {
    headers: authorization ? { Authorization: authorization } : {},
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    })
  }

  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/pdf",
    },
  })
}
