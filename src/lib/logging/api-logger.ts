type LogLevel = 'info' | 'warn' | 'error'

type EndpointStats = {
  totalRequests: number
  serverErrorCount: number
}

type CompleteRequestLogParams = {
  status: number
  userId?: string | null
  error?: unknown
  metadata?: Record<string, unknown>
}

type StartRequestLogParams = {
  route?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

const endpointStats = new Map<string, EndpointStats>()

const SERVICE_NAME = process.env.DD_SERVICE || process.env.LOG_SERVICE_NAME || 'cardsense-api'
const DEPLOY_ENV =
  process.env.DD_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
const SERVICE_VERSION =
  process.env.DD_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || process.env.npm_package_version || 'unknown'

const toIsoTimestamp = () => new Date().toISOString()

const serializeError = (error: unknown) => {
  if (!error) return null
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }
  if (typeof error === 'object') return error
  return { message: String(error) }
}

const emit = (level: LogLevel, event: string, payload: Record<string, unknown>) => {
  const entry = {
    timestamp: toIsoTimestamp(),
    level,
    event,
    service: SERVICE_NAME,
    env: DEPLOY_ENV,
    version: SERVICE_VERSION,
    ...payload,
  }

  const json = JSON.stringify(entry)
  if (level === 'error') {
    console.error(json)
    return
  }
  if (level === 'warn') {
    console.warn(json)
    return
  }
  console.info(json)
}

const toStatusClass = (status: number) => `${Math.floor(status / 100)}xx`

const getStatsKey = (method: string, endpoint: string) => `${method.toUpperCase()} ${endpoint}`

const updateStats = (method: string, endpoint: string, status: number) => {
  const key = getStatsKey(method, endpoint)
  const previous = endpointStats.get(key) ?? {
    totalRequests: 0,
    serverErrorCount: 0,
  }

  previous.totalRequests += 1
  if (status >= 500) {
    previous.serverErrorCount += 1
  }
  endpointStats.set(key, previous)

  const errorRate = previous.totalRequests > 0
    ? previous.serverErrorCount / previous.totalRequests
    : 0

  return {
    endpointUsageCount: previous.totalRequests,
    endpointServerErrorCount: previous.serverErrorCount,
    endpointServerErrorRate: Number(errorRate.toFixed(4)),
  }
}

const getPathname = (request: Request, fallback?: string) => {
  if (fallback) return fallback
  try {
    return new URL(request.url).pathname
  } catch {
    return 'unknown'
  }
}

export const startApiRequestLog = (
  request: Request,
  params: StartRequestLogParams = {}
) => {
  const startedAt = Date.now()
  const endpoint = getPathname(request, params.route)
  const method = request.method.toUpperCase()
  const requestId = params.requestId || crypto.randomUUID()

  emit('info', 'api.request.start', {
    requestId,
    endpoint,
    method,
    ...params.metadata,
  })

  const complete = ({
    status,
    userId = null,
    error,
    metadata = {},
  }: CompleteRequestLogParams) => {
    const latencyMs = Date.now() - startedAt
    const metrics = updateStats(method, endpoint, status)
    const hasServerError = status >= 500 || Boolean(error)

    emit(hasServerError ? 'error' : 'info', 'api.request.complete', {
      requestId,
      endpoint,
      method,
      status,
      statusClass: toStatusClass(status),
      latencyMs,
      userId,
      ...metrics,
      ...metadata,
      ...(error ? { error: serializeError(error) } : {}),
    })
  }

  return {
    requestId,
    endpoint,
    method,
    complete,
  }
}

export const logApiEvent = (
  level: LogLevel,
  event: string,
  payload: Record<string, unknown> = {}
) => {
  emit(level, event, payload)
}
