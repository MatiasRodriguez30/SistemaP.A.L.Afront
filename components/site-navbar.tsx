"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface SiteNavbarProps {
  activeHref?: string
}

export function SiteNavbar({ activeHref }: SiteNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-indigo-100 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo-pala.jpeg"
              alt="PALA - Plataforma de Acceso Laboral para Alumnos"
              width={120}
              height={60}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar sesión</Link>
          </Button>
          <Button
            asChild
            className="border-0 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm shadow-indigo-200 hover:from-indigo-500 hover:to-fuchsia-500 hover:shadow-md hover:shadow-indigo-200"
          >
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
