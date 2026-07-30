export type MetricaReporte = {
  nombre: string
  valor: number
  detalle: string
}

export type Reporte = {
  idReporte: number
  fechaHora: string
  administradorGenerador: string
  metricas: MetricaReporte[]
}