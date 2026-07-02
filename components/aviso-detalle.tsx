"use client"

import { Aviso } from "@/types/avisos"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  User,
  Calendar,
  GraduationCap,
  Tag,
  ArrowLeft,
  Send,
  CalendarPlus,
  Image as ImageIcon,
} from "lucide-react"
import { CARRERA_BADGE_CLASS, avisoAccentBarClass, tipoAvisoBadgeClass } from "@/lib/aviso-colors"

interface AvisoDetalleProps {
  aviso: Aviso
  onRegresar: () => void
  onPrimaryAction: (nroAviso: number) => void
  primaryActionLabel: string
  primaryActionDisabled?: boolean
}

export function AvisoDetalle({
  aviso,
  onRegresar,
  onPrimaryAction,
  primaryActionLabel,
  primaryActionDisabled,
}: AvisoDetalleProps) {
  return (
    <Card className="max-w-4xl mx-auto overflow-hidden">
      <div className={`h-1.5 w-full bg-gradient-to-r ${avisoAccentBarClass(aviso.nroAviso)}`} />
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{aviso.nombreAviso}</h2>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            Imagen del Aviso
          </div>
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
            <img
              src={aviso.imagenUrlAviso}
              alt={aviso.nombreAviso}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="font-semibold">Descripción</h3>
          <p className="text-muted-foreground leading-relaxed">{aviso.descripcionAviso}</p>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="font-medium">{aviso.empresa.nombreEmpresa}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reclutador</p>
                <p className="font-medium">{aviso.reclutador.nombreReclutador}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CalendarPlus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Creación</p>
              <p className="font-medium">
                {new Date(aviso.fechaCreacionAviso).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de Cierre</p>
              <p className="font-medium">
                {new Date(aviso.fechaCierreAviso).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold">Carreras Relacionadas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {aviso.carreras.map((carrera, index) => (
              <Badge key={index} variant="outline" className={`px-3 py-1 ${CARRERA_BADGE_CLASS}`}>
                {carrera.nombreCarrera}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-fuchsia-500" />
            <h3 className="font-semibold">Tipos de Aviso</h3>
          </div>
          <div className="space-y-4">
            {aviso.tiposAviso.map((tipo, index) => (
              <div key={index}>
                <p className="text-sm font-medium text-foreground mb-2">{tipo.nombreTipoAviso}</p>
                {tipo.subTipos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tipo.subTipos.map((subTipo, subIndex) => (
                      <Badge
                        key={subIndex}
                        variant="outline"
                        className={`px-3 py-1 ${tipoAvisoBadgeClass(tipo.nombreTipoAviso)}`}
                      >
                        {subTipo.nombreSubTipoAviso}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onRegresar}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Regresar
        </Button>
        <Button
          className={`w-full sm:w-auto ${
            primaryActionDisabled
              ? ""
              : "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 border-0 text-white"
          }`}
          onClick={() => onPrimaryAction(aviso.nroAviso)}
          disabled={primaryActionDisabled}
          title={primaryActionDisabled ? "Disponible próximamente" : undefined}
        >
          <Send className="mr-2 h-4 w-4" />
          {primaryActionDisabled ? "Disponible próximamente" : primaryActionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
