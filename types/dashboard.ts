export type PostulantesPorCarrera = {
  carrera: string
  cantidad: number
}

export type DashboardAdmin = {
  usuariosTotales: number
  reclutadores: number
  postulantes: number
  postulantesPorCarrera: PostulantesPorCarrera[]
}
