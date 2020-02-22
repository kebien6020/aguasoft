const movementCause = {
  'manual': {
    text: 'Movimiento Manual',
  },
  'in': {
    text: 'Ingreso',
  },
  'relocation': {
    text: 'Reubicacion',
  },
  'production': {
    text: 'Produccion',
  },
  'sell': {
    text: 'Venta',
  },
  'damage': {
    text: 'Daño',
  },
} as const

export const movementCauseSlugToText = (slug: keyof typeof movementCause) =>
  movementCause[slug] ? movementCause[slug].text : undefined

export const movementCauseOptions = Object.keys(movementCause).map((key: keyof typeof movementCause) => ({
    value: key,
    label: movementCauseSlugToText(key),
}))
