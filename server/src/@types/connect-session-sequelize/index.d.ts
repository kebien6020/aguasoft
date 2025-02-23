declare module 'connect-session-sequelize' {
  import * as Sequelize from 'sequelize'
  import * as session from 'express-session'

  export = ConnectSessionSequelize

  namespace ConnectSessionSequelize {
    export type ExtendDefaultFieldsCallback = (
      defaults: {
        data: unknown
        expires: unknown
      },
      session: session.Session
    ) => {
      data: unknown
      expires: unknown
      userId: unknown
    }

    export interface SequelizeStoreOptions {
      db: Sequelize.Sequelize,
      table?: string
      extendDefaultFields?: ExtendDefaultFieldsCallback
    }

    export class SequelizeStore extends session.Store {
      constructor(options: SequelizeStoreOptions)
      get(sid: string, callback: (err: unknown, session?: session.SessionData) => void): void
      set(sid: string, session: session.SessionData, callback?: (err?: unknown) => void): void
      destroy(sid: string, callback?: (err?: unknown) => void): void
    }
  }

  function ConnectSessionSequelize(
    store: typeof session.Store
  ): typeof ConnectSessionSequelize.SequelizeStore

}
