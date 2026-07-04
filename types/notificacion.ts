export type Notificacion = {
  id: number
  titulo: string
  mensaje: string
  tipo: string | null
  urlDestino: string | null
  fechaCreacion: string
  fechaLectura: string | null
}
