import type { Request, Response, NextFunction } from 'ultimate-express'

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

export const ok = <T extends Record<string, unknown>>(body?: T): SuccessRes<T> => ({
  status: 200,
  body: {
    ...body,
    success: true,
  },
} as SuccessRes<T>)

export class AppError extends Error {
  status = 500
  code = 'unknown'
}

export const wrap = <T>(hnd: Handler<T>): ExpressHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
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
    }
  }
