export type HistorialSolicitud = {
  codigo: string
  estado: string
  fechaInicio: string
  fechaFin: string | null
}

export type SolicitudAsociacionAdmin = {
  id: number
  fechaEnvio: string
  fechaResolucion: string | null
  codigoEstado: "ENVIADA" | "EN_EVALUACION" | "ACEPTADA" | "RECHAZADA" | "RESUELTA"
  estado: string
  reclutador: { id: number; nombre: string; apellido: string | null; mail: string; cuil: string; descripcion: string | null }
  empresa: { razonSocial: string; cuit: string; mail: string; telefono: string; existente: boolean }
  observacionesInternas: string | null
  tomadaPor: { id: number; nombre: string; apellido: string; mail: string } | null
  resueltaPor: { id: number; nombre: string; apellido: string; mail: string } | null
  aceptadaPor: "EMPRESA" | "ADMINISTRADOR" | null
  fechaEnvioConfirmacion: string | null
  fechaConfirmacionEmpresa: string | null
  historial: HistorialSolicitud[]
}
