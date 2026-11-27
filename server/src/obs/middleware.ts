import { NextFunction, Request, Response } from 'ultimate-express'
import { Attributes, metrics } from '@opentelemetry/api'
import './init.js'
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions'

const meter = metrics.getMeter('global')

// Follows https://opentelemetry.io/docs/specs/semconv/http/http-metrics/#metric-httpserverrequestduration
interface ReqHistogramAttributes extends Attributes {
  [ATTR_HTTP_REQUEST_METHOD]: string
  [ATTR_URL_SCHEME]: string
  [ATTR_ERROR_TYPE]?: string
  [ATTR_HTTP_RESPONSE_STATUS_CODE]: number
  [ATTR_HTTP_ROUTE]?: string
}

const reqHistogram = meter.createHistogram<ReqHistogramAttributes>('http.server.request.duration', {
  description: 'Duration of HTTP server requests.',
  unit: 's',
  advice: {
    explicitBucketBoundaries: [0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10],
  },
})

interface ObsExtendedRequest extends Request {
  errorForObs?: Error
}

export const obsMiddleware = (req: ObsExtendedRequest, res: Response, next: NextFunction) => {
  const start = performance.now()
  res.on('finish', () => {
    const durSeconds = (performance.now() - start) / 1000
    const error = req.errorForObs as Error | undefined
    reqHistogram.record(durSeconds, {
      [ATTR_HTTP_REQUEST_METHOD]: req.method,
      [ATTR_URL_SCHEME]: 'http',
      [ATTR_HTTP_RESPONSE_STATUS_CODE]: res.statusCode,
      [ATTR_HTTP_ROUTE]: req.baseUrl + req.route.path,
      ...(error ? { [ATTR_ERROR_TYPE]: error?.name ?? 'unk' } : {}),
    })
  })

  next()
}

export const obsErrorMiddleware = (error: Error, req: ObsExtendedRequest, res: Response, next: NextFunction) => {
  req.errorForObs = error
  next(error)
}
