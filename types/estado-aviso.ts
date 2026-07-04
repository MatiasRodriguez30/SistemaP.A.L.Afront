export type EstadoAvisoAdmin = {
  id: number
  codigoInterno: string
  nombre: string
  fechaAlta: string
  fechaBaja: string | null
  avisosActuales: number
}
