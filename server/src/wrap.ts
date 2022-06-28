import { Request, Response } from 'express'

export class AppError extends Error {
  code: number
  slug: string

  constructor(
    message: string,
    slug = 'unknown',
    code = 500
  ) {
    super(message)
    this.slug = slug
    this.code = code
  }
}

export type Handler = (req: Request) => unknown

export const wrap = (handler: Handler) =>
  (req: Request, res: Response): void => {
    (async () => {
      try {
        const body = await handler(req)
        res.json(body)
      } catch (err) {
        if (!(err instanceof AppError)) {
          // This works no matter the type of err, ts is
          // just being really pedantic
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const message = err?.message as unknown
          res
            .status(500)
            .json({ message })
          return
        }

        const { code, message, slug } = err
        res
          .status(code)
          .json({ message, slug })
      }
    })()
  }
