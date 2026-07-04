export interface UsuarioAdmin {
  id: number
  usuarioSeguridadId: number | null
  tipo: "ADMINISTRADOR" | "RECLUTADOR" | "POSTULANTE"
  nombre: string
  mail: string
  activo: boolean
  fechaBaja: string | null
}
