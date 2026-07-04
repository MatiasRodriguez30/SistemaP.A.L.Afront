export type EstadoSolicitudAdmin = {
  id: number
  codigoInterno: string
  nombre: string
  fechaAlta: string
  fechaBaja: string | null
  solicitudesActuales: number
}
