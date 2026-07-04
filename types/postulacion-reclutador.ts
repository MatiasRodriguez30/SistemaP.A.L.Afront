export type PostulacionReclutador = {
  id: number
  fechaPostulacion: string
  descripcionPostulacion: string
  codigoEstado: string
  nombreEstado: string
  postulanteId: number
  nombrePostulante: string
  apellidoPostulante: string
  mailPostulante: string
  nombreCv: string
  urlCv: string
  fechaReunion: string | null
  enlaceReunion: string | null
}
