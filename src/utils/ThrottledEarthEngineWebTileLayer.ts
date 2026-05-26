import { subclass } from '@arcgis/core/core/accessorSupport/decorators';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';

/** Limit parallel EE tile requests — bursts are a common cause of HTTP 429. */
const MAX_CONCURRENT_EE_TILES = 2

const waitQueue = []
let inFlight = 0

function acquireEarthEngineSlot():void | Promise<void> {
  return new Promise((resolve) => {
    const grant = () => {
      inFlight++
      resolve()
    }
    if (inFlight < MAX_CONCURRENT_EE_TILES) {
      grant()
    } else {
      waitQueue.push(grant)
    }
  })
}

function releaseEarthEngineSlot(): void {
  inFlight--
  const next = waitQueue.shift()
  if (next) next()
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }
    const id = window.setTimeout(resolve, ms)
    const onAbort = () => {
      window.clearTimeout(id)
      reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(e: unknown): boolean {
  return e instanceof Error && e.name === 'AbortError'
}

function is429(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const details = (e as { details? }).details
  return details?.httpStatus === 429
}

function retryAfterMs(e: unknown): number | null {
  const details = (e as { details? }).details
  const raw = details?.getHeader?.('retry-after')
  if (!raw) return null
  const sec = Number.parseInt(String(raw).trim(), 10)
  if (Number.isNaN(sec) || sec < 0) return null
  return sec * 1000
}

function backoffMs(attempt: number, e: unknown): number {
  const fromHeader = retryAfterMs(e)
  if (fromHeader != null) return Math.min(60_000, Math.max(250, fromHeader))
  return Math.min(30_000, 400 * 2 ** attempt)
}

const ThrottledEarthEngineWebTileLayer = subclass(
  'app.layers.ThrottledEarthEngineWebTileLayer',
)(
  class extends WebTileLayer {
    override fetchTile(
      level: number,
      row: number,
      col: number,
      options?: { signal?: AbortSignal },
    ): Promise<HTMLImageElement> {
      return (async () => {
        await acquireEarthEngineSlot()
        try {
          const maxAttempts = 12
          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
              return await super.fetchTile(level, row, col, options)
            } catch (e) {
              if (isAbortError(e)) throw e
              if (is429(e) && attempt < maxAttempts - 1) {
                await sleep(backoffMs(attempt, e), options?.signal ?? undefined)
                continue
              }
              throw e
            }
          }
          throw new Error('Earth Engine tile fetch: max retries exceeded')
        } finally {
          releaseEarthEngineSlot()
        }
      })()
    }
  },
)

export default ThrottledEarthEngineWebTileLayer
