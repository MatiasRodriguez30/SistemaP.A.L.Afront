import type { TipoEstudianteOption } from "@/types/auth"

export interface CarreraOption {
  id: number
  nombreCarrera: string
}

export interface PostulanteCarrera {
  id: number
  carreraId: number
  nombreCarrera: string
  fechaDesdePostulanteCarrera: string | null
  fechaHastaPostulanteCarrera: string | null
}

export interface Experiencia {
  id: number
  descripcionExperiencia: string | null
  fechaDesdeExp: string | null
  fechaHastaExp: string | null
  nombreCargoExperiencia: string
  nombreEmpresaExperiencia: string
}

export interface ExperienciaAcademica {
  id: number
  nombreInstitucionExpAcademica: string
  tituloExpAcademica: string
  fechaDesdeExpAcademica: string | null
  fechaHastaExpAcademica: string | null
}

export interface Habilidad {
  id: number
  nombreHabilidad: string
}

export interface PostulantePerfil {
  id: number
  nombrePostulante: string
  apellidoPostulante: string
  fechaNacimientoPostulante: string | null
  legajoAcademicoPostulante: number
  mailAcademicoPostulante: string | null
  mailPersonalPostulante: string
  urlCVGuardado: string | null
  cvNombreArchivo: string | null
  tipoEstudiante: TipoEstudianteOption | null
  carreras: PostulanteCarrera[]
  experiencias: Experiencia[]
  experienciasAcademicas: ExperienciaAcademica[]
  habilidades: Habilidad[]
}
