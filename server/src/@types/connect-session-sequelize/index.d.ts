declare module "connect-session-sequelize" {
  import * as Sequelize from 'sequelize'
  import * as session from 'express-session'

  export = ConnectSessionSequelize

  namespace ConnectSessionSequelize {
    export type ExtendDefaultFieldsCallback = (
      defaults: {
        data: any
        expires: any
      },
      session: Express.Session
    ) => {
      data: any
      expires: any
      userId: any
    }

    export interface SequelizeStoreOptions {
      db: Sequelize.Sequelize,
      table?: string
      extendDefaultFields?: ExtendDefaultFieldsCallback
    }

    export class SequelizeStore extends session.Store {
      constructor(options: SequelizeStoreOptions)
    }
  }

  function ConnectSessionSequelize (
    store: typeof session.Store
  ): typeof ConnectSessionSequelize.SequelizeStore

}
