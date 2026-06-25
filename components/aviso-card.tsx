"use client"

import { Aviso } from "@/types/avisos"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Calendar, GraduationCap, Tag } from "lucide-react"
import { CARRERA_BADGE_CLASS, avisoAccentBarClass, tipoAvisoBadgeClass } from "@/lib/aviso-colors"

interface AvisoCardProps {
  aviso: Aviso
  onSelect: (nroAviso: number) => void
}

export function AvisoCard({ aviso, onSelect }: AvisoCardProps) {
  return (
    <Card
      className="cursor-pointer overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-950/40 hover:border-indigo-300"
      onClick={() => onSelect(aviso.nroAviso)}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${avisoAccentBarClass(aviso.nroAviso)}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{aviso.nombreAviso}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {aviso.descripcionAviso}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-indigo-500" />
            <span>{aviso.empresa.nombreEmpresa}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-violet-500" />
            <span>{aviso.reclutador.nombreReclutador}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span>Cierra: {new Date(aviso.fechaCierreAviso).toLocaleDateString("es-AR")}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-medium text-muted-foreground">Carreras:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {aviso.carreras.map((carrera, index) => (
              <Badge key={index} variant="outline" className={`text-xs ${CARRERA_BADGE_CLASS}`}>
                {carrera.nombreCarrera}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-fuchsia-500" />
            <span className="text-xs font-medium text-muted-foreground">Tipos de Aviso:</span>
          </div>
          <div className="space-y-2">
            {aviso.tiposAviso.map((tipo, index) => (
              <div key={index}>
                <p className="text-xs font-medium text-foreground">{tipo.nombreTipoAviso}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tipo.subTipos.map((subTipo, subIndex) => (
                    <Badge
                      key={subIndex}
                      variant="outline"
                      className={`text-xs ${tipoAvisoBadgeClass(tipo.nombreTipoAviso)}`}
                    >
                      {subTipo.nombreSubTipoAviso}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
