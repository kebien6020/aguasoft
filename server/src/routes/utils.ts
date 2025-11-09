import debug from 'debug'
import type { Request, Response, NextFunction } from 'ultimate-express'
import { time as utilsTime } from '../utils/benckmark.js'
import { userRoleStmt } from '../db2/users.js'

const timingLog = debug('app:timing')
const time = utilsTime(timingLog)

export type ExpressHandler =
  (req: Request, res: Response, next: NextFunction) => void | Promise<void>

export type SuccessBody = { success: true }

export interface ErrorBody {
  success: false
  error: {
    message: string
    code: string
    // On validation_error
    errors?: {
      path: string
      name: string
    }[]
  }
}

export type SuccessRes<T> = { status: 200, body: T & SuccessBody }
export type Handler<T> = (req: Request) => Promise<SuccessRes<T>>

export const ok = <T>(body?: T): SuccessRes<T> => ({
  status: 200,
  body: body,
} as SuccessRes<T>)

export class AppError extends Error {
  status = 500
  code = 'unknown'
}

export class NotFoundError extends AppError {
  status = 404
  code = 'not_found'
}

export class UnauthorizedError extends AppError {
  status = 401
  code = 'unauthorized'
}

export const wrap = <T>(hnd: Handler<T>): ExpressHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const endTime = time(`${req.method} ${req.originalUrl}`)
    try {
      const appRes = await hnd(req)
      const status = appRes.status ?? 200
      res.status(status).json(appRes.body)
    } catch (err) {
      if (err instanceof AppError) {
        const body: ErrorBody = {
          error: err,
          success: false,
        }
        res.status(err.status).json(body)
        return
      }

      console.warn(err)
      next(err)
    } finally {
      endTime()
    }
  }

export const wrapSync = <T>(hnd: (req: Request) => SuccessRes<T>): ExpressHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const endTime = time(`${req.method} ${req.originalUrl}`)
    try {
      const appRes = hnd(req)
      const status = appRes.status ?? 200
      res.status(status).json(appRes.body)
    } catch (err) {
      if (err instanceof AppError) {
        const body: ErrorBody = {
          error: {
            code: err.code,
            message: err.message,
          },
          success: false,
        }
        res.status(err.status).json(body)
        return
      }
      console.warn(err)
      next(err)
    } finally {
      endTime()
    }
  }

export const requireAdmin = (req: Request) => {
  const id = req.session?.userId
  if (!id)
    throw new UnauthorizedError('Authentication required')

  const user = userRoleStmt.get({ id })
  if (!user)
    throw new UnauthorizedError('User not found')

  if (user.role !== 'admin')
    throw new UnauthorizedError('Admin access required')
}
