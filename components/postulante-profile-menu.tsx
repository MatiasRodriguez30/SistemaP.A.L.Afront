"use client"

import { useRouter } from "next/navigation"
import { ClipboardList, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PostulanteProfileMenuProps {
  rutaPerfil: "/perfil" | "/admin/perfil" | "/reclutador"
}

export function PostulanteProfileMenu({ rutaPerfil }: PostulanteProfileMenuProps) {
  const router = useRouter()
  const esPostulante = rutaPerfil === "/perfil"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-indigo-50 hover:text-indigo-600">
          <User className="h-5 w-5" />
          <span className="sr-only">Perfil</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(rutaPerfil)}>
          <User className="mr-2 h-4 w-4" />
          Mi perfil
        </DropdownMenuItem>
        {esPostulante && (
          <DropdownMenuItem onClick={() => router.push("/postulaciones")}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Mis postulaciones
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
