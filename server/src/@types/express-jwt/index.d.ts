import * as jwt from 'express-jwt'

declare module 'express-jwt' {
  export class UnauthorizedError extends Error {
    name: 'UnauthorizedError'
    message: string
    code: any
    status: number
    inner: Error
  }
}
