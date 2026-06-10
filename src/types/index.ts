// src/types/index.ts
import type { RequestFormData } from '../components/RequestBuilder/schema'

export type HttpMethod = RequestFormData['method']

// bodyIsJson — флаг формы для валидации, в config'е он не нужен:
// worker всё равно шлёт body как строку.
export type RequestConfig = Omit<RequestFormData, 'headers' | 'bodyIsJson'> & {
  headers: Record<string, string>
}

export interface RequestResult {
  id: string
  status: number // HTTP статус или 0 если network error
  latency: number // ms от отправки до получения ответа
  timestamp: number // Date.now() когда завершился
  error?: string // сообщение если упал
}

export interface RunStats {
  avg: number
  min: number
  max: number
  p95: number
  p99: number
  rps: number // requests per second
  // Классификация статусов:
  //   2xx          → ok (в долях не показываем явно — это "всё остальное")
  //   3xx          → redirectRate (warn: fetch обычно сам следует, попадание 3xx сюда = аномалия)
  //   4xx/5xx/0    → errorRate
  // Разделение нужно, чтобы то, что лог подсвечивает жёлтым (warn), было
  // отражено и числом в метриках — иначе юзер видит warn в логе и не понимает,
  // почему "Ошибки = 0%".
  errorRate: number // 0–100 процентов
  redirectRate: number // 0–100 процентов
  completed: number
  total: number
}

export type RunStatus = 'idle' | 'running' | 'completed' | 'stopped'

// Протокол общения с Web Worker.
// Main → Worker: RUN с конфигом прогона. Stop делается через worker.terminate(),
// отдельного сообщения STOP не нужно.
// Worker → Main: RESULTS пачкой результатов (батчинг — см. requestWorker.ts),
// DONE по окончании всего прогона.
export type WorkerInMessage = { type: 'RUN'; config: RequestConfig }
export type WorkerOutMessage =
  | { type: 'RESULTS'; results: RequestResult[] }
  | { type: 'DONE' }
  | { type: 'ERROR'; message: string }
