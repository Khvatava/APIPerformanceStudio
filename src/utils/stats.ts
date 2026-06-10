import type { RequestResult, RunStats } from '../types'

export function calcStats(results: RequestResult[], total = 0): RunStats {
  if (results.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      p95: 0,
      p99: 0,
      rps: 0,
      errorRate: 0,
      redirectRate: 0,
      completed: 0,
      total,
    }
  }

  const latencies = results.map(r => r.latency).sort((a, b) => a - b)
  const errors = results.filter(r => r.status === 0 || r.status >= 400)
  const redirects = results.filter(r => r.status >= 300 && r.status < 400)
  const sum = latencies.reduce((a, b) => a + b, 0)

  const p95idx = Math.floor(latencies.length * 0.95)
  const p99idx = Math.floor(latencies.length * 0.99)

  const timestamps = results.map(r => r.timestamp)
  const duration = (Math.max(...timestamps) - Math.min(...timestamps)) / 1000
  const rps = duration > 0 ? results.length / duration : results.length

  return {
    avg: Math.round(sum / latencies.length),
    min: latencies[0],
    max: latencies[latencies.length - 1],
    p95: latencies[p95idx] ?? latencies[latencies.length - 1],
    p99: latencies[p99idx] ?? latencies[latencies.length - 1],
    rps: Math.round(rps * 10) / 10,
    errorRate: Math.round((errors.length / results.length) * 1000) / 10,
    redirectRate: Math.round((redirects.length / results.length) * 1000) / 10,
    completed: results.length,
    total: total || results.length,
  }
}
