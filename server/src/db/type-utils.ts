import { Model, BuildOptions, ModelCtor } from 'sequelize'

export type ModelStatic<ModelType = unknown> = typeof Model & {
  new (values?: Record<string, unknown>, options?: BuildOptions): ModelType
  associate?: (models: {[idx:string]: ModelCtor<Model>}) => unknown
}
