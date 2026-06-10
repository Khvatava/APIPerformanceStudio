// src/workers/requestWorker.ts

import type {
  WorkerInMessage,
  WorkerOutMessage,
  RequestConfig,
  RequestResult,
  HttpMethod,
} from '../types'

// Дублирует константу из formDataToConfig — на этой стороне нет доступа
// к импорту через ../components/... (worker — это другой граф зависимостей,
// тащить React-компоненты сюда нельзя). Минимальное дублирование оправдано.
const METHODS_WITH_BODY: ReadonlyArray<HttpMethod> = ['POST', 'PUT', 'PATCH']

const BATCH_SIZE = 50
const BATCH_INTERVAL_MS = 100

let buffer: RequestResult[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function flush() {
  if (flushTimer !== null) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  if (buffer.length === 0) return
  const msg: WorkerOutMessage = { type: 'RESULTS', results: buffer }
  self.postMessage(msg)
  buffer = []
}

function pushResult(result: RequestResult) {
  buffer.push(result)
  if (buffer.length >= BATCH_SIZE) {
    flush()
  } else if (flushTimer === null) {
    flushTimer = setTimeout(flush, BATCH_INTERVAL_MS)
  }
}

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  if (e.data.type !== 'RUN') return

  const { config } = e.data
  let remaining = config.totalRequests

  // Async-пул: создаём N "корутин" (на самом деле обычных async-функций
  // в общем event loop'е worker'а). Каждая в цикле выгребает следующую задачу
  // из общего счётчика remaining и дёргает fetch.
  //
  // Race condition'а на remaining-- нет: JS однопоточный, между чтением,
  // декрементом и записью не может вклиниться другая корутина.
  // Другая корутина получит управление только на await runRequest(...).
  //
  // Promise.all ждёт, пока все N корутин не закончат свой while.
  await Promise.all(
    Array.from({ length: config.concurrency }, async () => {
      while (remaining > 0) {
        remaining--
        const result = await runRequest(config)
        pushResult(result)
      }
    }),
  )

  flush()

  const done: WorkerOutMessage = { type: 'DONE' }
  self.postMessage(done)
}

async function runRequest(config: RequestConfig): Promise<RequestResult> {
  const start = performance.now()
  try {
    // Страховка от GET/DELETE с body — fetch иначе бросит TypeError
    const canHaveBody = METHODS_WITH_BODY.includes(config.method)
    const res = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: canHaveBody ? config.body : undefined,
    })
    return {
      id: crypto.randomUUID(),
      status: res.status,
      latency: Math.round(performance.now() - start),
      timestamp: Date.now(),
    }
  } catch (err) {
    return {
      id: crypto.randomUUID(),
      status: 0,
      latency: Math.round(performance.now() - start),
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}
