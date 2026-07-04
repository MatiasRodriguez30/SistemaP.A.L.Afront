export type PostulacionPostulante = {
  id: number
  avisoId: number
  nombreAviso: string
  razonSocialEmpresa: string
  nombreReclutador: string
  descripcionPostulacion: string
  fechaPostulacion: string
  codigoEstado: string
  nombreEstado: string
  fechaReunion: string | null
  enlaceReunion: string | null
  fechaBajaPostulacion: string | null
}
