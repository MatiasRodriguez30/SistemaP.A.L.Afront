export type TipoEstudianteAdmin = { id: number; nombre: string; fechaAlta: string; fechaBaja: string | null; postulantes: number }
export type SubtipoAvisoAdmin = { id: number; nombre: string; fechaBaja: string | null }
export type TipoAvisoAdmin = { id: number; nombre: string; descripcion: string | null; fechaBaja: string | null; subtipos: SubtipoAvisoAdmin[] }
