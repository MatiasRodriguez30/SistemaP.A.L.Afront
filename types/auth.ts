export type PalaRol = "POSTULANTE" | "RECLUTADOR" | "ADMINISTRADOR"

export interface TipoEstudianteOption {
  id: number
  nombre: string
}

export interface AuthResponse {
  token: string | null
  tipo: string
  usuarioId: number | null
  mailUsuario: string
  roles: string[]
  permisos: string[]
  perfilCompleto: boolean
  perfilPendiente: string | null
}

export interface ErrorResponse {
  estado?: number
  error?: string
  mensaje?: string
}
