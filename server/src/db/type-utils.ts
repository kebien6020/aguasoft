import { Model, BuildOptions } from 'sequelize'

export type ModelStatic<ModelType = unknown> = typeof Model & {
  new(values?: Record<string, unknown>, options?: BuildOptions): ModelType
  associate?: (models: { [idx: string]: ModelStatic<ModelType> }) => unknown
}
