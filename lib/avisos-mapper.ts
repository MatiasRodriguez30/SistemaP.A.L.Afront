import type { Aviso, AvisoDetalleApi, AvisoResumenApi, AvisoTipoApi } from "@/types/avisos"

const IMAGEN_PLACEHOLDER = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop"

function mapTiposAviso(tiposAviso: AvisoTipoApi[]) {
  return tiposAviso.map((tipo) => ({
    nombreTipoAviso: tipo.nombreTipoAviso,
    subTipos: tipo.subTiposAviso.map((nombre) => ({ nombreSubTipoAviso: nombre })),
  }))
}

export function mapAvisoResumen(api: AvisoResumenApi): Aviso {
  return {
    nroAviso: api.id,
    nombreAviso: api.nombreAviso,
    descripcionAviso: api.descripcionAviso,
    fechaCierreAviso: api.fechaCierreAviso,
    fechaCreacionAviso: api.fechaCierreAviso,
    imagenUrlAviso: IMAGEN_PLACEHOLDER,
    empresa: { nombreEmpresa: api.razonSocialEmpresa },
    reclutador: { nombreReclutador: api.nombreReclutador },
    carreras: api.carreras.map((nombre) => ({ nombreCarrera: nombre })),
    tiposAviso: mapTiposAviso(api.tiposAviso),
    estadoAviso: { nombreEstadoAviso: "Abierto", fechaBajaEstadoAviso: null },
  }
}

export function mapAvisoDetalle(api: AvisoDetalleApi): Aviso {
  return {
    ...mapAvisoResumen(api),
    fechaCreacionAviso: api.fechaCreacionAviso,
    imagenUrlAviso: api.imagenUrlAviso || IMAGEN_PLACEHOLDER,
  }
}
