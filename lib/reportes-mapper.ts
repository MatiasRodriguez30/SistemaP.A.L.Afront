import type { MetricaReporte } from "@/types/reportes"

export type ConteoPorCarrera = { carrera: string; cantidad: number }
export type CompetenciaAgrupada = { tipoAviso: string; items: { subTipo: string; cantidad: number }[] }

export function agruparPorNombre(metricas: MetricaReporte[]): Record<string, MetricaReporte[]> {
  return metricas.reduce<Record<string, MetricaReporte[]>>((grupos, metrica) => {
    const lista = grupos[metrica.nombre] ?? []
    grupos[metrica.nombre] = [...lista, metrica]
    return grupos
  }, {})
}

export function valorUnico(grupos: Record<string, MetricaReporte[]>, nombre: string): number {
  return grupos[nombre]?.[0]?.valor ?? 0
}

export function mapConteoPorCarrera(grupos: Record<string, MetricaReporte[]>, nombre: string): ConteoPorCarrera[] {
  return (grupos[nombre] ?? []).map((metrica) => ({ carrera: metrica.detalle, cantidad: metrica.valor }))
}

export function agruparCompetencias(grupos: Record<string, MetricaReporte[]>): CompetenciaAgrupada[] {
  const porTipo: Record<string, { subTipo: string; cantidad: number }[]> = {}
  for (const metrica of grupos["CompetenciasMasBuscadas"] ?? []) {
    const [tipoAviso, subTipo] = metrica.detalle.split(" - ")
    const items = porTipo[tipoAviso] ?? []
    porTipo[tipoAviso] = [...items, { subTipo: subTipo ?? metrica.detalle, cantidad: metrica.valor }]
  }
  return Object.entries(porTipo).map(([tipoAviso, items]) => ({ tipoAviso, items }))
}