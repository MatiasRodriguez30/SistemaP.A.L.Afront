export interface SubTipoAviso {
  nombreSubTipoAviso: string
}

export interface TipoAviso {
  nombreTipoAviso: string
  subTipos: SubTipoAviso[]
}

export interface Carrera {
  nombreCarrera: string
}

export interface Empresa {
  nombreEmpresa: string
}

export interface Reclutador {
  nombreReclutador: string
}

export interface EstadoAviso {
  nombreEstadoAviso: string
  fechaBajaEstadoAviso: string | null
}

export interface Aviso {
  nroAviso: number
  nombreAviso: string
  descripcionAviso: string
  fechaCierreAviso: string
  fechaCreacionAviso: string
  imagenUrlAviso: string
  empresa: Empresa
  reclutador: Reclutador
  carreras: Carrera[]
  tiposAviso: TipoAviso[]
  estadoAviso: EstadoAviso
}

export interface EstadoPostulacion {
  nombreEstadoPostulacion: string
  fechaBajaEstadoPostulacion: string | null
}

export interface PostulacionEstado {
  contadorPostulacionEstado: number
  fechaInicioVigenciaEP: string
  fechaFinVigenciaEP: string | null
  estadoPostulacion: EstadoPostulacion
}

export interface Postulante {
  nroPostulante: number
  nombrePostulante: string
  fechaBajaPostulante: string | null
  urlCVGuardado: string | null
}

export interface Postulacion {
  nroPostulacion: number
  fechaPostulacion: string
  descripcionPostulacion: string
  urlCVPostulacion: string
  estadoPostulacion: EstadoPostulacion
  postulacionEstado: PostulacionEstado
  postulante: Postulante
  aviso: Aviso
}
