const movementCause = {
  manual: {
    text: 'Movimiento Manual',
  },
  in: {
    text: 'Ingreso',
  },
  relocation: {
    text: 'Reubicacion',
  },
  production: {
    text: 'Produccion',
  },
  sell: {
    text: 'Venta',
  },
  damage: {
    text: 'Daño',
  },
} as const

type MovementCauseSlug = keyof typeof movementCause
type MovementCauseText = typeof movementCause[MovementCauseSlug]['text']

export const movementCauseSlugToText =
  (slug: MovementCauseSlug): MovementCauseText =>
    movementCause[slug].text

export const movementCauseOptions =
  Object
    .keys(movementCause)
    .map((key: MovementCauseSlug) => ({
      value: key,
      label: movementCauseSlugToText(key),
    }))
