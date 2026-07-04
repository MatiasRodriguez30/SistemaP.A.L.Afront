export type EstadoPostulacionAdmin = {
  id: number
  codigoInterno: string
  nombre: string
  fechaAlta: string
  fechaBaja: string | null
  postulacionesActuales: number
}
