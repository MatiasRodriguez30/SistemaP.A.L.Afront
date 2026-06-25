// Paleta de color compartida entre AvisoCard y AvisoDetalle: cada categoria de
// "tipo de aviso" tiene un color fijo, y cada aviso recibe una franja de acento
// que rota segun su id para que el listado no se vea monocromatico.

const TIPO_BADGE_COLORS: Record<string, string> = {
  "Modalidad de trabajo":
    "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  "Tipo de contrato":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  "Experiencia requerida":
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  "Duración":
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  Alcance:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
}

const TIPO_BADGE_FALLBACK =
  "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-300 dark:border-fuchsia-800"

export function tipoAvisoBadgeClass(nombreTipoAviso: string): string {
  return TIPO_BADGE_COLORS[nombreTipoAviso] ?? TIPO_BADGE_FALLBACK
}

export const CARRERA_BADGE_CLASS =
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"

const ACCENT_BARS = [
  "from-indigo-500 via-violet-500 to-fuchsia-500",
  "from-sky-500 via-cyan-500 to-teal-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-emerald-500 via-lime-500 to-yellow-500",
]

export function avisoAccentBarClass(nroAviso: number): string {
  return ACCENT_BARS[nroAviso % ACCENT_BARS.length]
}
