import type { Request, RequestHandler, Response } from 'express'
import type { Params } from 'express-serve-static-core'

type RequestHandlerWithoutNext<P extends Params, ResBody, ReqBody, ReqQuery> =
  (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>) => Promise<unknown>

export function handleErrors<
  P extends Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown
>(
  handler: RequestHandlerWithoutNext<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return ((req, res, next) => {
    (async () => {
      try {
        await handler(req, res)
      } catch (err) {
        next(err)
      }
    })()
  })
}

