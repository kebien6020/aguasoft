import { Database } from 'better-sqlite3'
import { Statement } from 'better-sqlite3'
import { Store as BaseSessionStore, SessionData } from 'express-session'
import debug from 'debug'

const logTiming = debug('app:session:timing')

export class SessionStore extends BaseSessionStore {
  #db: Database
  #tableName: string
  #age: number

  #getStmt: Statement<{ sid: string }, { data: string }>
  #setStmt: Statement<{ sid: string, expires: string, data: string }, void>
  #destroyStmt: Statement<{ sid: string }, void>
  #lengthStmt: Statement<[], { count: number }>
  #allStmt: Statement<[], { sid: string, expires: string, data: string }>
  #clearStmt: Statement<[], void>
  // #touchStmt: Statement<{ sid: string, expires: string }, void>

  constructor(db: Database, tableName: string, age: number = 86400 * 1000) {
    super()
    this.#db = db
    this.#tableName = tableName
    this.#age = age

    this.#getStmt = this.#db.prepare(`
      select data from ${this.#tableName}
      where sid = @sid
      and datetime('now') < datetime(expires)
    `)
    this.#setStmt = this.#db.prepare(`
      insert or replace into ${this.#tableName}
      (sid, expires, data) values
      (@sid, @expires, @data)
    `)

    this.#destroyStmt = this.#db.prepare(`
      delete from ${this.#tableName}
      where sid = @sid
    `)

    this.#lengthStmt = this.#db.prepare(`
      select count(*) as count from ${this.#tableName}
    `)

    this.#allStmt = this.#db.prepare(`
      select sid, expires, data from ${this.#tableName}
    `)

    this.#clearStmt = this.#db.prepare(`
      delete from ${this.#tableName}
    `)

    // this.#touchStmt = this.#db.prepare(`
    //   update ${this.#tableName}
    //   set expires = @expires
    //   where sid = @sid
    // `)
  }

  get(sid: string, callback: (err: unknown, session?: SessionData | null) => void): void {
    try {
      const start = performance.now()
      const row = this.#getStmt.get({ sid })
      const end = performance.now()
      logTiming('SessionStore.get %s: %dms', sid, (end - start).toFixed(3))
      if (!row) {
        callback(undefined, undefined)
        return
      }
      const session: SessionData = JSON.parse(row.data)
      callback(undefined, session)
    } catch (err) {
      callback(err, undefined)
    }
  }

  set(sid: string, session: SessionData, callback?: (err?: unknown) => void): void {
    const expires = new Date(Date.now() + this.#age).toISOString()
    const data = JSON.stringify(session)

    try {
      const start = performance.now()
      this.#setStmt.run({ sid, expires, data })
      const end = performance.now()
      logTiming('SessionStore.set %s: %dms', sid, (end - start).toFixed(3))
      callback?.()
    } catch (err) {
      callback?.(err)
    }
  }

  destroy(sid: string, callback?: (err?: unknown) => void): void {
    try {
      const start = performance.now()
      this.#destroyStmt.run({ sid })
      const end = performance.now()
      logTiming('SessionStore.destroy %s: %dms', sid, (end - start).toFixed(3))
      callback?.()
    } catch (err) {
      callback?.(err)
    }
  }

  length(callback: (err: unknown, length?: number) => void): void {
    try {
      const row = this.#lengthStmt.get()
      if (!row) {
        callback(undefined, 0)
        return
      }
      callback(undefined, row.count)
    } catch (err) {
      callback(err, undefined)
    }
  }

  all(callback: (err: unknown, obj?: SessionData[] | null) => void): void {
    try {
      const rows = this.#allStmt.all()
      if (!rows) {
        callback(undefined, undefined)
        return
      }
      const sessions: SessionData[] = rows.map(row => JSON.parse(row.data))

      callback(undefined, sessions)
    } catch (err) {
      callback(err, undefined)
    }
  }

  clear(callback?: (err?: unknown) => void): void {
    try {
      this.#clearStmt.run()
      callback?.()
    } catch (err) {
      callback?.(err)
    }
  }

  touch(_sid: string, _session: SessionData, callback?: () => void): void {
    // Disable touch, just make sessions longer
    callback?.()

    // const expires = new Date(Date.now() + this.#age).toISOString()

    // try {
    //   const start = performance.now()
    //   this.#touchStmt.run({ sid, expires })
    //   const end = performance.now()
    //   logTiming('SessionStore.touch %s: %dms', sid, (end - start).toFixed(3))
    //   callback?.()
    // } catch (err) {
    //   callback?.()
    // }
  }
}
