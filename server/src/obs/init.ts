import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME, ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { metrics } from '@opentelemetry/api'
import { env } from '../utils/env.js'

const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'aguasoft',
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env,
  }),
)

const metricExporter = new OTLPMetricExporter()

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10_000, // 10s
})

const meterProvider = new MeterProvider({
  resource: resource,
  readers: [metricReader],
})

metrics.setGlobalMeterProvider(meterProvider)
