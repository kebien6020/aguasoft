export type Tank = 'tank1' | 'tank2'

export interface StatePayload {
  stage_1?: Partial<{
    current_state: string
    pre_fill_elapsed: number
    pre_fill_total: number
    pre_fill_start?: Date
    pre_fill_end?: Date
    safety_elapsed: number
    safety_total: number
    safety_start?: Date
    safety_end?: Date
    recir_elapsed: number
    recir_total: number
    recir_start?: Date
    recir_end?: Date
    active_tank: Tank
    sensors: Partial<{
      sensor1Hi: boolean
      sensor2Hi: boolean
      sensorAqLo: boolean
      sensorAqHi: boolean
    }>
  }>
  stage_2?: Partial<{
    current_state: string
    active_tank: Tank
  }>
  aqueduct_fsm?: Partial<{
    current_state: string
    filling_duration: number
    filling_time?: Date
    sensors: Partial<{
      sensorAqLo: boolean
      sensorAqHi: boolean
    }>
  }>
}
