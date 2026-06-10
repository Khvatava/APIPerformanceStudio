import type { RequestFormData } from '../components/RequestBuilder/schema'

export type HttpMethod = RequestFormData['method']

export type RequestConfig = Omit<RequestFormData, 'headers' | 'bodyIsJson'> & {
  headers: Record<string, string>
}

export interface RequestResult {
  id: string
  status: number 
  latency: number
  timestamp: number 
  error?: string 
}

export interface RunStats {
  avg: number
  min: number
  max: number
  p95: number
  p99: number
  rps: number 
  errorRate: number 
  redirectRate: number 
  completed: number
  total: number
}

export type RunStatus = 'idle' | 'running' | 'completed' | 'stopped'

export type WorkerInMessage = { type: 'RUN'; config: RequestConfig }
export type WorkerOutMessage =
  | { type: 'RESULTS'; results: RequestResult[] }
  | { type: 'DONE' }
  | { type: 'ERROR'; message: string }
