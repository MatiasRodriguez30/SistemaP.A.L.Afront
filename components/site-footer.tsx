import Image from "next/image"
import Link from "next/link"
import { Github, Instagram, Linkedin, Mail } from "lucide-react"

const ENLACES_PLATAFORMA = [
  { href: "/#avisos", label: "Avisos" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/login", label: "Iniciar sesión" },
  { href: "/register", label: "Registrarse" },
]

const REDES = [
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "LinkedIn", icon: Linkedin },
  { href: "#", label: "GitHub", icon: Github },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3 col-span-2 lg:col-span-1">
          <Image
            src="/logo-pala.jpeg"
            alt="PALA"
            width={100}
            height={50}
            className="h-9 w-auto object-contain"
          />
          <p className="text-sm text-muted-foreground max-w-xs">
            Plataforma de Acceso Laboral para Alumnos. Conectamos estudiantes con oportunidades reales.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Plataforma</p>
          <ul className="space-y-2">
            {ENLACES_PLATAFORMA.map((enlace) => (
              <li key={enlace.label}>
                <Link href={enlace.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {enlace.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Contacto</p>
          <a
            href="mailto:contacto@pala.edu.ar"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-4 w-4" />
            contacto@pala.edu.ar
          </a>
          <p className="text-sm text-muted-foreground">Mendoza, Argentina</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Seguinos</p>
          <div className="flex gap-3">
            {REDES.map((red) => (
              <a
                key={red.label}
                href={red.href}
                aria-label={red.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                <red.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t">
        <p className="max-w-6xl mx-auto px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} PALA — Plataforma de Acceso Laboral para Alumnos. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
