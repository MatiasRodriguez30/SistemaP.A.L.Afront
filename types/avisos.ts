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

// Shapes reales devueltas por el backend (AvisoController), distintas a las del mock.
export interface AvisoTipoApi {
  nombreTipoAviso: string
  subTiposAviso: string[]
}

export interface AvisoResumenApi {
  id: number
  nombreAviso: string
  descripcionAviso: string
  fechaCierreAviso: string
  razonSocialEmpresa: string
  nombreReclutador: string
  carreras: string[]
  tiposAviso: AvisoTipoApi[]
}

export interface AvisoDetalleApi extends AvisoResumenApi {
  fechaCreacionAviso: string
  imagenUrlAviso: string
}

export interface SolicitudAsociacionCreatePayload {
  cuitEmpresaSolicitud: string
  razonSocialEmpresaSolicitud?: string
  mailEmpresaSolicitud?: string
  telefonoEmpresaSolicitud?: string
}

export interface SolicitudAsociacionResponse {
  id: number
  cuitEmpresaSolicitud: string
  razonSocialEmpresaSolicitud: string
  mailEmpresaSolicitud: string
  telefonoEmpresaSolicitud: string
  estadoSolicitud: string
  fechaEnvioSolicitud: string
}

export interface EmpresaActivaResponse {
  id: number
  cuitEmpresa: string
  razonSocialEmpresa: string
}
