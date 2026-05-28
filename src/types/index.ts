// src/types/index.ts
import type { RequestFormData } from '../components/RequestBuilder/schema'

export type HttpMethod = RequestFormData['method']

export type RequestConfig = Omit<RequestFormData, 'headers'> & {
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
  errorRate: number // 0–100 процентов
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
