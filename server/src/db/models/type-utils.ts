import { Model, BuildOptions, ModelCtor } from 'sequelize'

export type ModelStatic<ModelType = {}> = typeof Model & {
  new (values?: object, options?: BuildOptions): ModelType
  associate?: (models: {[idx:string]: ModelCtor<Model>}) => any
}
